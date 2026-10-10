import { httpClient } from '@/shared/api/httpClient'
import type { Repository } from '@/shared/api/types'

import type { WorkspaceResponse } from '@/entities/workspace/model/types'

interface WorkspaceApiResponse {
  id: number
  schoolId?: number
  schoolName?: string
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

function mapWorkspace(workspace: WorkspaceApiResponse): WorkspaceResponse {
  const summary = workspace.summary ?? {}
  const school = workspace.schoolName ?? '학교 미지정'
  const grade = workspace.grade === undefined ? '' : `${workspace.grade}학년`
  const latestTitle = summary.latestWorksheet?.title
  return {
    title: `${school}${grade ? ` · ${grade}` : ''}`,
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
      { label: '기출 자료', value: `${summary.pastExamCount ?? 0}건`, detail: 'API 응답 기준' },
      { label: '출제 프로필', value: formatProfileStatus(summary.profileStatus), detail: `확정 버전 ${summary.confirmedProfileVersion ?? '-'}` },
      { label: '최근 시험지', value: latestTitle ?? '없음', detail: summary.latestWorksheet?.createdAt ?? 'API 응답 기준' },
    ],
    recentQuestionSets: latestTitle ? [{ title: latestTitle, detail: `워크스페이스 ${workspace.id}`, status: 'complete', statusLabel: '확인', updatedAt: summary.latestWorksheet?.createdAt ?? '-' }] : [],
    teamActivities: [],
    insight: { title: '학교 출제 경향', badgeLabel: 'API 데이터', headline: '학교 경향에서 다음 출제를 준비하세요', description: '학교 경향 상세는 API 연동 후 표시됩니다.', actionLabel: '학교 경향 보기', metrics: [] },
    reviewPrompt: { title: '시험 후 리뷰', description: '시험지와 문제 세트의 결과를 비교할 수 있습니다.', actionLabel: '리뷰 보기 →' },
  }
}

export const workspaceRepository: Repository<void, WorkspaceResponse> = {
  async execute() {
    const response = await httpClient.request<WorkspaceApiResponse[]>({ path: '/api/workspaces' })
    if (response.length === 0) throw new Error('등록된 워크스페이스가 없습니다.')
    return mapWorkspace(response[0])
  },
}
