import { appConfig } from '@/shared/config/env'

import type { ApiClient, ApiRequest } from './types'

export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function resolveUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  if (response.status === 204) {
    return undefined as TResponse
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof body === 'string' ? body : `Request failed with ${response.status}`
    throw new ApiError(message, response.status)
  }

  return body as TResponse
}

export function createHttpClient(baseUrl = appConfig.apiBaseUrl): ApiClient {
  return {
    async request<TResponse>({ path, init }: ApiRequest) {
      const response = await fetch(resolveUrl(baseUrl, path), {
        ...init,
        headers: {
          Accept: 'application/json',
          ...init?.headers,
        },
      })

      return parseResponse<TResponse>(response)
    },
  }
}

export const httpClient = createHttpClient()
