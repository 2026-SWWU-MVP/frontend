export type AcademyPlan = 'BASIC' | 'PRO'

export interface Academy {
  id: number | null
  name: string | null
  plan: AcademyPlan | null
  teacherCount: number | null
  maxTeachers: number | null
  hasLogo: boolean | null
  logoWidth?: number | null
  logoHeight?: number | null
  createdAt: string | null
}

export function getAcademyPlanLabel(plan: AcademyPlan | null) {
  if (plan === null) return '요금제 정보 없음'
  return plan === 'BASIC' ? '베이직' : '프로'
}

export function formatAcademyCreatedAt(createdAt: string | null) {
  if (createdAt === null) return '생성일 정보 없음'
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return '생성일 정보 없음'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(date)
}

const storageKey = 'testfit.academy'

interface StoredAcademy {
  userId: number
  academy: Academy
}

function isAcademy(value: unknown): value is Academy {
  if (typeof value !== 'object' || value === null) return false
  const academy = value as Partial<Academy>
  return (academy.id === null || typeof academy.id === 'number')
    && (academy.name === null || typeof academy.name === 'string')
    && (academy.plan === null || academy.plan === 'BASIC' || academy.plan === 'PRO')
    && (academy.teacherCount === null || typeof academy.teacherCount === 'number')
    && (academy.maxTeachers === null || typeof academy.maxTeachers === 'number')
    && (academy.hasLogo === null || typeof academy.hasLogo === 'boolean')
    && (academy.createdAt === null || typeof academy.createdAt === 'string')
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
