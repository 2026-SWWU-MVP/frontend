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

export interface ProfileResponse {
  id: number
  workspaceId: number
  status: 'DRAFT' | 'CONFIRMED' | 'SUPERSEDED'
}

export interface GenerationJobResponse {
  id: number
  workspaceId: number
  profileId: number
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  total?: number
  completed?: number
  progress?: number
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

  const query = title ? `?title=${encodeURIComponent(title)}` : ''
  return httpClient.request<MaterialResponse>({
    path: `${workspacePath(workspaceId, '/materials')}${query}`,
    init: { method: 'POST', body: formData },
  })
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

export function getConfirmedProfile(workspaceId: number) {
  return httpClient.request<ProfileResponse>({
    path: workspacePath(workspaceId, '/profiles/confirmed'),
  })
}

export function createGenerationJob(
  workspaceId: number,
  profileId: number,
  passageIds: number[],
) {
  return httpClient.request<GenerationJobResponse>({
    path: workspacePath(workspaceId, '/generation-jobs'),
    init: { method: 'POST' },
    json: { profileId, passageIds },
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
