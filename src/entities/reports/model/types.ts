/** 검수 집계. acceptanceRate = 채택 / (채택 + 폐기), 검수한 문항이 없으면 null */
export interface ReviewCounts {
  generated: number;
  accepted: number;
  rejected: number;
  /** 아직 검수 전 */
  pending: number;
  /** 강사가 내용을 고친 문항 */
  edited: number;
  acceptanceRate: number | null;
}

/** GET /api/workspaces/{id}/review-stats - 생성 작업이 거듭될수록 채택률이 오르는지 본다 */
export interface ReviewStatsResponse {
  total: ReviewCounts;
  byType: Array<{ type: string; label: string; counts: ReviewCounts }>;
  /** 생성 작업별 (오래된 순) */
  byJob: Array<{ generationJobId: number; createdAt: string; counts: ReviewCounts }>;
}
