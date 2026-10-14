import {
  createGenerationJob,
  getConfirmedProfile,
  getGeneratedProblems,
} from "@/entities/problem-set/api/repository";
import { ApiError } from "@/shared/api/httpClient";

export const PROFILE_NOT_CONFIRMED_MESSAGE =
  "확정된 출제 프로필이 없습니다. 기출을 올려 분석한 뒤, 출제 프로필을 검토하고 확정해 주세요.";

/** 문제 생성에는 강사가 검토하고 확정한 프로필만 쓴다 (자동으로 만들거나 확정하지 않음) */
export async function resolveConfirmedProfile(workspaceId: number) {
  try {
    return await getConfirmedProfile(workspaceId);
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 404) {
      throw new Error(PROFILE_NOT_CONFIRMED_MESSAGE, { cause });
    }
    throw cause;
  }
}

export async function createProblemGeneration(
  workspaceId: number,
  passageIds: number[],
  profileId: number,
) {
  const job = await createGenerationJob(workspaceId, profileId, passageIds);
  return { job, problems: await getGeneratedProblems(job.id) };
}
