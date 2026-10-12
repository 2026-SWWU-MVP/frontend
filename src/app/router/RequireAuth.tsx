import { Navigate, Outlet } from 'react-router-dom'

import { getAuthSession } from '@/shared/auth/session'

export function RequireAuth() {
  const session = getAuthSession()
  if (!session) return <Navigate replace to="/" />
  if (session.academyId === null) return <Navigate replace to="/academy" />
  return <Outlet />
}
