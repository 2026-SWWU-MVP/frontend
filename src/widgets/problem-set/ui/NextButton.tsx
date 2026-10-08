import { Button } from '@/shared/ui/Button/Button'
import type { ProblemQuestion } from '@/entities/problem-set/model/types'

interface NextButtonProps {
  question: ProblemQuestion
  isLastQuestion: boolean
  disabled: boolean
  onClick: () => void
}

export function NextButton({ question, isLastQuestion, disabled, onClick }: NextButtonProps) {
  return (
    <Button
      aria-label={isLastQuestion ? '결과 보기' : `${question.number + 1}번 문제로 이동`}
      disabled={disabled}
      onClick={onClick}
      variant="primary"
    >
      {isLastQuestion ? '결과 보기' : '다음'}
    </Button>
  )
}
