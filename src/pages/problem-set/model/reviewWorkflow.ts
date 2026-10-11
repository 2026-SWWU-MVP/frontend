import { regenerateProblem, updateProblem } from "@/entities/problem-set/api/repository";

export function acceptProblem(problemId: number, _request?: { reviewStatus: "ACCEPTED" }) {
  void _request;
  return updateProblem(problemId, { reviewStatus: "ACCEPTED" });
}

export function regenerateReviewedProblem(problemId: number) {
  return regenerateProblem(problemId);
}
