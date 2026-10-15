import { useState } from "react";

import type {
  ProblemQuestion,
  ProblemSetResponse,
} from "@/entities/problem-set/model/types";
import { questionTypeLabel } from "@/entities/problem-set/model/labels";
import { Button } from "@/shared/ui/Button/Button";

export type ReviewAction = "accept" | "reject" | "reset" | "edit" | "regenerate";

export interface ReviewEdit {
  stem?: string;
  conditions?: string[];
  body?: string;
  choices?: string[];
  answerText?: string;
  explanation?: string;
}

const validationLabels = {
  PASSED: { label: "검증 통과", tone: "passed" },
  NEEDS_REVIEW: { label: "확인 필요", tone: "needs-review" },
  FAILED: { label: "검증 실패", tone: "failed" },
} as const;

const reviewLabels = {
  DRAFT: { label: "검수 전", tone: "draft" },
  ACCEPTED: { label: "채택", tone: "accepted" },
  REJECTED: { label: "폐기", tone: "rejected" },
} as const;

const busyLabels: Record<ReviewAction, string> = {
  accept: "채택하는 중...",
  reject: "폐기하는 중...",
  reset: "되돌리는 중...",
  edit: "저장하는 중...",
  regenerate: "다시 만드는 중입니다. 수 초~수십 초 걸릴 수 있습니다.",
};

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function StatusChips({ question }: { question: ProblemQuestion }) {
  const validation = question.validationStatus ? validationLabels[question.validationStatus] : null;
  const review = reviewLabels[question.reviewStatus ?? "DRAFT"];
  return (
    <>
      {validation && <span className={`review-chip review-chip--${validation.tone}`}>{validation.label}</span>}
      <span className={`review-chip review-chip--${review.tone}`}>{review.label}</span>
      {question.edited && <span className="review-chip review-chip--draft">수정함</span>}
    </>
  );
}

function EditForm({
  question,
  busy,
  onCancel,
  onSave,
}: {
  question: ProblemQuestion;
  busy: boolean;
  onCancel: () => void;
  onSave: (fields: ReviewEdit) => void;
}) {
  const [stem, setStem] = useState(question.prompt);
  const [conditions, setConditions] = useState((question.conditions ?? []).join("\n"));
  const [body, setBody] = useState(question.body ?? "");
  const [choices, setChoices] = useState((question.rawChoices ?? []).join("\n"));
  const [answerText, setAnswerText] = useState(question.answerText ?? "");
  const [explanation, setExplanation] = useState(question.explanation ?? "");

  return (
    <form
      className="review-edit"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          stem: stem.trim(),
          conditions: lines(conditions),
          body,
          choices: lines(choices),
          answerText: answerText.trim(),
          explanation: explanation.trim(),
        });
      }}
    >
      <label htmlFor="review-edit-stem">발문</label>
      <textarea id="review-edit-stem" maxLength={1000} onChange={(e) => setStem(e.target.value)} rows={2} value={stem} />
      <label htmlFor="review-edit-conditions">[조건] (한 줄에 하나)</label>
      <textarea
        id="review-edit-conditions"
        onChange={(e) => setConditions(e.target.value)}
        rows={3}
        value={conditions}
      />
      <label htmlFor="review-edit-body">본문</label>
      <textarea id="review-edit-body" maxLength={5000} onChange={(e) => setBody(e.target.value)} rows={4} value={body} />
      {(question.rawChoices ?? []).length > 0 && (
        <>
          <label htmlFor="review-edit-choices">[보기] (한 줄에 하나)</label>
          <textarea id="review-edit-choices" onChange={(e) => setChoices(e.target.value)} rows={4} value={choices} />
        </>
      )}
      <label htmlFor="review-edit-answer">정답 (정답지에 찍히는 문구)</label>
      <textarea
        id="review-edit-answer"
        maxLength={2000}
        onChange={(e) => setAnswerText(e.target.value)}
        rows={2}
        value={answerText}
      />
      <label htmlFor="review-edit-explanation">해설</label>
      <textarea
        id="review-edit-explanation"
        maxLength={5000}
        onChange={(e) => setExplanation(e.target.value)}
        rows={3}
        value={explanation}
      />
      <p className="review-muted">고친 내용은 다음 생성에도 참고됩니다.</p>
      <div className="review-actions">
        <Button disabled={busy} onClick={onCancel} type="button" variant="outline">
          취소
        </Button>
        <Button disabled={busy} type="submit" variant="primary">
          저장
        </Button>
      </div>
    </form>
  );
}

function Question({
  question,
  busy,
  onAccept,
  onReject,
  onReset,
  onEdit,
  onRegenerate,
}: {
  question: ProblemQuestion;
  busy: ReviewAction | null;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onReset: () => void;
  onEdit: (fields: ReviewEdit) => Promise<boolean>;
  onRegenerate: () => void;
}) {
  const [mode, setMode] = useState<"view" | "reject" | "edit">("view");
  const [reason, setReason] = useState("");
  const disabled = busy !== null;
  const status = question.reviewStatus ?? "DRAFT";

  return (
    <article className="question-card">
      <div className="question-meta">
        <span>{question.type ? questionTypeLabel(question.type) : question.stageLabel}</span>
        <StatusChips question={question} />
      </div>

      {question.validationStatus !== "PASSED" && (question.validationIssues ?? []).length > 0 && (
        <ul className={`review-issues review-issues--${question.validationStatus === "FAILED" ? "failed" : "needs-review"}`}>
          {(question.validationIssues ?? []).map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}

      {mode === "edit" ? (
        <EditForm
          busy={disabled}
          onCancel={() => setMode("view")}
          onSave={(fields) => void onEdit(fields).then((saved) => saved && setMode("view"))}
          question={question}
        />
      ) : (
        <>
          <h3>
            <b>{String(question.number).padStart(2, "0")}</b>
            {question.prompt}
          </h3>
          {(question.conditions ?? []).length > 0 && (
            <div className="example-box review-conditions">
              <strong>[조건]</strong>
              <ol>
                {(question.conditions ?? []).map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ol>
            </div>
          )}
          {question.body && <p className="review-body">{question.body}</p>}
          {question.choices.length > 0 && (
            <div className="example-box">
              <strong>[보기]</strong>
              <div className="review-choices">
                {question.choices.map((choice) => (
                  <span key={choice.id}>
                    {choice.label} {choice.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {mode === "reject" && (
        <div className="review-reject">
          <label htmlFor="review-reject-reason">폐기 사유 (선택)</label>
          <textarea
            id="review-reject-reason"
            maxLength={300}
            onChange={(event) => setReason(event.target.value)}
            placeholder="예: [조건]이 너무 쉬움, 정답이 두 개 나옴"
            rows={2}
            value={reason}
          />
          <p className="review-muted">적어 두면 다음 생성 때 같은 실수를 피합니다.</p>
          <div className="review-actions">
            <Button disabled={disabled} onClick={() => setMode("view")} variant="outline">
              취소
            </Button>
            <Button
              disabled={disabled}
              onClick={() => {
                onReject(reason);
                setMode("view");
                setReason("");
              }}
              variant="primary"
            >
              폐기
            </Button>
          </div>
        </div>
      )}

      {mode === "view" && (
        <div className="review-actions">
          {status === "DRAFT" ? (
            <>
              <Button disabled={disabled} onClick={onAccept} variant="primary">
                채택
              </Button>
              <Button disabled={disabled} onClick={() => setMode("reject")} variant="secondary">
                폐기
              </Button>
            </>
          ) : (
            <Button disabled={disabled} onClick={onReset} variant="secondary">
              {status === "ACCEPTED" ? "채택 취소" : "폐기 취소"}
            </Button>
          )}
          <Button disabled={disabled} onClick={() => setMode("edit")} variant="outline">
            수정
          </Button>
          <Button disabled={disabled} onClick={onRegenerate} variant="outline">
            다시 생성
          </Button>
        </div>
      )}
      {busy && (
        <p className="review-muted" role="status">
          {busyLabels[busy]}
        </p>
      )}
    </article>
  );
}

export function ReviewStage({
  data,
  index,
  busy,
  next,
  onSelect,
  onAccept,
  onReject,
  onReset,
  onEdit,
  onRegenerate,
}: {
  data: ProblemSetResponse;
  index: number;
  busy: ReviewAction | null;
  next: () => void;
  onSelect: (index: number) => void;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onReset: () => void;
  onEdit: (fields: ReviewEdit) => Promise<boolean>;
  onRegenerate: () => void;
}) {
  const question = data.questions[index];
  if (!question) return null;

  const passage = question.passageId !== undefined ? data.passages?.[question.passageId] : undefined;
  const count = (predicate: (item: ProblemQuestion) => boolean) => data.questions.filter(predicate).length;
  const accepted = count((item) => item.reviewStatus === "ACCEPTED");
  const rejected = count((item) => item.reviewStatus === "REJECTED");

  return (
    <>
      <div className="review-status">
        <span>
          문항 검토 {index + 1} / {data.questions.length}
        </span>
        <small>
          검증 통과 {count((item) => item.validationStatus === "PASSED")} · 확인 필요{" "}
          {count((item) => item.validationStatus === "NEEDS_REVIEW")} · 실패{" "}
          {count((item) => item.validationStatus === "FAILED")} | 채택 {accepted} · 폐기 {rejected} · 남음{" "}
          {data.questions.length - accepted - rejected}
        </small>
      </div>
      <div className="stage-grid review-grid">
        <section className="set-card questions-panel">
          <div className="set-card-heading">
            <h2>{question.passageTitle ?? passage?.title ?? "지문"}</h2>
          </div>
          <p className="review-passage">{passage?.content ?? data.passage}</p>
          {question.evidence && (
            <p className="review-evidence">
              <strong>정답 근거</strong> {question.evidence}
            </p>
          )}
          <div className="question-divider" />
          <Question
            busy={busy}
            key={`${question.id}-${question.prompt}`}
            onAccept={onAccept}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onReject={onReject}
            onReset={onReset}
            question={question}
          />
        </section>
        <aside className="review-aside">
          <section className="set-card answer-card">
            <h2>정답과 해설</h2>
            <div className="answer-summary">
              <strong>
                {question.number}번 · {question.type ? questionTypeLabel(question.type) : question.stageLabel}
              </strong>
              <p>{question.answerText || "정답 정보가 없습니다."}</p>
              {question.explanation && <small>{question.explanation}</small>}
            </div>
          </section>
          <section className="set-card answer-card">
            <h2>전체 문항</h2>
            {data.questions.map((item, itemIndex) => (
              <button
                className={`review-nav${itemIndex === index ? " is-active" : ""}`}
                disabled={busy !== null}
                key={item.id}
                onClick={() => onSelect(itemIndex)}
                type="button"
              >
                <strong>
                  {item.number}번 · {item.type ? questionTypeLabel(item.type) : item.stageLabel}
                </strong>
                <span className="review-nav__chips">
                  <StatusChips question={item} />
                </span>
              </button>
            ))}
          </section>
        </aside>
      </div>
      <div className="set-actions">
        <Button disabled={busy !== null} onClick={next} variant="primary">
          {index === data.questions.length - 1 ? `검토 완료 · 채택 ${accepted}문항으로 시험지 만들기` : "다음 문항"}
        </Button>
      </div>
    </>
  );
}
