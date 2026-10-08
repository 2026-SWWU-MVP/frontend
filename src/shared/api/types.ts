export interface ApiRequest {
  path: string
  init?: RequestInit
}

export interface ApiClient {
  request<TResponse>(request: ApiRequest): Promise<TResponse>
}

export interface Repository<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>
}
