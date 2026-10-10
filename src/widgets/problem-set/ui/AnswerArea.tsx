import type { ProblemChoice } from "@/entities/problem-set/model/types";

interface AnswerAreaProps {
  choices: ProblemChoice[];
  selectedChoiceId?: string;
  onSelect: (choiceId: string) => void;
}

export function AnswerArea({
  choices,
  selectedChoiceId,
  onSelect,
}: AnswerAreaProps) {
  return (
    <fieldset className="answer-area">
      <legend>답변을 선택하세요</legend>
      <div className="answer-area__choices">
        {choices.map((choice) => (
          <label
            className={`answer-choice${selectedChoiceId === choice.id ? " is-selected" : ""}`}
            key={choice.id}
          >
            <input
              checked={selectedChoiceId === choice.id}
              name="problem-answer"
              onChange={() => onSelect(choice.id)}
              type="radio"
              value={choice.id}
            />
            <span className="answer-choice__label">{choice.label}</span>
            <span className="answer-choice__text">{choice.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
