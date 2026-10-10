export type AcademyPlan = 'BASIC' | 'PRO'

export interface Academy {
  id: number
  name: string
  plan: AcademyPlan
  teacherCount: number
  maxTeachers: number
  hasLogo: boolean
  logoWidth?: number | null
  logoHeight?: number | null
  createdAt: string
}

const storageKey = 'testfit.academy'

interface StoredAcademy {
  userId: number
  academy: Academy
}

function isAcademy(value: unknown): value is Academy {
  if (typeof value !== 'object' || value === null) return false
  const academy = value as Partial<Academy>
  return typeof academy.id === 'number'
    && typeof academy.name === 'string'
    && (academy.plan === 'BASIC' || academy.plan === 'PRO')
    && typeof academy.teacherCount === 'number'
    && typeof academy.maxTeachers === 'number'
    && typeof academy.hasLogo === 'boolean'
    && typeof academy.createdAt === 'string'
}

export function saveAcademy(userId: number, academy: Academy) {
  sessionStorage.setItem(storageKey, JSON.stringify({ userId, academy } satisfies StoredAcademy))
  return academy
}

export function getStoredAcademy(userId?: number): Academy | null {
  const stored = sessionStorage.getItem(storageKey)
  if (!stored) return null

  try {
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return null
    const value = parsed as Partial<StoredAcademy>
    return typeof value.userId === 'number'
      && (userId === undefined || value.userId === userId)
      && isAcademy(value.academy)
      ? value.academy
      : null
  } catch {
    return null
  }
}

export function clearStoredAcademy() {
  sessionStorage.removeItem(storageKey)
}
