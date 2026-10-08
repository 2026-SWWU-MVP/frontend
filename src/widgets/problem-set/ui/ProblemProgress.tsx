interface ProblemProgressProps {
  current: number
  total: number
}

export function ProblemProgress({ current, total }: ProblemProgressProps) {
  const percentage = (current / total) * 100

  return (
    <div className="problem-progress" aria-label={`전체 ${total}문제 중 ${current}문제`}>
      <div className="problem-progress__meta">
        <span>진행률</span>
        <strong>{current} / {total}</strong>
      </div>
      <div className="problem-progress__track">
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
