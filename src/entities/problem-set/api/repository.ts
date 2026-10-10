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
  status: 'UPLOADED' | 'ANALYZING' | 'EXTRACTED' | 'FAILED'
  failureReason?: string
}

export interface PastQuestionResponse {
  id: number
  passageId?: number
  stem?: string
  choices?: string[]
  answerText?: string
  explanation?: string
  issues?: string[]
}

export interface ProfileResponse {
  id: number
  status: 'DRAFT' | 'CONFIRMED' | 'SUPERSEDED'
  version?: number
  changeSummary?: string
  stats?: Record<string, number>
  rules?: Array<{ source: 'PAST_EXAM' | 'SCHOOL_DB' | 'TEACHER'; [key: string]: unknown }>
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
  body?: string
  choices?: string[]
  answerText?: string
  explanation?: string
  reviewStatus?: 'DRAFT' | 'ACCEPTED' | 'REJECTED'
  validationStatus?: 'PASSED' | 'NEEDS_REVIEW' | 'FAILED'
  validationIssues?: string[]
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
  return httpClient.request<void>({ path: `/api/past-exams/${pastExamId}/analyze`, init: { method: 'POST' } })
}

export function getPastExam(pastExamId: number) {
  return httpClient.request<PastExamResponse>({ path: `/api/past-exams/${pastExamId}` })
}

export function getPastExamQuestions(pastExamId: number) {
  return httpClient.request<PastQuestionResponse[]>({ path: `/api/past-exams/${pastExamId}/questions` })
}

export function updatePastQuestion(questionId: number, request: Partial<PastQuestionResponse>) {
  return httpClient.request<PastQuestionResponse>({ path: `/api/past-questions/${questionId}`, init: { method: 'PATCH' }, json: request })
}

export function updatePastPassage(passageId: number, content: string, title?: string) {
  return httpClient.request<PassageResponse>({ path: `/api/past-passages/${passageId}`, init: { method: 'PATCH' }, json: { content, ...(title === undefined ? {} : { title }) } })
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

export function updateProfile(profileId: number, request: Record<string, unknown>) {
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

export function getConfirmedProfile(workspaceId: number) {
  return httpClient.request<ProfileResponse>({
    path: workspacePath(workspaceId, '/profiles/confirmed'),
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

export function updateProblem(problemId: number, request: Partial<ProblemResponse> & { conditions?: string; rejectReason?: string }) {
  return httpClient.request<ProblemResponse>({ path: `/api/problems/${problemId}`, init: { method: 'PATCH' }, json: request })
}

export function regenerateProblem(problemId: number) {
  return httpClient.request<ProblemResponse>({ path: `/api/problems/${problemId}/regenerate`, init: { method: 'POST' } })
}

export function getAcceptedProblems(workspaceId: number) {
  return httpClient.request<ProblemResponse[]>({ path: `${workspacePath(workspaceId, '/problems')}?reviewStatus=ACCEPTED` })
}

export function getReviewStats(workspaceId: number) {
  return httpClient.request<Record<string, unknown>>({ path: workspacePath(workspaceId, '/review-stats') })
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
