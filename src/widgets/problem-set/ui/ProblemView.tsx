import type { ProblemQuestion } from '@/entities/problem-set/model/types'

interface ProblemViewProps {
  question: ProblemQuestion
}

export function ProblemView({ question }: ProblemViewProps) {
  return (
    <section className="problem-view">
      <p className="problem-view__label">문항</p>
      <p className="problem-view__prompt">{question.prompt}</p>
    </section>
  )
}
