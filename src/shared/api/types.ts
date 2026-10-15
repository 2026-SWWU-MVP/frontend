export interface ApiRequest {
  path: string
  init?: RequestInit
  /** JSON payload. When provided, the client serializes it and sets Content-Type. */
  json?: unknown
  /** Response decoding strategy. JSON is the default. */
  responseType?: 'json' | 'text' | 'blob'
  /** Optional per-request user ID. A future auth state can provide this instead. */
  userId?: string | number | null
  /** 응답 헤더가 필요할 때 (예: 파일 이름 Content-Disposition) */
  onHeaders?: (headers: Headers) => void
}

export interface ApiClient {
  request<TResponse>(request: ApiRequest): Promise<TResponse>
}

export interface Repository<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>
}
