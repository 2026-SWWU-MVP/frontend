export interface ApiRequest {
  path: string
  init?: RequestInit
  /** JSON payload. When provided, the client serializes it and sets Content-Type. */
  json?: unknown
  /** Response decoding strategy. JSON is the default. */
  responseType?: 'json' | 'text' | 'blob'
  /** Optional per-request user ID. A future auth state can provide this instead. */
  userId?: string | number | null
}

export interface ApiClient {
  request<TResponse>(request: ApiRequest): Promise<TResponse>
}

export interface Repository<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>
}
