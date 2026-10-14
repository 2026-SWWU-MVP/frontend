import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

import { getMe } from '@/entities/auth/api/repository'
import { loadAcademy } from '@/shared/academy/state'
import { getAuthSession, saveAuthSession } from '@/shared/auth/session'

export function RequireAuth() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const userId = session?.userId ?? null

  // 새로고침·재접속 때 서버 기준 내 정보(학원 소속·역할)로 세션을 맞춘다
  useEffect(() => {
    if (userId === null) return
    let active = true
    getMe()
      .then((me) => {
        if (!active) return
        saveAuthSession(me)
        if (me.academyId === null) {
          navigate('/academy', { replace: true })
          return
        }
        loadAcademy(me.userId).catch(() => undefined)
      })
      // 401은 httpClient가 로그인 화면으로 보낸다
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [userId, navigate])

  if (!session) return <Navigate replace to="/" />
  if (session.academyId === null) return <Navigate replace to="/academy" />
  return <Outlet />
}
