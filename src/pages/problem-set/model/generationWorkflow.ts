import {
  confirmProfile,
  createGenerationJob,
  createProfile,
  getConfirmedProfile,
  getGeneratedProblems,
  getProfile,
  listProfiles,
} from "@/entities/problem-set/api/repository";
import { ApiError } from "@/shared/api/httpClient";

export async function resolveConfirmedProfile(workspaceId: number) {
  try {
    return await getConfirmedProfile(workspaceId);
  } catch (cause) {
    if (!(cause instanceof ApiError) || cause.status !== 404) throw cause;
    const profiles = await listProfiles(workspaceId);
    const draftSummary = profiles
      .filter((item) => item.status === "DRAFT")
      .sort((left, right) => right.version - left.version)[0];
    const draft = draftSummary
      ? await getProfile(draftSummary.id)
      : await createProfile(workspaceId);
    return draft.status === "CONFIRMED" ? draft : confirmProfile(draft.id);
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
