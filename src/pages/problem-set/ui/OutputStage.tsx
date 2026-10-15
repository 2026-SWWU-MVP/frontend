import { useEffect, useState } from "react";

import {
  createWorksheet,
  deleteWorksheet,
  getWorksheet,
  listWorksheets,
  updateWorksheet,
} from "@/entities/problem-set/api/repository";
import type { WorksheetResponse, WorksheetSummary } from "@/entities/problem-set/api/repository";
import { questionTypeLabel } from "@/entities/problem-set/model/labels";
import type { ProblemQuestion, ProblemSetResponse } from "@/entities/problem-set/model/types";
import { resolveWorkspaceId } from "@/entities/workspace/api/repository";
import { downloadProblemWorksheet } from "@/pages/problem-set/model/outputWorkflow";
import { formatDateTime } from "@/shared/lib/date";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";

const MAX_PROBLEMS = 50;

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/** 서버가 묶어 준 시험지 미리보기 (지문마다 문항 번호 1부터) */
function Preview({ worksheet, academyName }: { worksheet: WorksheetResponse; academyName: string }) {
  return (
    <div className="paper">
      <div className="paper-top">
        <strong>{worksheet.showLogo ? academyName : ""}</strong>
        <small>{worksheet.headerText ?? ""}</small>
      </div>
      <h2>{worksheet.title}</h2>
      {worksheet.sections.map((section) => (
        <div className="paper-section" key={section.order}>
          <p className="paper-passage">
            {section.passageTitle && <strong>[{section.passageTitle}] </strong>}
            {section.passageText}
          </p>
          {section.items.map((item) => (
            <div className="paper-question" key={item.problem.id}>
              <strong>
                {item.no}. {item.problem.stem}
              </strong>
              {(item.problem.conditions ?? []).length > 0 && (
                <span className="paper-conditions">[조건] {(item.problem.conditions ?? []).join(" / ")}</span>
              )}
              {item.problem.body && <span className="paper-body">{item.problem.body}</span>}
              {(item.problem.choices ?? []).length > 0 && (
                <span>[보기] {(item.problem.choices ?? []).join(" / ")}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function OutputStage({
  data,
  academy,
  restart,
}: {
  data: ProblemSetResponse;
  academy: { name?: string | null; hasLogo?: boolean | null } | null;
  restart: () => void;
}) {
  const accepted = data.questions.filter((question) => question.reviewStatus === "ACCEPTED");
  const [order, setOrder] = useState<ProblemQuestion[]>(accepted);
  const [included, setIncluded] = useState<Set<string>>(new Set(accepted.map((question) => question.id)));
  const [title, setTitle] = useState(data.title || "문제 세트");
  const [headerText, setHeaderText] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [worksheet, setWorksheet] = useState<WorksheetResponse | null>(null);
  const [worksheets, setWorksheets] = useState<WorksheetSummary[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const academyName = academy?.name ?? "학원";

  const refreshList = async () => setWorksheets(await listWorksheets(await resolveWorkspaceId()));

  useEffect(() => {
    let active = true;
    resolveWorkspaceId()
      .then((workspaceId) => listWorksheets(workspaceId))
      .then((items) => active && setWorksheets(items))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function run(action: () => Promise<void>, fallback: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(errorMessage(cause, fallback));
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, delta: number) {
    setOrder((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const selectedIds = order.filter((question) => included.has(question.id)).map((question) => Number(question.id));

  const create = () =>
    run(async () => {
      if (!title.trim()) throw new Error("시험지 제목을 입력해 주세요.");
      if (selectedIds.length === 0) throw new Error("시험지에 넣을 문항을 골라 주세요.");
      if (selectedIds.length > MAX_PROBLEMS) throw new Error(`시험지에는 ${MAX_PROBLEMS}문항까지 넣을 수 있습니다.`);
      const created = await createWorksheet(await resolveWorkspaceId(), {
        title: title.trim(),
        headerText: headerText.trim() || undefined,
        showLogo,
        problemIds: selectedIds,
      });
      setWorksheet(await getWorksheet(created.id));
      await refreshList();
    }, "시험지를 만들지 못했습니다.");

  const saveSettings = (current: WorksheetResponse) =>
    run(async () => {
      if (!title.trim()) throw new Error("시험지 제목을 입력해 주세요.");
      setWorksheet(await updateWorksheet(current.id, { title: title.trim(), headerText: headerText.trim(), showLogo }));
      await refreshList();
    }, "시험지 설정을 저장하지 못했습니다.");

  const open = (worksheetId: number) =>
    run(async () => {
      const loaded = await getWorksheet(worksheetId);
      setWorksheet(loaded);
      setTitle(loaded.title);
      setHeaderText(loaded.headerText ?? "");
      setShowLogo(loaded.showLogo);
    }, "시험지를 불러오지 못했습니다.");

  const remove = (worksheetId: number) =>
    run(async () => {
      await deleteWorksheet(worksheetId);
      if (worksheet?.id === worksheetId) setWorksheet(null);
      setConfirmDelete(null);
      await refreshList();
    }, "시험지를 삭제하지 못했습니다.");

  const download = (worksheetId: number, answer: boolean) =>
    run(() => downloadProblemWorksheet(worksheetId, answer), "PDF를 내려받지 못했습니다.");

  return (
    <>
      <div className="output-status">
        <span className={worksheet ? "success-badge" : "accent-badge"}>{worksheet ? "시험지 완성" : "시험지 구성"}</span>
        <small>
          {worksheet
            ? `${worksheet.problemCount}문항 · 지문 ${worksheet.sections.length}개 · 같은 지문 문항은 자동으로 모이고 번호는 지문마다 1부터`
            : "채택한 문항 중 시험지에 넣을 문항과 순서를 고르세요."}
        </small>
      </div>
      {error && (
        <p className="generation-error" role="alert">
          {error}
        </p>
      )}

      <div className="stage-grid output-grid">
        <section className="preview-wrap">
          {worksheet ? (
            <>
              <div className="preview-tabs">
                <strong>문제지 미리보기</strong>
                <small>PDF와 같은 구성</small>
              </div>
              <Preview academyName={academyName} worksheet={worksheet} />
            </>
          ) : (
            <div className="set-card worksheet-picker">
              <h2>
                시험지에 넣을 문항 ({selectedIds.length} / {order.length})
              </h2>
              {order.length === 0 && <p className="field-help">채택한 문항이 없습니다. 검수 화면에서 문항을 채택해 주세요.</p>}
              <ol>
                {order.map((question, index) => (
                  <li className={included.has(question.id) ? "is-selected" : undefined} key={question.id}>
                    <label>
                      <input
                        checked={included.has(question.id)}
                        id={`worksheet-item-${question.id}`}
                        onChange={() =>
                          setIncluded((current) => {
                            const next = new Set(current);
                            if (next.has(question.id)) next.delete(question.id);
                            else next.add(question.id);
                            return next;
                          })
                        }
                        type="checkbox"
                      />
                      <span>
                        <strong>
                          {question.type ? questionTypeLabel(question.type) : question.stageLabel}
                        </strong>
                        <small>{question.passageTitle ?? "지문"} · {question.prompt}</small>
                      </span>
                    </label>
                    <span className="worksheet-picker__move">
                      <button aria-label="위로" disabled={index === 0} onClick={() => move(index, -1)} type="button">
                        ↑
                      </button>
                      <button
                        aria-label="아래로"
                        disabled={index === order.length - 1}
                        onClick={() => move(index, 1)}
                        type="button"
                      >
                        ↓
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="field-help">같은 지문의 문항은 저장할 때 첫 문항 위치로 모입니다.</p>
            </div>
          )}
        </section>

        <aside className="output-aside">
          <section className="set-card worksheet-settings">
            <h2>시험지 정보</h2>
            <label htmlFor="worksheet-title">제목</label>
            <input
              id="worksheet-title"
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
            <label htmlFor="worksheet-header">머리글</label>
            <input
              id="worksheet-header"
              maxLength={200}
              onChange={(event) => setHeaderText(event.target.value)}
              placeholder="예: 1학기 중간고사 서술형 대비 - 교과서 2과"
              value={headerText}
            />
            <label className="worksheet-settings__check">
              <input
                checked={showLogo}
                id="worksheet-logo"
                onChange={(event) => setShowLogo(event.target.checked)}
                type="checkbox"
              />
              학원 로고 넣기{academy?.hasLogo === false && " (로고가 없으면 학원 이름이 들어갑니다)"}
            </label>
            {worksheet ? (
              <Button disabled={busy} onClick={() => void saveSettings(worksheet)} variant="secondary">
                설정 저장
              </Button>
            ) : (
              <Button disabled={busy || selectedIds.length === 0} onClick={() => void create()} variant="primary">
                {busy ? "만드는 중..." : `${selectedIds.length}문항으로 시험지 만들기`}
              </Button>
            )}
          </section>

          {worksheet && (
            <section className="set-card pdf-card">
              <h2>PDF 출력</h2>
              <div className="pdf-file">
                <Icon name="files" size={18} tone="accent" />
                <div>
                  <strong>문제지</strong>
                  <small>지문·문항 포함 · 정답 미포함</small>
                </div>
              </div>
              <Button disabled={busy} onClick={() => void download(worksheet.id, false)} variant="primary">
                문제지 PDF 다운로드
              </Button>
              <hr />
              <div className="pdf-file">
                <Icon name="files" size={18} tone="accent" />
                <div>
                  <strong>정답·해설지</strong>
                  <small>정답 및 해설 포함</small>
                </div>
              </div>
              <Button disabled={busy} onClick={() => void download(worksheet.id, true)} variant="secondary">
                정답·해설지 PDF 다운로드
              </Button>
            </section>
          )}

          <section className="set-card worksheet-list">
            <h2>이 워크스페이스의 시험지 ({worksheets.length})</h2>
            {worksheets.length === 0 && <p className="field-help">아직 만든 시험지가 없습니다.</p>}
            <ul>
              {worksheets.map((item) => (
                <li className={worksheet?.id === item.id ? "is-active" : undefined} key={item.id}>
                  <button className="worksheet-list__open" disabled={busy} onClick={() => void open(item.id)} type="button">
                    <strong>{item.title}</strong>
                    <small>
                      {item.problemCount}문항 · {item.createdByName ?? "-"} · {formatDateTime(item.createdAt)}
                    </small>
                  </button>
                  <span className="worksheet-list__actions">
                    <Button disabled={busy} onClick={() => void download(item.id, false)} variant="text">
                      문제지
                    </Button>
                    <Button disabled={busy} onClick={() => void download(item.id, true)} variant="text">
                      정답지
                    </Button>
                    {confirmDelete === item.id ? (
                      <>
                        <Button disabled={busy} onClick={() => void remove(item.id)} variant="text">
                          삭제 확인
                        </Button>
                        <Button disabled={busy} onClick={() => setConfirmDelete(null)} variant="text">
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button disabled={busy} onClick={() => setConfirmDelete(item.id)} variant="text">
                        삭제
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="output-tip">
        {worksheet && (
          <Button disabled={busy} onClick={() => setWorksheet(null)} variant="secondary">
            문항 다시 고르기
          </Button>
        )}
        <Button variant="primary" onClick={restart}>
          처음부터 다시 시작
        </Button>
      </div>
    </>
  );
}
