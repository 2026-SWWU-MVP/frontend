export interface LoginUserResponse {
  userId: number
  loginId: string
  name: string
  role: 'OWNER' | 'TEACHER' | 'STUDENT'
  academyId?: number
}

export interface AuthSession {
  userId: number
  academyId: number | null
}

const storageKey = 'testfit.auth-session'

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const session = value as Partial<AuthSession>
  return typeof session.userId === 'number'
    && (session.academyId === null || typeof session.academyId === 'number')
}

export function saveAuthSession(user: LoginUserResponse): AuthSession {
  const session: AuthSession = {
    userId: user.userId,
    academyId: user.academyId ?? null,
  }

  sessionStorage.setItem(storageKey, JSON.stringify(session))
  return session
}

export function getAuthSession(): AuthSession | null {
  const stored = sessionStorage.getItem(storageKey)
  if (!stored) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(stored)
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getStoredUserId(): number | null {
  return getAuthSession()?.userId ?? null
}

export function getStoredAcademyId(): number | null {
  return getAuthSession()?.academyId ?? null
}

export function clearAuthSession() {
  sessionStorage.removeItem(storageKey)
}
