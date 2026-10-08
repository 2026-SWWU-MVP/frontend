export type ProblemSetStage = 'source' | 'generation' | 'review'

export interface ProblemChoice {
  id: string
  label: string
  text: string
}

export interface ProblemQuestion {
  id: string
  number: number
  stage: ProblemSetStage
  stageLabel: string
  title: string
  prompt: string
  choices: ProblemChoice[]
}

export interface ProblemSetResponse {
  id: string
  title: string
  description: string
  questions: ProblemQuestion[]
}
