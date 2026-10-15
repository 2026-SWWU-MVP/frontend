import { regenerateProblem, updateProblem } from "@/entities/problem-set/api/repository";
import type { UpdateProblemRequest } from "@/entities/problem-set/api/repository";

export function acceptProblem(problemId: number) {
  return updateProblem(problemId, { reviewStatus: "ACCEPTED" });
}

/** 폐기. 사유는 다음 생성 프롬프트에 들어가 같은 실수를 피하게 한다 */
export function rejectProblem(problemId: number, rejectReason?: string) {
  return updateProblem(problemId, { reviewStatus: "REJECTED", ...(rejectReason ? { rejectReason } : {}) });
}

/** 채택·폐기를 취소하고 검수 전으로 되돌린다 */
export function resetProblemReview(problemId: number) {
  return updateProblem(problemId, { reviewStatus: "DRAFT" });
}

export function editProblem(problemId: number, request: Omit<UpdateProblemRequest, "reviewStatus" | "rejectReason">) {
  return updateProblem(problemId, request);
}

export function regenerateReviewedProblem(problemId: number) {
  return regenerateProblem(problemId);
}
