import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  addPassage,
  deletePassage,
  getMaterialPassages,
  updatePassage,
} from "@/entities/problem-set/api/repository";
import type { GenerationRequest, PassageResponse, ProfileResponse } from "@/entities/problem-set/api/repository";
import { generatableTypes, questionTypeLabel } from "@/entities/problem-set/model/labels";
import type { ProblemSetResponse } from "@/entities/problem-set/model/types";
import { resolveWorkspaceId } from "@/entities/workspace/api/repository";
import { resolveConfirmedProfile } from "@/pages/problem-set/model/generationWorkflow";
import { waitForMaterialSplit } from "@/pages/problem-set/model/workflow";
import { Button } from "@/shared/ui/Button/Button";
import { Select } from "@/shared/ui/Select/Select";

type GeneratableType = (typeof generatableTypes)[number];
type PerPassage = NonNullable<GenerationRequest["perPassage"]>;

export interface GenerationSelection {
  profileId: number;
  passages: PassageResponse[];
  perPassage: PerPassage;
}

interface TypeSetting {
  enabled: boolean;
  count: number;
  blankCount: number;
  firstLetterHint: boolean;
  minWords: number;
  errorCount: number;
}

const MAX_PASSAGES = 20;
const MAX_TYPES = 4;
const SHORT_PASSAGE_WORDS = 60;

function initialSettings(mix: Record<string, number>): Record<GeneratableType, TypeSetting> {
  return Object.fromEntries(
    generatableTypes.map((type) => [
      type,
      {
        enabled: (mix[type] ?? 0) > 0,
        count: Math.min(Math.max(mix[type] ?? 1, 1), 5),
        blankCount: 2,
        firstLetterHint: false,
        minWords: 12,
        errorCount: 1,
      },
    ]),
  ) as Record<GeneratableType, TypeSetting>;
}

function toPerPassage(settings: Record<GeneratableType, TypeSetting>): PerPassage {
  return generatableTypes
    .filter((type) => settings[type].enabled)
    .map((type) => {
      const setting = settings[type];
      const options =
        type === "SUMMARY_BLANK"
          ? { blankCount: setting.blankCount, firstLetterHint: setting.firstLetterHint }
          : type === "SENTENCE_ORDER"
            ? { minWords: setting.minWords }
            : type === "GRAMMAR_FIX"
              ? { errorCount: setting.errorCount }
              : undefined;
      return { type, count: setting.count, ...(options ? { options } : {}) };
    });
}

function PassageEditor({
  passage,
  onCancel,
  onSave,
}: {
  passage?: PassageResponse;
  onCancel: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(passage?.title ?? "");
  const [content, setContent] = useState(passage?.content ?? "");
  const [saving, setSaving] = useState(false);
  const key = passage?.id ?? "new";
  return (
    <div className="passage-editor">
      <input
        id={`passage-title-${key}`}
        maxLength={300}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="지문 제목 (선택)"
        value={title}
      />
      <textarea
        id={`passage-content-${key}`}
        maxLength={10000}
        onChange={(event) => setContent(event.target.value)}
        placeholder="지문 영어 원문"
        rows={6}
        value={content}
      />
      <div className="passage-editor__actions">
        <Button disabled={saving} onClick={onCancel} type="button" variant="outline">
          취소
        </Button>
        <Button
          disabled={saving || !content.trim()}
          onClick={() => {
            setSaving(true);
            void onSave(title.trim(), content).finally(() => setSaving(false));
          }}
          type="button"
          variant="primary"
        >
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

export function GenerationStage({
  data,
  back,
  onGenerate,
  generating,
  progress,
}: {
  data: ProblemSetResponse;
  back: () => void;
  onGenerate: (selection: GenerationSelection) => void;
  generating: boolean;
  progress: number;
}) {
  const materialIds = data.materialIds;
  const materialKey = materialIds.join(",");
  const materialNames = new Map(data.files.map((file) => [Number(file.id), file.name]));
  const [passages, setPassages] = useState<PassageResponse[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<GeneratableType, TypeSetting>>(initialSettings({}));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 고른 자료들의 지문(분리가 끝날 때까지 기다림)과 확정 프로필(유형 구성 기본값)을 불러온다
  // 일부 자료가 실패해도 나머지 자료의 지문은 쓸 수 있게 한다
  useEffect(() => {
    const ids = materialKey ? materialKey.split(",").map(Number) : [];
    if (ids.length === 0) return;
    let active = true;
    Promise.allSettled(
      ids.map(async (id) => {
        const material = await waitForMaterialSplit(id);
        if (material.status === "FAILED") {
          throw new Error(material.failureReason ?? "자료에서 지문을 분리하지 못했습니다.");
        }
        return getMaterialPassages(id);
      }),
    ).then((results) => {
      if (!active) return;
      const items = results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
      const failures = results.flatMap((result, index) =>
        result.status === "rejected"
          ? [`${materialNames.get(ids[index]) ?? `자료 ${ids[index]}`}: ${
              result.reason instanceof Error ? result.reason.message : "지문을 불러오지 못했습니다."
            }`]
          : [],
      );
      setPassages(items);
      setSelected(new Set(items.slice(0, MAX_PASSAGES).map((item) => item.id)));
      setLoadError(failures.length ? failures.join(" / ") : null);
    });
    resolveWorkspaceId()
      .then((workspaceId) => resolveConfirmedProfile(workspaceId))
      .then((confirmed) => {
        if (!active) return;
        setProfile(confirmed);
        setSettings(initialSettings(confirmed.typeMixPerPassage));
      })
      .catch((cause: unknown) => {
        if (active) setProfileError(cause instanceof Error ? cause.message : "확정된 출제 프로필을 불러오지 못했습니다.");
      });
    return () => {
      active = false;
    };
    // 자료 이름은 오류 문구에만 쓰므로 고른 자료가 바뀔 때만 다시 불러온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialKey]);

  function toggle(passageId: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(passageId)) next.delete(passageId);
      else if (next.size < MAX_PASSAGES) next.add(passageId);
      return next;
    });
  }

  function updateSetting(type: GeneratableType, patch: Partial<TypeSetting>) {
    setSettings((current) => ({ ...current, [type]: { ...current[type], ...patch } }));
  }

  async function savePassage(target: PassageResponse | undefined, title: string, content: string) {
    // 직접 추가한 지문은 첫 번째로 고른 자료에 넣는다
    const materialId = materialIds[0];
    if (materialId === undefined) return;
    setActionError(null);
    try {
      if (target) {
        const updated = await updatePassage(target.id, content, title);
        setPassages((current) => (current ?? []).map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await addPassage(materialId, content, title || undefined);
        setPassages((current) => [...(current ?? []), created]);
        setSelected((current) => (current.size < MAX_PASSAGES ? new Set(current).add(created.id) : current));
      }
      setEditing(null);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "지문을 저장하지 못했습니다.");
    }
  }

  async function removePassage(target: PassageResponse) {
    setActionError(null);
    try {
      await deletePassage(target.id);
      setPassages((current) => (current ?? []).filter((item) => item.id !== target.id));
      setSelected((current) => {
        const next = new Set(current);
        next.delete(target.id);
        return next;
      });
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "지문을 삭제하지 못했습니다.");
    }
  }

  const perPassage = toPerPassage(settings);
  const perPassageCount = perPassage.reduce((sum, item) => sum + item.count, 0);
  const selectedPassages = (passages ?? []).filter((item) => selected.has(item.id));
  const total = selectedPassages.length * perPassageCount;
  const canGenerate =
    !generating && profile !== null && selectedPassages.length > 0 && perPassage.length > 0 && perPassage.length <= MAX_TYPES;

  return (
    <>
      <div className="stage-grid generation-grid">
        <section className="set-card selected-material">
          <div className="set-card-heading">
            <h2>지문 선택</h2>
            <span className="accent-badge">
              {selectedPassages.length} / {passages?.length ?? 0}개 선택
            </span>
          </div>
          <p className="field-help">문제를 만들 지문을 고르세요 (최대 {MAX_PASSAGES}개). 고른 순서대로 시험지에 들어갑니다.</p>
          {loadError && <p className="generation-error">{loadError}</p>}
          {!passages && !loadError && <p className="field-help">지문을 나누고 불러오는 중입니다. 30초~1분 걸릴 수 있습니다.</p>}
          {actionError && <p className="generation-error">{actionError}</p>}
          <ol className="passage-list">
            {(passages ?? []).map((passage) => (
              <li className={selected.has(passage.id) ? "is-selected" : undefined} key={passage.id}>
                {editing === passage.id ? (
                  <PassageEditor
                    onCancel={() => setEditing(null)}
                    onSave={(title, content) => savePassage(passage, title, content)}
                    passage={passage}
                  />
                ) : (
                  <>
                    <label className="passage-list__head">
                      <input
                        checked={selected.has(passage.id)}
                        id={`passage-${passage.id}`}
                        onChange={() => toggle(passage.id)}
                        type="checkbox"
                      />
                      <strong>{passage.title || `지문 ${passage.orderNo}`}</strong>
                      <small>
                        {materialIds.length > 1 && `${materialNames.get(passage.materialId) ?? `자료 ${passage.materialId}`} · `}
                        {passage.wordCount ?? 0}단어
                        {(passage.wordCount ?? 0) < SHORT_PASSAGE_WORDS && " · 짧아서 문항이 단조로울 수 있음"}
                        {passage.edited && " · 수정함"}
                      </small>
                    </label>
                    <p>{passage.content}</p>
                    <div className="passage-list__actions">
                      <Button disabled={generating} onClick={() => setEditing(passage.id)} type="button" variant="text">
                        수정
                      </Button>
                      <Button disabled={generating} onClick={() => void removePassage(passage)} type="button" variant="text">
                        삭제
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
          {editing === "new" ? (
            <PassageEditor onCancel={() => setEditing(null)} onSave={(title, content) => savePassage(undefined, title, content)} />
          ) : (
            passages && (
              <Button disabled={generating} onClick={() => setEditing("new")} type="button" variant="outline">
                + 지문 직접 추가
              </Button>
            )
          )}
        </section>
        <div className="generation-main">
          <section className="set-card generation-settings">
            <h2>지문 1개당 유형 구성</h2>
            {profile ? (
              <p className="field-help">
                기본값은 확정 출제 프로필 v{profile.version}의 구성입니다. 유형은 {MAX_TYPES}개까지, 유형별 1~5문항.
              </p>
            ) : profileError ? (
              <p className="generation-error">
                {profileError} <Link to="/profile">출제 프로필로 가기</Link>
              </p>
            ) : (
              <p className="field-help">확정 출제 프로필을 불러오는 중입니다.</p>
            )}
            <div className="type-settings">
              {generatableTypes.map((type) => {
                const setting = settings[type];
                return (
                  <div className={`type-setting${setting.enabled ? " is-enabled" : ""}`} key={type}>
                    <label className="type-setting__head">
                      <input
                        checked={setting.enabled}
                        id={`type-${type}`}
                        onChange={(event) => updateSetting(type, { enabled: event.target.checked })}
                        type="checkbox"
                      />
                      <strong>{questionTypeLabel(type)}</strong>
                    </label>
                    {setting.enabled && (
                      <div className="type-setting__options">
                        <label>
                          문항 수
                          <input
                            id={`type-${type}-count`}
                            max={5}
                            min={1}
                            onChange={(event) => updateSetting(type, { count: Math.min(5, Math.max(1, Number(event.target.value) || 1)) })}
                            type="number"
                            value={setting.count}
                          />
                        </label>
                        {type === "SUMMARY_BLANK" && (
                          <>
                            <label>
                              빈칸 수
                              <input
                                id={`type-${type}-blanks`}
                                max={6}
                                min={1}
                                onChange={(event) =>
                                  updateSetting(type, { blankCount: Math.min(6, Math.max(1, Number(event.target.value) || 1)) })
                                }
                                type="number"
                                value={setting.blankCount}
                              />
                            </label>
                            <label className="type-setting__check">
                              <input
                                checked={setting.firstLetterHint}
                                id={`type-${type}-hint`}
                                onChange={(event) => updateSetting(type, { firstLetterHint: event.target.checked })}
                                type="checkbox"
                              />
                              첫 글자 힌트
                            </label>
                          </>
                        )}
                        {type === "SENTENCE_ORDER" && (
                          <label>
                            대상 문장 최소 단어
                            <input
                              id={`type-${type}-words`}
                              max={40}
                              min={5}
                              onChange={(event) =>
                                updateSetting(type, { minWords: Math.min(40, Math.max(5, Number(event.target.value) || 5)) })
                              }
                              type="number"
                              value={setting.minWords}
                            />
                          </label>
                        )}
                        {type === "GRAMMAR_FIX" && (
                          <label>
                            틀린 곳 수
                            <Select
                              aria-label="틀린 곳 수"
                              size="compact"
                              id={`type-${type}-errors`}
                              onValueChange={(value) => updateSetting(type, { errorCount: Number(value) })}
                              value={setting.errorCount}
                              options={[{ value: 1, label: "1개" }, { value: 2, label: "2개" }]}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="generation-total">
              지문 {selectedPassages.length}개 × {perPassageCount}문항 = <b>{total}문항</b>
            </p>
          </section>
          <section className="set-card progress-card">
            <div className="set-card-heading">
              <h2>AI 생성 진행</h2>
              <span className={generating ? "accent-badge" : "success-badge"}>
                {generating ? "생성 중..." : progress >= 100 ? "생성 완료" : "대기"}
              </span>
            </div>
            <div className="progress-title">
              <b>{progress}%</b>
            </div>
            <div className="wide-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <p className="field-help">문항마다 AI가 만들고 → 규칙 검증 → 블라인드 풀이로 정답을 확인합니다.</p>
          </section>
        </div>
      </div>
      <div className="set-actions">
        <Button variant="secondary" onClick={back}>
          자료 입력으로
        </Button>
        <Button
          disabled={!canGenerate}
          onClick={() => profile && onGenerate({ profileId: profile.id, passages: selectedPassages, perPassage })}
          variant="primary"
        >
          {total > 0 ? `${total}문항 생성하기` : "문제 생성하기"}
        </Button>
      </div>
    </>
  );
}
