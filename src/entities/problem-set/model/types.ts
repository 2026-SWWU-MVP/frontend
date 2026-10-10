export type ProblemSetStage = 'source' | 'generation' | 'review' | 'output'

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
  answerText?: string
  explanation?: string
}

export interface ProblemSetResponse {
  id: string
  materialId?: number
  generationJobId?: number
  worksheetId?: number
  title: string
  description: string
  questions: ProblemQuestion[]
  files: Array<{ id: string; name: string; meta: string }>
  school: string
  grade: string
  subject: string
  area: string
  exam: string
  scope: string
  passage: string
  prompt: string
}
