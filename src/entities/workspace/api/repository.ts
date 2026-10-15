import { httpClient } from '@/shared/api/httpClient'
import type { Repository } from '@/shared/api/types'

import type { WorkspaceOption, WorkspaceResponse } from '@/entities/workspace/model/types'
import { getWorkspaceId, MissingWorkspaceIdError, setWorkspaceId } from '@/shared/auth/workspace'
import { formatShortDateTime } from '@/shared/lib/date'

interface WorkspaceApiResponse {
  id: number
  title?: string
  school?: { id: number; name: string }
  grade?: string | number
  summary?: {
    pastExamCount?: number
    profileStatus?: string
    confirmedProfileVersion?: number
    latestWorksheet?: { id?: number; title?: string; createdAt?: string } | null
  }
}

export interface SchoolResponse {
  id: number
  name: string
  region?: string | null
  aliases?: string[]
}

/** 학원에 워크스페이스가 하나도 없을 때 (새 학원) */
export class NoWorkspaceError extends Error {
  constructor() {
    super('아직 워크스페이스가 없습니다.')
    this.name = 'NoWorkspaceError'
  }
}

function toOption(workspace: WorkspaceApiResponse): WorkspaceOption {
  return {
    id: workspace.id,
    title: workspaceTitle(workspace),
    pastExamCount: workspace.summary?.pastExamCount ?? 0,
    profileStatus: workspace.summary?.profileStatus ?? null,
    confirmedProfileVersion: workspace.summary?.confirmedProfileVersion ?? null,
    latestWorksheetTitle: workspace.summary?.latestWorksheet?.title ?? null,
  }
}

/** 고른 워크스페이스 ID. 아직 고르지 않았으면(바로 들어온 경우) 첫 번째 워크스페이스를 고른다 */
export async function resolveWorkspaceId() {
  const stored = getWorkspaceId()
  if (stored !== null) return stored
  const response = await httpClient.request<WorkspaceApiResponse[]>({ path: '/api/workspaces' })
  if (response.length === 0) throw new MissingWorkspaceIdError()
  setWorkspaceId(response[0].id)
  return response[0].id
}

export function searchSchools(query: string) {
  return httpClient.request<SchoolResponse[]>({ path: `/api/schools?query=${encodeURIComponent(query)}` })
}

export function createSchool(name: string) {
  return httpClient.request<SchoolResponse>({ path: '/api/schools', init: { method: 'POST' }, json: { name } })
}

export function createWorkspace(schoolId: number, grade: string | number) {
  return httpClient.request<WorkspaceApiResponse>({ path: '/api/workspaces', init: { method: 'POST' }, json: { schoolId, grade } })
}

function formatProfileStatus(status?: string) {
  if (!status) return '미생성'
  if (status === 'CONFIRMED') return '확정'
  if (status === 'DRAFT') return '초안'
  return status
}

function workspaceTitle(workspace: WorkspaceApiResponse) {
  if (workspace.title) return workspace.title
  const school = workspace.school?.name ?? '학교 미지정'
  return workspace.grade === undefined ? school : `${school} · ${workspace.grade}학년`
}

function mapWorkspace(workspace: WorkspaceApiResponse, options: WorkspaceOption[]): WorkspaceResponse {
  const summary = workspace.summary ?? {}
  const latestTitle = summary.latestWorksheet?.title
  return {
    id: workspace.id,
    options,
    title: workspaceTitle(workspace),
    description: '워크스페이스의 실제 자료와 출제 프로필 현황입니다.',
    primaryActionLabel: '새 문제 세트 만들기',
    preparation: {
      eyebrow: '내신 준비 워크플로',
      steps: '자료 입력 → AI 생성 → 검토 → 확정',
      title: '확정된 프로필과 자료로 문제를 준비하세요',
      description: `출제 프로필 ${formatProfileStatus(summary.profileStatus)} · 확정 버전 ${summary.confirmedProfileVersion ?? '-'}`,
      actionLabel: '문제 세트 만들기',
    },
    stats: [
      { label: '기출 자료', value: `${summary.pastExamCount ?? 0}건`, detail: '올린 기출 회차' },
      { label: '출제 프로필', value: formatProfileStatus(summary.profileStatus), detail: `확정 버전 ${summary.confirmedProfileVersion ?? '-'}` },
      { label: '최근 시험지', value: latestTitle ?? '없음', detail: latestTitle ? formatShortDateTime(summary.latestWorksheet?.createdAt) : '아직 만든 시험지가 없습니다' },
    ],
    recentQuestionSets: latestTitle ? [{ title: latestTitle, detail: '최근에 만든 시험지', status: 'complete', statusLabel: '완성', updatedAt: formatShortDateTime(summary.latestWorksheet?.createdAt) }] : [],
    insight: { title: '학교 출제 경향', badgeLabel: 'API 데이터', headline: '학교 경향에서 다음 출제를 준비하세요', description: '학교 경향 상세는 API 연동 후 표시됩니다.', actionLabel: '학교 경향 보기', metrics: [] },
  }
}

export const workspaceRepository: Repository<void, WorkspaceResponse> = {
  async execute() {
    const response = await httpClient.request<WorkspaceApiResponse[]>({ path: '/api/workspaces' })
    if (response.length === 0) throw new NoWorkspaceError()
    // 고른 워크스페이스가 목록에 없으면(처음 로그인 등) 첫 번째를 고른다
    const selected = response.find((workspace) => workspace.id === getWorkspaceId()) ?? response[0]
    setWorkspaceId(selected.id)
    return mapWorkspace(selected, response.map(toOption))
  },
}
