import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  analyzePastExam,
  deletePastExam,
  getPastExamQuestions,
  listPastExams,
  updatePastPassage,
  updatePastQuestion,
} from "@/entities/problem-set/api/repository";
import type {
  PastExamExtractionResponse,
  PastExamResponse,
  PastQuestionResponse,
  UpdatePastQuestionRequest,
} from "@/entities/problem-set/api/repository";
import {
  examTypeLabels,
  pastExamStatusLabels,
  questionTypeLabel,
  questionTypeLabels,
} from "@/entities/problem-set/model/labels";
import { resolveWorkspaceId } from "@/entities/workspace/api/repository";
import { waitForPastExamExtraction } from "@/pages/problem-set/model/workflow";
import { formatDateTime } from "@/shared/lib/date";
import { Button } from "@/shared/ui/Button/Button";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";

import "./PastExamsPage.css";

type Passage = PastExamExtractionResponse["passages"][number];

function examTitle(exam: PastExamResponse) {
  return `${exam.examYear ?? "-"}년 ${exam.semester ?? "-"}학기 ${examTypeLabels[exam.examType ?? ""] ?? ""}`;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

function Issues({ issues }: { issues?: string[] }) {
  if (!issues || issues.length === 0) return null;
  return (
    <ul className="extract-issues">
      {issues.map((issue) => (
        <li key={issue}>{issue}</li>
      ))}
    </ul>
  );
}

function PassageCard({
  passage,
  busy,
  onSave,
}: {
  passage: Passage;
  busy: boolean;
  onSave: (title: string, text: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(passage.title ?? "");
  const [text, setText] = useState(passage.text);
  return (
    <article className={`extract-card${passage.issues.length ? " has-issues" : ""}`}>
      <div className="extract-card__head">
        <strong>{passage.code}</strong>
        <span>{passage.title}</span>
        {passage.edited && <span className="extract-chip">수정함</span>}
        {passage.issues.length > 0 && <span className="extract-chip extract-chip--issue">이슈 {passage.issues.length}</span>}
        {!editing && (
          <Button disabled={busy} onClick={() => setEditing(true)} variant="text">
            수정
          </Button>
        )}
      </div>
      <Issues issues={passage.issues} />
      {editing ? (
        <div className="extract-edit">
          <label htmlFor={`past-passage-title-${passage.id}`}>제목</label>
          <input id={`past-passage-title-${passage.id}`} onChange={(event) => setTitle(event.target.value)} value={title} />
          <label htmlFor={`past-passage-text-${passage.id}`}>본문</label>
          <textarea
            id={`past-passage-text-${passage.id}`}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            value={text}
          />
          <div className="extract-edit__actions">
            <Button disabled={busy} onClick={() => setEditing(false)} variant="outline">
              취소
            </Button>
            <Button
              disabled={busy || !text.trim()}
              onClick={() => void onSave(title, text).then((saved) => saved && setEditing(false))}
              variant="primary"
            >
              저장
            </Button>
          </div>
        </div>
      ) : (
        <p className="extract-text">{passage.text}</p>
      )}
    </article>
  );
}

function QuestionCard({
  question,
  busy,
  onSave,
}: {
  question: PastQuestionResponse;
  busy: boolean;
  onSave: (request: UpdatePastQuestionRequest) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState(question.type ?? "");
  const [stem, setStem] = useState(question.stem ?? "");
  const [body, setBody] = useState(question.body ?? "");
  const [conditions, setConditions] = useState((question.conditions ?? []).join("\n"));
  const [choices, setChoices] = useState((question.choices ?? []).join("\n"));
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [points, setPoints] = useState(question.points === undefined || question.points === null ? "" : String(question.points));
  const issues = question.issues ?? [];
  const id = question.id;

  return (
    <article className={`extract-card${issues.length ? " has-issues" : ""}`}>
      <div className="extract-card__head">
        <strong>
          {question.section === "SUBJECTIVE" ? "서술형" : "객관식"} {question.no}번
        </strong>
        <span className="extract-chip">{questionTypeLabel(question.type ?? "")}</span>
        <span>
          {(question.passageCodes ?? []).join(", ")}
          {question.points ? ` · ${question.points}점` : ""}
        </span>
        {question.edited && <span className="extract-chip">수정함</span>}
        {issues.length > 0 && <span className="extract-chip extract-chip--issue">이슈 {issues.length}</span>}
        {!editing && (
          <Button disabled={busy} onClick={() => setEditing(true)} variant="text">
            수정
          </Button>
        )}
      </div>
      <Issues issues={issues} />
      {editing ? (
        <div className="extract-edit">
          <label htmlFor={`past-q-type-${id}`}>유형</label>
          <select id={`past-q-type-${id}`} onChange={(event) => setType(event.target.value)} value={type}>
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor={`past-q-stem-${id}`}>발문</label>
          <textarea id={`past-q-stem-${id}`} onChange={(event) => setStem(event.target.value)} rows={2} value={stem} />
          <label htmlFor={`past-q-body-${id}`}>본문</label>
          <textarea id={`past-q-body-${id}`} onChange={(event) => setBody(event.target.value)} rows={3} value={body} />
          <label htmlFor={`past-q-conditions-${id}`}>[조건] (한 줄에 하나)</label>
          <textarea
            id={`past-q-conditions-${id}`}
            onChange={(event) => setConditions(event.target.value)}
            rows={2}
            value={conditions}
          />
          <label htmlFor={`past-q-choices-${id}`}>보기·선택지 (한 줄에 하나)</label>
          <textarea id={`past-q-choices-${id}`} onChange={(event) => setChoices(event.target.value)} rows={3} value={choices} />
          <div className="extract-edit__row">
            <span>
              <label htmlFor={`past-q-answer-${id}`}>정답</label>
              <input id={`past-q-answer-${id}`} onChange={(event) => setAnswer(event.target.value)} value={answer} />
            </span>
            <span>
              <label htmlFor={`past-q-points-${id}`}>배점</label>
              <input
                id={`past-q-points-${id}`}
                min={0}
                onChange={(event) => setPoints(event.target.value)}
                step={0.5}
                type="number"
                value={points}
              />
            </span>
          </div>
          <div className="extract-edit__actions">
            <Button disabled={busy} onClick={() => setEditing(false)} variant="outline">
              취소
            </Button>
            <Button
              disabled={busy || !stem.trim()}
              onClick={() =>
                void onSave({
                  type,
                  stem: stem.trim(),
                  body,
                  conditions: lines(conditions),
                  choices: lines(choices),
                  answer,
                  ...(points.trim() ? { points: Number(points) } : { clearPoints: true }),
                }).then((saved) => saved && setEditing(false))
              }
              variant="primary"
            >
              저장
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="extract-stem">{question.stem}</p>
          {question.body && <p className="extract-text">{question.body}</p>}
          {(question.conditions ?? []).length > 0 && (
            <p className="extract-muted">[조건] {(question.conditions ?? []).join(" / ")}</p>
          )}
          {(question.choices ?? []).length > 0 && (
            <p className="extract-muted">{(question.choices ?? []).join("   ")}</p>
          )}
          {question.answer && <p className="extract-muted">정답: {question.answer}</p>}
        </>
      )}
    </article>
  );
}

export function PastExamsPage() {
  const [exams, setExams] = useState<PastExamResponse[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [extraction, setExtraction] = useState<PastExamExtractionResponse | null>(null);
  const [filter, setFilter] = useState<"all" | "issues" | "subjective">("all");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    resolveWorkspaceId()
      .then((workspaceId) => listPastExams(workspaceId))
      .then((items) => {
        if (!active) return;
        setExams(items);
        const latest = items.find((item) => item.status === "EXTRACTED") ?? items[0];
        if (latest) setSelectedId(latest.id);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setExams([]);
        setError(errorMessage(cause, "기출 목록을 불러오지 못했습니다."));
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = exams?.find((exam) => exam.id === selectedId) ?? null;
  const selectedStatus = selected?.status;

  useEffect(() => {
    if (selectedId === null || selectedStatus !== "EXTRACTED") return;
    let active = true;
    getPastExamQuestions(selectedId)
      .then((result) => active && setExtraction(result))
      .catch((cause: unknown) => active && setError(errorMessage(cause, "추출 결과를 불러오지 못했습니다.")));
    return () => {
      active = false;
    };
  }, [selectedId, selectedStatus]);

  function select(examId: number) {
    setSelectedId(examId);
    setExtraction(null);
    setConfirmDelete(false);
    setError(null);
  }

  async function run(action: () => Promise<void>, fallback: string) {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (cause) {
      setError(errorMessage(cause, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const replaceExam = (exam: PastExamResponse) =>
    setExams((current) => (current ?? []).map((item) => (item.id === exam.id ? { ...item, ...exam } : item)));

  const analyze = (exam: PastExamResponse) =>
    run(async () => {
      await analyzePastExam(exam.id);
      replaceExam({ ...exam, status: "EXTRACTING" });
      const done = await waitForPastExamExtraction(exam.id, (status) => replaceExam({ ...exam, status }));
      replaceExam(done);
      if (done.status === "FAILED") throw new Error(done.failureReason ?? "기출을 분석하지 못했습니다.");
    }, "기출을 분석하지 못했습니다.");

  const remove = (exam: PastExamResponse) =>
    run(async () => {
      await deletePastExam(exam.id);
      const rest = (exams ?? []).filter((item) => item.id !== exam.id);
      setExams(rest);
      setExtraction(null);
      setConfirmDelete(false);
      setSelectedId(rest[0]?.id ?? null);
    }, "기출을 삭제하지 못했습니다.");

  const questions = (extraction?.questions ?? []).filter((question) =>
    filter === "issues"
      ? (question.issues ?? []).length > 0
      : filter === "subjective"
        ? question.section === "SUBJECTIVE"
        : true,
  );
  const passages = (extraction?.passages ?? []).filter((passage) => filter !== "issues" || passage.issues.length > 0);

  return (
    <PageContainer>
      <div className="past-exams-page">
        <header className="past-exams-heading">
          <div>
            <h1>기출</h1>
            <p>AI가 기출 PDF에서 뽑아낸 지문·문항을 확인하고 고칩니다. 점검에서 이슈가 나온 곳을 원본과 비교해 주세요.</p>
          </div>
          <div className="past-exams-heading__actions">
            <Link className="button button--secondary" to="/problem-sets">
              기출 올리기
            </Link>
            <Link className="button button--primary" to="/profile">
              출제 프로필로
            </Link>
          </div>
        </header>

        {error && (
          <p className="past-exams-alert" role="alert">
            {error}
          </p>
        )}

        <div className="past-exams-layout">
          <aside className="past-exams-list">
            <h2>기출 시험지 {exams ? `(${exams.length})` : ""}</h2>
            {exams === null && <p className="extract-muted">불러오는 중입니다.</p>}
            {exams?.length === 0 && (
              <p className="extract-muted">
                아직 올린 기출이 없습니다. <Link to="/problem-sets">문제 세트 › 기출 업로드</Link>에서 올려 주세요.
              </p>
            )}
            <ul>
              {(exams ?? []).map((exam) => (
                <li key={exam.id}>
                  <button
                    className={exam.id === selectedId ? "is-active" : undefined}
                    onClick={() => select(exam.id)}
                    type="button"
                  >
                    <strong>{examTitle(exam)}</strong>
                    <small>
                      <span className={`past-status past-status--${exam.status}`}>{pastExamStatusLabels[exam.status]}</span>
                      {exam.status === "EXTRACTED" && ` 객관식 ${exam.objectiveCount ?? 0} · 서술형 ${exam.subjectiveCount ?? 0}`}
                    </small>
                    <small>
                      {exam.originalFilename}
                      {exam.scanned ? " · 스캔본" : ""}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="past-exams-detail">
            {selected && (
              <div className="past-exams-detail__head">
                <div>
                  <h2>{examTitle(selected)}</h2>
                  <p className="extract-muted">
                    {selected.originalFilename} · {selected.pageCount ?? "-"}쪽 · {selected.createdByName ?? "-"} ·{" "}
                    {formatDateTime(selected.createdAt)}
                  </p>
                </div>
                <div className="past-exams-detail__actions">
                  {(selected.status === "UPLOADED" || selected.status === "FAILED") && (
                    <Button disabled={busy} onClick={() => void analyze(selected)} variant="primary">
                      {selected.status === "FAILED" ? "다시 분석" : "분석 시작"}
                    </Button>
                  )}
                  {selected.status === "EXTRACTED" && (
                    <Button disabled={busy} onClick={() => void analyze(selected)} variant="outline">
                      다시 추출
                    </Button>
                  )}
                  {confirmDelete ? (
                    <>
                      <Button disabled={busy} onClick={() => void remove(selected)} variant="secondary">
                        삭제 확인
                      </Button>
                      <Button disabled={busy} onClick={() => setConfirmDelete(false)} variant="text">
                        취소
                      </Button>
                    </>
                  ) : (
                    <Button disabled={busy} onClick={() => setConfirmDelete(true)} variant="text">
                      삭제
                    </Button>
                  )}
                </div>
              </div>
            )}

            {selected?.status === "EXTRACTING" && <p className="past-exams-alert past-exams-alert--info">AI가 기출을 분석하고 있습니다. 1~2분 걸립니다.</p>}
            {selected?.status === "FAILED" && (
              <p className="past-exams-alert">분석에 실패했습니다: {selected.failureReason ?? "원인을 알 수 없습니다."}</p>
            )}
            {selected?.status === "UPLOADED" && <p className="extract-muted">아직 분석 전입니다. "분석 시작"을 눌러 주세요.</p>}
            {confirmDelete && <p className="extract-muted">삭제하면 추출 결과와 학교 DB 통계에서도 빠집니다.</p>}

            {extraction && (
              <>
                <div className="extract-summary">
                  <span className={`extract-chip${extraction.issueCount ? " extract-chip--issue" : ""}`}>
                    점검 이슈 {extraction.issueCount}건
                  </span>
                  <div className="extract-filter" role="group" aria-label="보기">
                    {(
                      [
                        ["all", "전체"],
                        ["issues", "이슈만"],
                        ["subjective", "서술형"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        aria-pressed={filter === value}
                        className={filter === value ? "is-active" : undefined}
                        key={value}
                        onClick={() => setFilter(value)}
                        type="button"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {(extraction.warnings.length > 0 || extraction.examIssues.length > 0) && (
                  <div className="extract-notes">
                    {extraction.examIssues.map((issue) => (
                      <p key={issue}>시험지: {issue}</p>
                    ))}
                    {extraction.warnings.map((warning) => (
                      <p key={warning}>AI 메모: {warning}</p>
                    ))}
                  </div>
                )}

                <div className="extract-grid">
                  <div className="extract-column">
                    <h3>지문 ({passages.length})</h3>
                    {passages.map((passage) => (
                      <PassageCard
                        busy={busy}
                        key={`${passage.id}-${passage.text.length}-${passage.title}`}
                        onSave={(title, text) =>
                          run(async () => setExtraction(await updatePastPassage(passage.id, text, title)), "지문을 저장하지 못했습니다.")
                        }
                        passage={passage}
                      />
                    ))}
                  </div>
                  <div className="extract-column">
                    <h3>문항 ({questions.length})</h3>
                    {questions.map((question) => (
                      <QuestionCard
                        busy={busy}
                        key={`${question.id}-${question.stem}-${question.answer}-${question.type}`}
                        onSave={(request) =>
                          run(
                            async () => setExtraction(await updatePastQuestion(question.id, request)),
                            "문항을 저장하지 못했습니다.",
                          )
                        }
                        question={question}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
