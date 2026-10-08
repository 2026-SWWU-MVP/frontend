import { problemSetMockResponse } from '@/entities/problem-set/mocks/data'
import type { ProblemSetResponse } from '@/entities/problem-set/model/types'
import { createMockRepository } from '@/shared/api/repositories'
import type { Repository } from '@/shared/api/types'

export const problemSetRepository: Repository<void, ProblemSetResponse> = createMockRepository(
  async () => problemSetMockResponse,
)
