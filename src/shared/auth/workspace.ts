import { selectedWorkspaceStorageKey } from './session'

export class MissingWorkspaceIdError extends Error {
  constructor() {
    super('워크스페이스 ID가 없어 API 요청을 보낼 수 없습니다. 워크스페이스 화면에서 워크스페이스를 먼저 선택해 주세요.')
    this.name = 'MissingWorkspaceIdError'
  }
}

/** 워크스페이스 화면에서 고른 워크스페이스 ID (학교 + 학년 단위, 학원 ID와 다름) */
export function getWorkspaceId(): number | null {
  const stored = Number(sessionStorage.getItem(selectedWorkspaceStorageKey))
  return Number.isInteger(stored) && stored > 0 ? stored : null
}

export function setWorkspaceId(workspaceId: number) {
  sessionStorage.setItem(selectedWorkspaceStorageKey, String(workspaceId))
}

export function requireWorkspaceId(): number {
  const workspaceId = getWorkspaceId()
  if (workspaceId === null) {
    throw new MissingWorkspaceIdError()
  }

  return workspaceId
}
