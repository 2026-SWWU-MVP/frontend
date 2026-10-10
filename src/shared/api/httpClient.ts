import { appConfig } from '@/shared/config/env'
import { clearAuthSession, getStoredUserId } from '@/shared/auth/session'

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
    super('네트워크 오류가 발생했습니다.')
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
    const message = isApiErrorBody(body) && typeof body.message === 'string'
      ? body.message
      : typeof body === 'string' && body.length > 0
        ? body
        : `Request failed with ${response.status}`
    const error = new ApiError(message, response.status, body)
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
    async request<TResponse>({ path, init, json, responseType, userId }: ApiRequest) {
      const headers = new Headers(init?.headers)
      headers.set('Accept', responseType === 'blob' ? 'application/pdf, application/octet-stream' : 'application/json')

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

      return parseResponse<TResponse>(response, responseType)
    },
  }
}

export const httpClient = createHttpClient()
