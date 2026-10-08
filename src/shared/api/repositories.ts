import type { ApiClient, ApiRequest, Repository } from './types'

type MockHandler<TInput, TOutput> = (input: TInput) => TOutput | Promise<TOutput>
type ApiRequestFactory<TInput> = (input: TInput) => ApiRequest

export function createMockRepository<TInput, TOutput>(
  handler: MockHandler<TInput, TOutput>,
): Repository<TInput, TOutput> {
  return {
    execute: async (input) => handler(input),
  }
}

export function createApiRepository<TInput, TOutput>(
  client: ApiClient,
  requestFactory: ApiRequestFactory<TInput>,
): Repository<TInput, TOutput> {
  return {
    execute: (input) => client.request<TOutput>(requestFactory(input)),
  }
}
