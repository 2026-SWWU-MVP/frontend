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
  reviewStatus?: 'DRAFT' | 'ACCEPTED' | 'REJECTED'
  type?: string
  body?: string
  conditions?: string[]
  /** 서버에 저장된 [보기] 원문 (choices는 화면용 라벨이 붙은 것) */
  rawChoices?: string[]
  evidence?: string
  passageId?: number
  passageTitle?: string
  validationStatus?: 'PASSED' | 'NEEDS_REVIEW' | 'FAILED'
  validationIssues?: string[]
  edited?: boolean
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
  scope?: string
  exam: string
  passage: string
  /** 생성에 쓴 지문 (passageId → 지문). 검수 화면에서 문항마다 해당 지문을 보여준다 */
  passages?: Record<number, { title?: string; content: string }>
  prompt?: string
}

export function buildProblemSetName(
  school: string,
  grade: string,
  subject: string,
  exam: string,
) {
  if (!school || !grade || !subject || !exam) return ""
  return `${school}_${grade}학년_${subject}_${exam}`
}
