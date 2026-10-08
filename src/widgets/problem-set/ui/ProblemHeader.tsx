import { Badge } from '@/shared/ui/Badge/Badge'
import type { ProblemQuestion } from '@/entities/problem-set/model/types'

interface ProblemHeaderProps {
  question: ProblemQuestion
}

export function ProblemHeader({ question }: ProblemHeaderProps) {
  return (
    <header className="problem-header">
      <div>
        <Badge tone="accent">{question.stageLabel}</Badge>
        <h1>{question.title}</h1>
      </div>
      <span className="problem-header__number">문제 {question.number}</span>
    </header>
  )
}
