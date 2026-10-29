import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  confirmProfile,
  createProfile,
  getProfile,
  listProfiles,
  recheckProfile,
  sendProfileFeedback,
  updateProfile,
} from "@/entities/problem-set/api/repository";
import type {
  ProfileResponse,
  ProfileRule,
  ProfileSummaryResponse,
  RuleCategory,
} from "@/entities/problem-set/api/repository";
import {
  generatableTypes,
  profileOriginLabels,
  profileStatusLabels,
  questionTypeLabel,
  ruleCategoryLabels,
  ruleSourceLabels,
} from "@/entities/problem-set/model/labels";
import { getWorkspaceId } from "@/shared/auth/workspace";
import { Badge } from "@/shared/ui/Badge/Badge";
import type { BadgeTone } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Select } from "@/shared/ui/Select/Select";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";

import "./ProfilePage.css";

type Busy = "create" | "feedback" | "recheck" | "edit" | "confirm" | "version" | null;

interface EditableRule {
  id?: string;
  text: string;
  category: RuleCategory;
  overridden: boolean;
  source: ProfileRule["source"];
}

const statusTone: Record<ProfileResponse["status"], BadgeTone> = {
  DRAFT: "review",
  CONFIRMED: "success",
  SUPERSEDED: "neutral",
};

const busyMessages: Record<Exclude<Busy, null>, string> = {
  create: "기출을 분석해 출제 프로필을 만들고 있습니다. 수십 초 걸릴 수 있습니다.",
  feedback: "강사 의견을 반영한 새 초안을 만들고 있습니다.",
  recheck: "AI가 프로필을 다시 검토하고 있습니다.",
  edit: "수정한 내용으로 새 초안을 만들고 있습니다.",
  confirm: "프로필을 확정하고 있습니다.",
  version: "버전을 불러오고 있습니다.",
};

const MAX_RULES = 20;
const MAX_PER_PASSAGE = 5;

function percent(ratio: number | null | undefined) {
  return ratio === null || ratio === undefined ? "-" : `${Math.round(ratio * 100)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

function mixTotal(mix: Record<string, number>) {
  return Object.values(mix).reduce((sum, count) => sum + (count || 0), 0);
}

export function ProfilePage() {
  const workspaceId = getWorkspaceId();
  const [summaries, setSummaries] = useState<ProfileSummaryResponse[] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [noteText, setNoteText] = useState("");
  const [notePersistent, setNotePersistent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftRules, setDraftRules] = useState<EditableRule[]>([]);
  const [draftMix, setDraftMix] = useState<Record<string, number>>({});

  useEffect(() => {
    if (workspaceId === null) return;
    let active = true;
    listProfiles(workspaceId)
      .then(async (items) => {
        // 가장 최근 버전(검토 중 초안이 있으면 그 초안)을 먼저 보여준다
        const latest = [...items].sort((a, b) => b.version - a.version)[0];
        const detail = latest ? await getProfile(latest.id) : null;
        if (!active) return;
        setSummaries(items);
        setProfile(detail);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setSummaries([]);
        setError(errorMessage(cause, "출제 프로필을 불러오지 못했습니다."));
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);

  if (workspaceId === null) {
    return (
      <PageContainer>
        <div className="profile-empty">
          <h1>출제 프로필</h1>
          <p>워크스페이스를 먼저 선택해 주세요.</p>
          <Link className="button button--primary" to="/workspace">
            워크스페이스 선택하기
          </Link>
        </div>
      </PageContainer>
    );
  }

  async function run(kind: Exclude<Busy, null>, action: () => Promise<ProfileResponse>, fallback: string) {
    if (busy || workspaceId === null) return;
    setBusy(kind);
    setError(null);
    try {
      const next = await action();
      const items = await listProfiles(workspaceId);
      setSummaries(items);
      setProfile(next);
      setEditing(false);
      return next;
    } catch (cause) {
      setError(errorMessage(cause, fallback));
    } finally {
      setBusy(null);
    }
  }

  function startEdit(current: ProfileResponse) {
    setDraftRules(
      current.rules.map((rule) => ({
        id: rule.id,
        text: rule.text,
        category: rule.category,
        overridden: rule.overridden,
        source: rule.source,
      })),
    );
    setDraftMix(
      Object.fromEntries(generatableTypes.map((type) => [type, current.typeMixPerPassage[type] ?? 0])),
    );
    setEditing(true);
    setError(null);
  }

  async function saveEdit(current: ProfileResponse) {
    const rules = draftRules.map((rule) => ({ ...rule, text: rule.text.trim() }));
    if (rules.some((rule) => rule.text.length === 0)) {
      setError("비어 있는 규칙이 있습니다. 내용을 입력하거나 삭제해 주세요.");
      return;
    }
    const total = mixTotal(draftMix);
    if (total < 1 || total > MAX_PER_PASSAGE) {
      setError(`지문당 유형 구성은 합계 1~${MAX_PER_PASSAGE}문항이어야 합니다. (지금 ${total}문항)`);
      return;
    }
    const typeMixPerPassage = Object.fromEntries(Object.entries(draftMix).filter(([, count]) => count > 0));
    await run(
      "edit",
      () =>
        updateProfile(current.id, {
          rules: rules.map(({ id, text, category, overridden }) => ({ id, text, category, overridden })),
          typeMixPerPassage,
        }),
      "수정 내용을 저장하지 못했습니다.",
    );
  }

  async function sendFeedback(current: ProfileResponse) {
    const text = noteText.trim();
    if (!text) {
      setError("반영할 의견을 입력해 주세요.");
      return;
    }
    const next = await run(
      "feedback",
      () => sendProfileFeedback(current.id, text, notePersistent),
      "강사 의견을 반영하지 못했습니다.",
    );
    if (next) {
      setNoteText("");
      setNotePersistent(false);
    }
  }

  async function selectVersion(profileId: number) {
    if (busy) return;
    setBusy("version");
    setError(null);
    try {
      setProfile(await getProfile(profileId));
      setEditing(false);
    } catch (cause) {
      setError(errorMessage(cause, "버전을 불러오지 못했습니다."));
    } finally {
      setBusy(null);
    }
  }

  const loading = summaries === null;
  const confirmed = summaries?.find((item) => item.status === "CONFIRMED") ?? null;

  return (
    <PageContainer>
      <div className="profile-page">
        <header className="profile-heading">
          <div>
            <h1>출제 프로필</h1>
            <p>기출에서 찾은 이 학교의 출제 방식입니다. 검토하고 확정하면 문제 생성에 쓰입니다.</p>
          </div>
          {profile && summaries && summaries.length > 0 && (
            <div className="profile-heading__actions">
              <label className="profile-version">
                <span>버전</span>
                <Select
                  aria-label="프로필 버전"
                  disabled={busy !== null}
                  id="profile-version"
                  onValueChange={(value) => void selectVersion(Number(value))}
                  value={profile.id}
                  options={[...summaries]
                    .sort((a, b) => b.version - a.version)
                    .map((item) => ({ value: item.id, label: `v${item.version} · ${profileStatusLabels[item.status]} · ${profileOriginLabels[item.origin]}` }))}
                />
              </label>
              {profile.status === "DRAFT" && (
                <Button
                  disabled={busy !== null || editing}
                  onClick={() => void run("confirm", () => confirmProfile(profile.id), "프로필을 확정하지 못했습니다.")}
                  variant="primary"
                >
                  이 버전으로 확정
                </Button>
              )}
            </div>
          )}
        </header>

        {error && (
          <p className="profile-alert profile-alert--error" role="alert">
            {error}
          </p>
        )}
        {busy && busy !== "version" && (
          <p className="profile-alert" role="status">
            {busyMessages[busy]}
          </p>
        )}

        {loading && <p className="profile-muted">출제 프로필을 불러오는 중입니다.</p>}

        {!loading && !profile && (
          <section className="profile-card profile-empty">
            <h2>아직 출제 프로필이 없습니다</h2>
            <p>
              기출을 올려 분석하면 이 학교의 출제 유형·조건·배점을 정리한 프로필을 만들 수 있습니다. 우리 학원 기출이
              없어도 학교 DB에 다른 학원 기출이 있으면 만들어집니다.
            </p>
            <div className="profile-empty__actions">
              <Button
                disabled={busy !== null}
                onClick={() => void run("create", () => createProfile(workspaceId), "프로필을 만들지 못했습니다.")}
                variant="primary"
              >
                기출로 프로필 만들기
              </Button>
              <Link className="button button--secondary" to="/problem-sets?source=past-exam">
                기출 올리러 가기
              </Link>
            </div>
          </section>
        )}

        {profile && (
          <>
            <section className="profile-summary">
              <div className="profile-summary__title">
                <strong>v{profile.version}</strong>
                <Badge tone={statusTone[profile.status]}>{profileStatusLabels[profile.status]}</Badge>
                <span>{profileOriginLabels[profile.origin]}</span>
              </div>
              <p className="profile-muted">
                {profile.createdByName ?? "-"} · {formatDate(profile.createdAt)}
                {profile.confirmedAt && ` · ${profile.confirmedByName ?? "-"} 확정 ${formatDate(profile.confirmedAt)}`}
              </p>
              {profile.status === "DRAFT" && confirmed && confirmed.id !== profile.id && (
                <p className="profile-muted">
                  지금 문제 생성에 쓰이는 버전은 확정본 v{confirmed.version}입니다. 이 초안을 확정하면 이 버전으로 바뀝니다.
                </p>
              )}
              {profile.status !== "CONFIRMED" && !confirmed && (
                <p className="profile-muted">확정된 프로필이 없어 아직 문제를 생성할 수 없습니다.</p>
              )}
              {profile.changeSummary.length > 0 && (
                <ul className="profile-changes">
                  {profile.changeSummary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </section>

            <div className="profile-grid">
              <div className="profile-column">
                <section className="profile-card">
                  <h2>기출 통계</h2>
                  <p className="profile-muted">
                    기출 {profile.stats.examCount}회분 · {profile.stats.totalQuestions}문항
                    {profile.stats.schoolDbExamCount ? ` · 학교 DB ${profile.stats.schoolDbExamCount}회분 함께 반영` : ""}
                  </p>
                  <dl className="profile-stats">
                    <div>
                      <dt>객관식</dt>
                      <dd>{profile.stats.objectiveCount}</dd>
                    </div>
                    <div>
                      <dt>서술형</dt>
                      <dd>{profile.stats.subjectiveCount}</dd>
                    </div>
                    <div>
                      <dt>서술형 비율</dt>
                      <dd>{percent(profile.stats.subjectiveRatio)}</dd>
                    </div>
                    <div>
                      <dt>서술형 배점 비중</dt>
                      <dd>{percent(profile.stats.subjectivePointsRatio)}</dd>
                    </div>
                  </dl>
                  {Object.keys(profile.stats.typeCounts).length > 0 && (
                    <table className="profile-table">
                      <thead>
                        <tr>
                          <th>유형</th>
                          <th>문항 수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(profile.stats.typeCounts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => (
                            <tr key={type}>
                              <td>{questionTypeLabel(type)}</td>
                              <td>{count}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                  {profile.stats.frequentConditions.length > 0 && (
                    <div className="profile-conditions">
                      <strong>자주 나온 [조건]</strong>
                      <ul>
                        {profile.stats.frequentConditions.map((condition) => (
                          <li key={condition.text}>
                            {condition.text} <span>({condition.count}회)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                <section className="profile-card">
                  <h2>지문당 유형 구성</h2>
                  <p className="profile-muted">문제를 만들 때 지문 1개마다 이 구성으로 생성합니다.</p>
                  {editing ? (
                    <div className="profile-mix-edit">
                      {generatableTypes.map((type) => (
                        <label key={type}>
                          <span>{questionTypeLabel(type)}</span>
                          <input
                            id={`mix-${type}`}
                            max={MAX_PER_PASSAGE}
                            min={0}
                            onChange={(event) =>
                              setDraftMix((mix) => ({ ...mix, [type]: Math.max(0, Number(event.target.value) || 0) }))
                            }
                            type="number"
                            value={draftMix[type] ?? 0}
                          />
                        </label>
                      ))}
                      <p className="profile-muted">합계 {mixTotal(draftMix)}문항 (1~{MAX_PER_PASSAGE})</p>
                    </div>
                  ) : (
                    <div className="profile-chips">
                      {Object.entries(profile.typeMixPerPassage).map(([type, count]) => (
                        <span className="profile-chip" key={type}>
                          {questionTypeLabel(type)} {count}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                {(profile.sourceExams.length > 0 || profile.examples.length > 0) && (
                  <section className="profile-card">
                    <h2>분석에 쓴 기출</h2>
                    {profile.sourceExams.length > 0 ? (
                      <ul className="profile-plain-list">
                        {profile.sourceExams.map((exam) => (
                          <li key={exam.id}>{exam.title}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="profile-muted">우리 학원 기출 없이 학교 DB 경향으로 만들었습니다.</p>
                    )}
                    {profile.examples.length > 0 && (
                      <details className="profile-examples">
                        <summary>AI에게 보여줄 대표 서술형 문항 {profile.examples.length}개</summary>
                        {profile.examples.map((example) => (
                          <div className="profile-example" key={example.id}>
                            <strong>
                              {example.label} · {questionTypeLabel(example.type)}
                            </strong>
                            <p>{example.stem}</p>
                            {example.body && <p className="profile-example__body">{example.body}</p>}
                            {example.conditions.length > 0 && (
                              <p className="profile-muted">[조건] {example.conditions.join(" / ")}</p>
                            )}
                            {example.answer && <p className="profile-muted">정답: {example.answer}</p>}
                          </div>
                        ))}
                      </details>
                    )}
                  </section>
                )}
              </div>

              <div className="profile-column">
                <section className="profile-card">
                  <div className="profile-card__heading">
                    <h2>출제 규칙 {editing ? draftRules.length : profile.rules.length}개</h2>
                    {editing ? (
                      <div className="profile-card__buttons">
                        <Button disabled={busy !== null} onClick={() => setEditing(false)} variant="outline">
                          취소
                        </Button>
                        <Button disabled={busy !== null} onClick={() => void saveEdit(profile)} variant="primary">
                          새 초안으로 저장
                        </Button>
                      </div>
                    ) : (
                      <Button disabled={busy !== null} onClick={() => startEdit(profile)} variant="secondary">
                        직접 수정
                      </Button>
                    )}
                  </div>

                  {editing ? (
                    <div className="profile-rules-edit">
                      {draftRules.map((rule, index) => (
                        <div className="profile-rule-edit" key={rule.id ?? `new-${index}`}>
                          <div className="profile-rule-edit__meta">
                            <span className={`profile-source profile-source--${rule.source}`}>
                              {ruleSourceLabels[rule.source]}
                            </span>
                            <Select
                              aria-label={`규칙 ${index + 1} 분류`}
                              size="compact"
                              id={`rule-category-${index}`}
                              onValueChange={(value) =>
                                setDraftRules((rules) =>
                                  rules.map((item, i) =>
                                    i === index ? { ...item, category: value as RuleCategory } : item,
                                  ),
                                )
                              }
                              value={rule.category}
                              options={Object.entries(ruleCategoryLabels).map(([value, label]) => ({ value, label }))}
                            />
                            <label className="profile-check">
                              <input
                                checked={rule.overridden}
                                id={`rule-overridden-${index}`}
                                onChange={(event) =>
                                  setDraftRules((rules) =>
                                    rules.map((item, i) =>
                                      i === index ? { ...item, overridden: event.target.checked } : item,
                                    ),
                                  )
                                }
                                type="checkbox"
                              />
                              이번 시험에 적용 안 함
                            </label>
                            <Button
                              onClick={() => setDraftRules((rules) => rules.filter((_, i) => i !== index))}
                              variant="text"
                            >
                              삭제
                            </Button>
                          </div>
                          <textarea
                            id={`rule-text-${index}`}
                            maxLength={300}
                            onChange={(event) =>
                              setDraftRules((rules) =>
                                rules.map((item, i) => (i === index ? { ...item, text: event.target.value } : item)),
                              )
                            }
                            rows={2}
                            value={rule.text}
                          />
                        </div>
                      ))}
                      <Button
                        disabled={draftRules.length >= MAX_RULES}
                        onClick={() =>
                          setDraftRules((rules) => [
                            ...rules,
                            { text: "", category: "OTHER", overridden: false, source: "TEACHER" },
                          ])
                        }
                        variant="outline"
                      >
                        + 강사 규칙 추가
                      </Button>
                      <p className="profile-muted">저장하면 이 버전은 그대로 두고 새 초안 버전이 만들어집니다.</p>
                    </div>
                  ) : (
                    <ol className="profile-rules">
                      {profile.rules.map((rule) => (
                        <li className={rule.overridden ? "is-overridden" : undefined} key={rule.id}>
                          <div className="profile-rule__meta">
                            <span className={`profile-source profile-source--${rule.source}`}>
                              {ruleSourceLabels[rule.source]}
                            </span>
                            <span>{ruleCategoryLabels[rule.category]}</span>
                            {rule.overridden && <span className="profile-overridden">이번 시험 미적용</span>}
                          </div>
                          <p>{rule.text}</p>
                          {rule.evidence.length > 0 && (
                            <p className="profile-evidence">근거: {rule.evidence.map((item) => item.label).join(", ")}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>

                <section className="profile-card">
                  <h2>강사 의견</h2>
                  {profile.teacherNotes.length > 0 && (
                    <ul className="profile-notes">
                      {profile.teacherNotes.map((note, index) => (
                        <li key={`${note.text}-${index}`}>
                          <p>{note.text}</p>
                          <span className="profile-muted">
                            {note.createdByName ?? "-"} · {note.persistent ? "다음 시험에도 적용" : "이번 시험만"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <label className="profile-field" htmlFor="profile-note">
                    현장에서 들은 정보를 적어 주세요
                  </label>
                  <textarea
                    disabled={busy !== null || editing}
                    id="profile-note"
                    maxLength={1000}
                    onChange={(event) => setNoteText(event.target.value)}
                    placeholder="예: 이번 서술형은 어구 배열 위주로 낸다고 하심"
                    rows={3}
                    value={noteText}
                  />
                  <label className="profile-check">
                    <input
                      checked={notePersistent}
                      disabled={busy !== null || editing}
                      id="profile-note-persistent"
                      onChange={(event) => setNotePersistent(event.target.checked)}
                      type="checkbox"
                    />
                    다음 시험 분석에도 계속 적용
                  </label>
                  <div className="profile-card__buttons">
                    <Button
                      disabled={busy !== null || editing}
                      onClick={() =>
                        void run("recheck", () => recheckProfile(profile.id), "AI 재검토를 하지 못했습니다.")
                      }
                      variant="outline"
                    >
                      AI 재검토
                    </Button>
                    <Button
                      disabled={busy !== null || editing}
                      onClick={() => void sendFeedback(profile)}
                      variant="primary"
                    >
                      의견 반영
                    </Button>
                  </div>
                  <p className="profile-muted">의견 반영·AI 재검토는 새 초안 버전을 만듭니다. 바뀐 점을 확인한 뒤 확정해 주세요.</p>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
