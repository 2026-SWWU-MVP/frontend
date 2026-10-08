import { Button } from "@/shared/ui/Button/Button";

interface ProblemSetResultProps {
  answeredCount: number;
  total: number;
  onRestart: () => void;
}

export function ProblemSetResult({
  answeredCount,
  total,
  onRestart,
}: ProblemSetResultProps) {
  return (
    <section className="problem-result">
      <span className="problem-result__eyebrow">검토 완료</span>
      <h1>문제 세트 확인이 끝났습니다.</h1>
      <p>
        {total}개 문제 중 {answeredCount}개 문제에 답변했습니다.
      </p>
      <Button onClick={onRestart} variant="outline">
        다시 확인하기
      </Button>
    </section>
  );
}
