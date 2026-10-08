import { useEffect, useState } from 'react'

import { problemSetRepository } from '@/entities/problem-set/api/repository'
import type { ProblemSetResponse } from '@/entities/problem-set/model/types'
import { PageContainer } from '@/shared/ui/PageContainer/PageContainer'
import { AnswerArea } from '@/widgets/problem-set/ui/AnswerArea'
import { NextButton } from '@/widgets/problem-set/ui/NextButton'
import { ProblemHeader } from '@/widgets/problem-set/ui/ProblemHeader'
import { ProblemProgress } from '@/widgets/problem-set/ui/ProblemProgress'
import { ProblemSetResult } from '@/widgets/problem-set/ui/ProblemSetResult'
import { ProblemView } from '@/widgets/problem-set/ui/ProblemView'

import './ProblemSetPage.css'

export function ProblemSetPage() {
  const [problemSet, setProblemSet] = useState<ProblemSetResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isResultVisible, setIsResultVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    problemSetRepository
      .execute()
      .then((response) => {
        if (isMounted) setProblemSet(response)
      })
      .catch(() => {
        if (isMounted) setError('문제 세트를 불러오지 못했습니다.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (error) {
    return <PageContainer><p className="workspace-page__message">{error}</p></PageContainer>
  }

  if (!problemSet) {
    return <PageContainer><p className="workspace-page__message">문제 세트를 불러오는 중입니다.</p></PageContainer>
  }

  const currentQuestion = problemSet.questions[currentQuestionIndex]

  if (isResultVisible) {
    return (
      <PageContainer>
        <div className="problem-set-page">
          <div className="problem-set-page__intro">
            <h1>{problemSet.title}</h1>
            <p>{problemSet.description}</p>
          </div>
          <ProblemSetResult
            answeredCount={Object.keys(answers).length}
            onRestart={() => {
              setAnswers({})
              setCurrentQuestionIndex(0)
              setIsResultVisible(false)
            }}
            total={problemSet.questions.length}
          />
        </div>
      </PageContainer>
    )
  }

  const isLastQuestion = currentQuestionIndex === problemSet.questions.length - 1
  const selectedChoiceId = answers[currentQuestion.id]

  function handleNext() {
    if (isLastQuestion) {
      setIsResultVisible(true)
      return
    }

    setCurrentQuestionIndex((index) => index + 1)
  }

  return (
    <PageContainer>
      <div className="problem-set-page">
        <div className="problem-set-page__intro">
          <h1>{problemSet.title}</h1>
          <p>{problemSet.description}</p>
        </div>
        <section className="problem-set-card">
          <ProblemHeader question={currentQuestion} />
          <ProblemProgress current={currentQuestionIndex + 1} total={problemSet.questions.length} />
          <ProblemView question={currentQuestion} />
          <AnswerArea
            choices={currentQuestion.choices}
            onSelect={(choiceId) => setAnswers((currentAnswers) => ({ ...currentAnswers, [currentQuestion.id]: choiceId }))}
            selectedChoiceId={selectedChoiceId}
          />
          <div className="problem-set-card__footer">
            <NextButton
              disabled={!selectedChoiceId}
              isLastQuestion={isLastQuestion}
              onClick={handleNext}
              question={currentQuestion}
            />
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
