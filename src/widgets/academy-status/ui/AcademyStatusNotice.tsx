import { getAuthSession } from '@/shared/auth/session'
import { retryAcademy, useAcademyState } from '@/shared/academy/state'

export function AcademyStatusNotice() {
  const userId = getAuthSession()?.userId ?? null
  const state = useAcademyState(userId)

  if (userId === null || state.status !== 'error') return null

  return (
    <div role="alert">
      학원 정보를 불러오지 못했습니다.
      <button type="button" onClick={() => void retryAcademy(userId)}>다시 시도</button>
    </div>
  )
}
