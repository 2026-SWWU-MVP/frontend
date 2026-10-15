import { httpClient } from '@/shared/api/httpClient'

export interface MaterialResponse {
  id: number
  workspaceId: number
  title?: string
  sourceType?: 'PDF' | 'TEXT'
  originalFilename?: string
  pageCount?: number
  scanned?: boolean
  status: 'UPLOADED' | 'SPLITTING' | 'SPLIT' | 'FAILED'
  failureReason?: string
  warnings?: string[]
  passageCount?: number
  createdAt?: string
  createdBy?: number
  createdByName?: string
}

export interface PastExamResponse {
  id: number
  workspaceId?: number
  examYear?: number
  semester?: number
  examType?: 'MIDTERM' | 'FINAL'
  originalFilename?: string
  pageCount?: number
  scanned?: boolean
  status: 'UPLOADED' | 'EXTRACTING' | 'EXTRACTED' | 'FAILED'
  failureReason?: string
  objectiveCount?: number
  subjectiveCount?: number
  createdAt?: string
  extractedAt?: string
}

export interface PastQuestionResponse {
  id: number
  orderNo?: number
  section?: 'OBJECTIVE' | 'SUBJECTIVE'
  no?: number
  type?: string
  passageCodes?: string[]
  passageId?: number
  stem?: string
  body?: string
  conditions?: string[]
  choices?: string[]
  answer?: string
  answerText?: string
  points?: number
  edited?: boolean
  issues?: string[]
}

export interface PastExamExtractionResponse {
  examId: number
  status: PastExamResponse['status']
  passages: Array<{ id: number; code: string; title: string; text: string; edited: boolean; issues: string[] }>
  questions: PastQuestionResponse[]
  examIssues: string[]
  warnings: string[]
  issueCount: number
}

export interface UpdatePastQuestionRequest {
  section?: 'OBJECTIVE' | 'SUBJECTIVE'
  no?: number
  type?: string
  passageCodes?: string[]
  stem?: string
  body?: string
  conditions?: string[]
  choices?: string[]
  answer?: string
  points?: number
  clearPoints?: boolean
}

export interface UpdatePastPassageRequest {
  title?: string
  text?: string
}

export type ProfileStatus = 'DRAFT' | 'CONFIRMED' | 'SUPERSEDED'
export type ProfileOrigin = 'INITIAL_ANALYSIS' | 'AI_RECHECK' | 'TEACHER_FEEDBACK' | 'MANUAL_EDIT'
export type RuleSource = 'PAST_EXAM' | 'SCHOOL_DB' | 'TEACHER'
export type RuleCategory = 'QUESTION_TYPE' | 'CONDITION' | 'PASSAGE_USE' | 'GRAMMAR_POINT' | 'SCORING' | 'OTHER'

export interface ProfileSummaryResponse {
  id: number
  version: number
  status: ProfileStatus
  origin: ProfileOrigin
  examCount: number
  ruleCount: number
  createdAt?: string
  confirmedAt?: string | null
}

/** 기출에서 코드가 집계한 사실 (강사 의견으로 바뀌지 않음) */
export interface ProfileStats {
  examCount: number
  totalQuestions: number
  objectiveCount: number
  subjectiveCount: number
  subjectiveRatio: number
  subjectivePointsRatio: number | null
  typeCounts: Record<string, number>
  frequentConditions: Array<{ text: string; count: number }>
  schoolDbExamCount: number | null
}

export interface ProfileRule {
  id: string
  text: string
  category: RuleCategory
  source: RuleSource
  /** 근거 기출 문항. label 예) 2025년 1학기 중간고사 서답형 2번 */
  evidence: Array<{ id: number; label: string }>
  /** 강사 의견과 충돌해 이번 시험에는 적용하지 않는 규칙 */
  overridden: boolean
  noteIndex: number | null
}

export interface ProfileResponse {
  id: number
  workspaceId: number
  version: number
  parentId: number | null
  status: ProfileStatus
  origin: ProfileOrigin
  stats: ProfileStats
  rules: ProfileRule[]
  typeMixPerPassage: Record<string, number>
  teacherNotes: Array<{ text: string; persistent: boolean; createdBy: number | null; createdByName: string | null }>
  changeSummary: string[]
  examples: Array<{
    id: number
    label: string
    type: string
    stem: string
    body: string | null
    conditions: string[]
    choices: string[]
    answer: string | null
    points: number | null
  }>
  sourceExams: Array<{ id: number; title: string }>
  llmModel: string | null
  createdAt: string
  confirmedAt: string | null
  createdByName: string | null
  confirmedByName: string | null
}

/** 직접 수정. 보낸 항목만 바뀐다. rules는 수정 후 전체 목록 (id 없으면 새 [강사] 규칙, 빠진 규칙은 삭제) */
export interface ManualEditRequest {
  rules?: Array<{ id?: string; text: string; category?: RuleCategory; overridden?: boolean }>
  typeMixPerPassage?: Record<string, number>
}

export interface PassageResponse {
  id: number
  materialId: number
  orderNo: number
  title?: string
  sourceLabel?: string
  content: string
  wordCount?: number
  edited?: boolean
}

export interface GenerationJobResponse {
  id: number
  workspaceId: number
  profileId: number
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  total?: number
  completed?: number
  progress?: number
  passed?: number
  needsReview?: number
  failed?: number
  failureReason?: string
}

export interface ProblemResponse {
  id: number
  passageId?: number
  type?: string
  typeLabel?: string
  passageTitle?: string
  stem?: string
  conditions?: string[]
  body?: string | null
  choices?: string[]
  answerText?: string
  explanation?: string | null
  /** 정답 근거가 된 윗글 문장 */
  evidence?: string | null
  reviewStatus?: 'DRAFT' | 'ACCEPTED' | 'REJECTED'
  /** PASSED 통과 / NEEDS_REVIEW 블라인드 풀이 불일치(강사 확인 필요) / FAILED 규칙 검증 실패 */
  validationStatus?: 'PASSED' | 'NEEDS_REVIEW' | 'FAILED'
  validationIssues?: string[]
  attempts?: number
  edited?: boolean
}

/** 문항 수정·채택·폐기. 보낸 항목만 바뀐다 */
export interface UpdateProblemRequest {
  stem?: string
  conditions?: string[]
  body?: string
  choices?: string[]
  answerText?: string
  explanation?: string
  reviewStatus?: 'DRAFT' | 'ACCEPTED' | 'REJECTED'
  /** 폐기 사유. 다음 생성 때 같은 실수를 피하는 데 쓰인다 */
  rejectReason?: string
}

export interface WorksheetResponse {
  id: number
  workspaceId: number
  title: string
  problemCount?: number
}

export interface CreateWorksheetRequest {
  title: string
  problemIds: number[]
  headerText?: string
  showLogo?: boolean
}

export interface GenerationRequest {
  profileId: number
  passageIds: number[]
  perPassage?: Array<{
    type: 'SUMMARY_BLANK' | 'SENTENCE_ORDER' | 'GRAMMAR_FIX' | 'GUIDED_WRITING'
    count: number
    options?: Record<string, unknown>
  }>
}

function workspacePath(workspaceId: number, suffix: string) {
  return `/api/workspaces/${workspaceId}${suffix}`
}

export async function uploadMaterialPdf(
  workspaceId: number,
  file: File,
  title?: string,
) {
  const formData = new FormData()
  formData.append('file', file)
  if (title) formData.append('title', title)
  return httpClient.request<MaterialResponse>({
    path: workspacePath(workspaceId, '/materials'),
    init: { method: 'POST', body: formData },
  })
}

export function uploadMaterialText(workspaceId: number, title: string, text: string) {
  return httpClient.request<MaterialResponse>({
    path: workspacePath(workspaceId, '/materials/text'),
    init: { method: 'POST' },
    json: { title, text },
  })
}

export function uploadPastExam(workspaceId: number, file: File, examYear: number, semester: number, examType: 'MIDTERM' | 'FINAL') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('examYear', String(examYear))
  formData.append('semester', String(semester))
  formData.append('examType', examType)
  return httpClient.request<PastExamResponse>({
    path: workspacePath(workspaceId, '/past-exams'),
    init: { method: 'POST', body: formData },
  })
}

export function analyzePastExam(pastExamId: number) {
  return httpClient.request<PastExamResponse>({ path: `/api/past-exams/${pastExamId}/analyze`, init: { method: 'POST' } })
}

export function getPastExam(pastExamId: number) {
  return httpClient.request<PastExamResponse>({ path: `/api/past-exams/${pastExamId}` })
}

export function getPastExamQuestions(pastExamId: number) {
  return httpClient.request<PastExamExtractionResponse>({ path: `/api/past-exams/${pastExamId}/questions` })
}

export function updatePastQuestion(questionId: number, request: UpdatePastQuestionRequest) {
  return httpClient.request<PastExamExtractionResponse>({ path: `/api/past-questions/${questionId}`, init: { method: 'PATCH' }, json: request })
}

export function updatePastPassage(passageId: number, content: string, title?: string) {
  const request: UpdatePastPassageRequest = { text: content, ...(title === undefined ? {} : { title }) }
  return httpClient.request<PastExamExtractionResponse>({ path: `/api/past-passages/${passageId}`, init: { method: 'PATCH' }, json: request })
}

export function createProfile(workspaceId: number) {
  return httpClient.request<ProfileResponse>({ path: workspacePath(workspaceId, '/profiles'), init: { method: 'POST' } })
}

export function getProfile(profileId: number) {
  return httpClient.request<ProfileResponse>({ path: `/api/profiles/${profileId}` })
}

export function recheckProfile(profileId: number) {
  return httpClient.request<ProfileResponse>({ path: `/api/profiles/${profileId}/recheck`, init: { method: 'POST' } })
}

export function sendProfileFeedback(profileId: number, text: string, persistent: boolean) {
  return httpClient.request<ProfileResponse>({ path: `/api/profiles/${profileId}/feedback`, init: { method: 'POST' }, json: { text, persistent } })
}

export function updateProfile(profileId: number, request: ManualEditRequest) {
  return httpClient.request<ProfileResponse>({ path: `/api/profiles/${profileId}`, init: { method: 'PATCH' }, json: request })
}

export function confirmProfile(profileId: number) {
  return httpClient.request<ProfileResponse>({ path: `/api/profiles/${profileId}/confirm`, init: { method: 'POST' } })
}

export function getMaterial(materialId: number) {
  return httpClient.request<MaterialResponse>({
    path: `/api/materials/${materialId}`,
  })
}

export function getMaterialPassages(materialId: number) {
  return httpClient.request<PassageResponse[]>({
    path: `/api/materials/${materialId}/passages`,
  })
}

export function updatePassage(passageId: number, content: string, title?: string) {
  return httpClient.request<PassageResponse>({ path: `/api/passages/${passageId}`, init: { method: 'PATCH' }, json: { content, ...(title === undefined ? {} : { title }) } })
}

/** 워크스페이스의 시험범위 자료 목록 (이전에 올린 자료를 다시 쓸 때) */
export function listMaterials(workspaceId: number) {
  return httpClient.request<MaterialResponse[]>({ path: workspacePath(workspaceId, '/materials') })
}

/** 지문 직접 추가 (분리에서 빠진 지문 등). 맨 뒤에 붙는다 */
export function addPassage(materialId: number, content: string, title?: string) {
  return httpClient.request<PassageResponse>({
    path: `/api/materials/${materialId}/passages`,
    init: { method: 'POST' },
    json: { content, ...(title ? { title } : {}) },
  })
}

export function deletePassage(passageId: number) {
  return httpClient.request<void>({ path: `/api/passages/${passageId}`, init: { method: 'DELETE' } })
}

export function getConfirmedProfile(workspaceId: number) {
  return httpClient.request<ProfileResponse>({
    path: workspacePath(workspaceId, '/profiles/confirmed'),
  })
}

export function listProfiles(workspaceId: number) {
  return httpClient.request<ProfileSummaryResponse[]>({
    path: workspacePath(workspaceId, '/profiles'),
  })
}

export function createGenerationJob(
  workspaceId: number,
  profileId: number,
  passageIds: number[],
  perPassage?: GenerationRequest['perPassage'],
) {
  return httpClient.request<GenerationJobResponse>({
    path: workspacePath(workspaceId, '/generation-jobs'),
    init: { method: 'POST' },
    json: { profileId, passageIds, ...(perPassage === undefined ? {} : { perPassage }) },
  })
}

export function getGenerationJob(jobId: number) {
  return httpClient.request<GenerationJobResponse>({
    path: `/api/generation-jobs/${jobId}`,
  })
}

export function getGeneratedProblems(jobId: number) {
  return httpClient.request<ProblemResponse[]>({
    path: `/api/generation-jobs/${jobId}/problems`,
  })
}

export function updateProblem(problemId: number, request: UpdateProblemRequest) {
  return httpClient.request<ProblemResponse>({ path: `/api/problems/${problemId}`, init: { method: 'PATCH' }, json: request })
}

export function regenerateProblem(problemId: number) {
  return httpClient.request<ProblemResponse>({ path: `/api/problems/${problemId}/regenerate`, init: { method: 'POST' } })
}

export function getAcceptedProblems(workspaceId: number) {
  return httpClient.request<ProblemResponse[]>({ path: `${workspacePath(workspaceId, '/problems')}?reviewStatus=ACCEPTED` })
}

export function createWorksheet(
  workspaceId: number,
  request: CreateWorksheetRequest,
) {
  return httpClient.request<WorksheetResponse>({
    path: workspacePath(workspaceId, '/worksheets'),
    init: { method: 'POST' },
    json: request,
  })
}

export function downloadWorksheetPdf(worksheetId: number, answer = false) {
  return httpClient.request<Blob>({
    path: `/api/worksheets/${worksheetId}/${answer ? 'answer-pdf' : 'pdf'}`,
    responseType: 'blob',
  })
}

export function getWorksheet(worksheetId: number) {
  return httpClient.request<Record<string, unknown>>({ path: `/api/worksheets/${worksheetId}` })
}
