import type {
  ProblemQuestion,
  ProblemSetResponse,
} from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";

function Question({
  question,
  index,
  onAccept,
  onRegenerate,
}: {
  question: ProblemQuestion;
  index: number;
  onAccept: () => void;
  onRegenerate: () => void;
}) {
  return (
    <article className="question-card">
      <div className="question-meta">
        <span>{question.stageLabel}</span>
        <span>{index + 1}</span>
        <span className="success-badge">검토 완료</span>
      </div>
      <h3>
        <b>{String(question.number).padStart(2, "0")}</b>
        {question.title}
      </h3>
      <div className="choices">
        {question.choices.map((choice) => (
          <p key={choice.id}>
            {choice.label} {choice.text}
          </p>
        ))}
      </div>
      <Button
        variant="secondary"
        onClick={onAccept}
        disabled={question.reviewStatus === "ACCEPTED"}
      >
        {question.reviewStatus === "ACCEPTED" ? "채택 완료" : "문항 채택"}
      </Button>
      <button className="regenerate" type="button" onClick={onRegenerate}>
        해당 문항 재생성
      </button>
    </article>
  );
}

export function ReviewStage({
  data,
  index,
  next,
  onAccept,
  onRegenerate,
}: {
  data: ProblemSetResponse;
  index: number;
  next: () => void;
  onAccept: () => void;
  onRegenerate: () => void;
}) {
  const question = data.questions[index];
  if (!question) return null;

  return (
    <>
      <div className="review-status">
        <span>
          문항 검토 {index + 1} / {data.questions.length}
        </span>
        <small>문항별 검토 단계</small>
      </div>
      <div className="stage-grid review-grid">
        <section className="set-card questions-panel">
          <div className="set-card-heading">
            <h2>지문과 문항</h2>
            <Button variant="secondary">지문 편집</Button>
          </div>
          <p className="review-passage">{data.passage}</p>
          <div className="question-divider" />
          <Question
            question={question}
            index={index}
            onAccept={onAccept}
            onRegenerate={onRegenerate}
          />
        </section>
        <aside className="review-aside">
          <section className="set-card answer-card">
            <h2>정답과 해설</h2>
            {data.questions.map((item) => (
              <div className="answer-summary" key={item.id}>
                <strong>
                  {item.number}번 · {item.stageLabel}
                </strong>
                <span>정답 확인</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
      <div className="set-actions">
        <Button variant="primary" onClick={next}>
          {index === data.questions.length - 1 ? "검토 완료" : "다음 문항 검토"}
        </Button>
      </div>
    </>
  );
}
