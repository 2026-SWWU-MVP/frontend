import { appConfig } from '@/shared/config/env'
import { clearAuthSession, getAuthSession, getStoredUserId, saveAuthSession } from '@/shared/auth/session'

import type { ApiClient, ApiRequest } from './types'

export type UserIdProvider = () => string | number | null | undefined

export interface HttpClientOptions {
  userIdProvider?: UserIdProvider
}

export interface ApiErrorBody {
  code?: string
  message?: string
  [key: string]: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  readonly code?: string

  constructor(
    message: string,
    status: number,
    body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.code = isApiErrorBody(body) ? body.code : undefined
  }
}

export class ApiNetworkError extends Error {
  readonly cause: unknown

  constructor(cause: unknown) {
    super('서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 잠시 후 다시 시도해 주세요.')
    this.name = 'ApiNetworkError'
    this.cause = cause
  }
}

export class MissingUserIdError extends Error {
  constructor() {
    super('인증된 사용자 ID가 없어 API 요청을 보낼 수 없습니다.')
    this.name = 'MissingUserIdError'
  }
}

function resolveUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null
}

/** 서버가 안내 문구 없이 실패했을 때(프록시 오류 페이지 등) 보여줄 문구 */
function fallbackMessage(status: number) {
  if (status === 400) return '요청 값이 올바르지 않습니다. 입력한 내용을 확인해 주세요.'
  if (status === 403) return '이 기능을 사용할 권한이 없습니다.'
  if (status === 404) return '찾을 수 없습니다. 삭제되었거나 다른 학원의 자료일 수 있습니다.'
  if (status === 409) return '지금 상태에서는 할 수 없는 작업입니다. 화면을 새로고침한 뒤 다시 시도해 주세요.'
  if (status === 413) return '파일이 너무 큽니다.'
  if (status === 502 || status === 503 || status === 504) return '서버나 AI가 응답하지 않습니다. 잠시 후 다시 시도해 주세요.'
  if (status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  return `요청을 처리하지 못했습니다. (${status})`
}

/** 짧은 일반 텍스트만 오류 문구로 쓴다 (HTML 오류 페이지는 사용자에게 보여주지 않음) */
function isReadableText(body: unknown): body is string {
  return typeof body === 'string' && body.length > 0 && body.length <= 300 && !/<[a-z!/]/i.test(body)
}

/** 학원에서 내보내져 소속이 없어졌으면 학원 연결 화면으로 */
function handleNoAcademy() {
  const session = getAuthSession()
  if (session) saveAuthSession({ ...session, name: session.name ?? '', academyId: null, role: null })
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/academy')) {
    window.location.assign('/academy')
  }
}

function isAuthPath(path: string) {
  const pathname = /^https?:\/\//.test(path) ? new URL(path).pathname : path
  return pathname.replace(/^\/+/, '').startsWith('api/auth/')
}

async function parseResponse<TResponse>(
  response: Response,
  responseType: ApiRequest['responseType'] = 'json',
): Promise<TResponse> {
  if (response.status === 204) {
    return undefined as TResponse
  }

  const contentType = response.headers.get('content-type') ?? ''
  let body: unknown

  if (!response.ok && contentType.includes('application/json')) {
    body = await response.json()
  } else if (responseType === 'blob') {
    body = await response.blob()
  } else if (responseType === 'text') {
    body = await response.text()
  } else if (contentType.includes('application/json')) {
    body = await response.json()
  } else {
    body = await response.text()
  }

  if (!response.ok) {
    const message = isApiErrorBody(body) && typeof body.message === 'string' && body.message
      ? body.message
      : isReadableText(body)
        ? body
        : fallbackMessage(response.status)
    const error = new ApiError(message, response.status, body)
    if (response.status === 403 && error.code === 'NO_ACADEMY') {
      handleNoAcademy()
    }
    if (response.status === 401) {
      clearAuthSession()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    throw error
  }

  return body as TResponse
}

export function createHttpClient(
  baseUrl = appConfig.apiBaseUrl,
  options: HttpClientOptions = {},
): ApiClient {
  const userIdProvider = options.userIdProvider ?? getStoredUserId

  return {
    async request<TResponse>({ path, init, json, responseType, userId, onHeaders }: ApiRequest) {
      const headers = new Headers(init?.headers)
      // 요청에서 Accept를 정했으면 그대로 둔다 (예: 로고 이미지)
      if (!headers.has('Accept')) {
        headers.set('Accept', responseType === 'blob' ? 'application/pdf, application/octet-stream' : 'application/json')
      }

      let body = init?.body
      if (json !== undefined) {
        body = JSON.stringify(json)
        headers.set('Content-Type', 'application/json')
      }

      if (!isAuthPath(path)) {
        const resolvedUserId = userId ?? userIdProvider()
        if (resolvedUserId === undefined || resolvedUserId === null) {
          throw new MissingUserIdError()
        }

        headers.set('X-User-Id', String(resolvedUserId))
      }

      let response: Response
      try {
        response = await fetch(resolveUrl(baseUrl, path), {
          ...init,
          body,
          headers,
        })
      } catch (error) {
        throw new ApiNetworkError(error)
      }

      if (response.ok) onHeaders?.(response.headers)
      return parseResponse<TResponse>(response, responseType)
    },
  }
}

export const httpClient = createHttpClient()
