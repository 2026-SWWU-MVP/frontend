export interface LoginUserResponse {
  userId: number
  loginId: string
  name: string
  role: 'OWNER' | 'TEACHER' | 'STUDENT' | null
  academyId: number | null
}

export interface AuthSession {
  userId: number
  loginId: string
  name: string
  role: LoginUserResponse['role']
  academyId: number | null
}

const storageKey = 'testfit.auth-session'

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const session = value as Partial<AuthSession>
  return typeof session.userId === 'number'
    && typeof session.loginId === 'string'
    && typeof session.name === 'string'
    && (session.role === null || session.role === 'OWNER' || session.role === 'TEACHER' || session.role === 'STUDENT')
    && (session.academyId === null || typeof session.academyId === 'number')
}

export function saveAuthSession(user: LoginUserResponse): AuthSession {
  const session: AuthSession = {
    userId: user.userId,
    loginId: user.loginId,
    name: user.name,
    role: user.role,
    academyId: user.academyId,
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

export function getStoredRole(): AuthSession['role'] {
  return getAuthSession()?.role ?? null
}

export function clearAuthSession() {
  sessionStorage.removeItem(storageKey)
}
