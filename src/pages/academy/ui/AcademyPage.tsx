import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { createAcademy, joinAcademy } from '@/entities/auth/api/repository'
import { getAuthSession, saveAuthSession } from '@/shared/auth/session'

import './AcademyPage.css'

export function AcademyPage() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const [mode, setMode] = useState<'create' | 'join'>(session?.role === 'TEACHER' ? 'join' : 'create')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!session) return <Navigate replace to="/login" />
  if (session.academyId !== null) return <Navigate replace to="/workspace" />

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const response = mode === 'create' ? await createAcademy(value) : await joinAcademy(value)
      saveAuthSession(response)
      navigate('/workspace', { replace: true })
    } catch (cause) { setError(cause instanceof Error ? cause.message : '학원 소속을 처리하지 못했습니다.') } finally { setLoading(false) }
  }

  return <main className="academy-page"><div className="academy-card"><span className="academy-mark">▥</span><h1>{mode === 'create' ? '학원을 만들어 시작하세요' : '초대 코드를 입력하세요'}</h1><p>{mode === 'create' ? '학원 이름을 등록하면 나만의 워크스페이스가 만들어집니다.' : '원장님에게 받은 6자리 초대 코드로 학원에 합류합니다.'}</p><div className="academy-tabs"><button className={mode === 'create' ? 'is-active' : ''} onClick={() => setMode('create')} type="button">학원 만들기</button><button className={mode === 'join' ? 'is-active' : ''} onClick={() => setMode('join')} type="button">초대 코드 입력</button></div><form onSubmit={submit}><label>{mode === 'create' ? '학원명' : '초대 코드'}<input value={value} onChange={(event) => setValue(event.target.value)} placeholder={mode === 'create' ? '예: 봄길학원' : '6자리 코드'} required /></label>{error && <p className="academy-error" role="alert">{error}</p>}<button disabled={loading}>{loading ? '처리 중...' : '계속하기'}</button></form></div></main>
}
