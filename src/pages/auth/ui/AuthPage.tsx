import { useState } from 'react'
import type { FormEvent, InputHTMLAttributes } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { checkLoginId, login, signup } from '@/entities/auth/api/repository'
import { saveAuthSession } from '@/shared/auth/session'

import './AuthPage.css'

function Logo() {
  return <Link className="auth-logo" to="/"><span>▥</span><strong>내신뚝딱</strong></Link>
}

export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({ name: '', loginId: '', password: '', passwordConfirm: '' })
  const [error, setError] = useState('')
  const [loginIdMessage, setLoginIdMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function verifyLoginId() {
    if (!isSignup || !form.loginId) return
    try {
      const result = await checkLoginId(form.loginId)
      setLoginIdMessage(result.available ? '사용할 수 있는 아이디입니다.' : '이미 사용 중인 아이디입니다.')
    } catch (cause) { setLoginIdMessage(cause instanceof Error ? cause.message : '아이디를 확인하지 못했습니다.') }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    if (isSignup && form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      if (isSignup) {
        await signup({ name: form.name, loginId: form.loginId, password: form.password })
        navigate('/login', { replace: true, state: { message: '회원가입이 완료되었습니다. 로그인해 주세요.' } })
      } else {
        const response = await login({ loginId: form.loginId, password: form.password })
        saveAuthSession(response)
        navigate(response.academyId === null ? '/academy' : '/workspace', { replace: true })
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : '요청을 처리하지 못했습니다.') } finally { setLoading(false) }
  }

  const message = (location.state as { message?: string } | null)?.message
  return <div className="auth-page"><header className="auth-header"><Logo /><Link to="/">내신뚝딱 소개 ↗</Link></header><main className="auth-content"><span className="auth-eyebrow">선생님을 위한 내신 준비 워크스페이스</span><h1>오늘의 수업 준비, 한결 가볍게</h1><p>자료 입력부터 AI 생성, 공동 검토, PDF 출력까지. 우리 학원의 준비를 한곳에서 이어가세요.</p><section className="auth-card"><form onSubmit={submit}><h2>{isSignup ? '내신뚝딱 시작하기' : '다시 만나 반가워요'}</h2><p>{isSignup ? '선생님의 자료가 더 좋은 문제의 시작이 됩니다.' : message ?? '로그인하고 준비하던 문제 세트를 이어가세요.'}</p>{isSignup && <Field label="이름" value={form.name} onChange={update('name')} placeholder="홍길동" required />}<Field label="아이디" value={form.loginId} onChange={update('loginId')} onBlur={verifyLoginId} placeholder="teacher" required />{loginIdMessage && <small className="auth-field-message">{loginIdMessage}</small>}<Field label="비밀번호" value={form.password} onChange={update('password')} placeholder={isSignup ? '영문, 숫자 포함 8자 이상' : '비밀번호를 입력하세요'} type="password" required />{isSignup && <Field label="비밀번호 확인" value={form.passwordConfirm} onChange={update('passwordConfirm')} placeholder="비밀번호를 다시 입력하세요" type="password" required />}{error && <p className="auth-error" role="alert">{error}</p>}{!isSignup && <div className="auth-options"><label><input type="checkbox" /> 로그인 상태 유지</label><a href="#password">비밀번호 찾기</a></div>}<button className="auth-submit" disabled={loading}>{loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}</button><p className="auth-switch">{isSignup ? '이미 계정이 있으신가요? ' : '처음이신가요? '}<Link to={isSignup ? '/login' : '/signup'}>{isSignup ? '로그인' : '새 계정 만들기'}</Link></p></form></section></main><footer>© 2026 내신뚝딱. All rights reserved.</footer></div>
}

function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="auth-field"><strong>{label}</strong><input {...props} /></label>
}
