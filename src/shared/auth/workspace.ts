import { getStoredAcademyId } from './session'

export class MissingWorkspaceIdError extends Error {
  constructor() {
    super('워크스페이스 ID가 없어 API 요청을 보낼 수 없습니다.')
    this.name = 'MissingWorkspaceIdError'
  }
}

/** The current backend maps academyId to workspaceId. */
export function getWorkspaceId(): number | null {
  return getStoredAcademyId()
}

export function requireWorkspaceId(): number {
  const workspaceId = getWorkspaceId()
  if (workspaceId === null) {
    throw new MissingWorkspaceIdError()
  }

  return workspaceId
}
