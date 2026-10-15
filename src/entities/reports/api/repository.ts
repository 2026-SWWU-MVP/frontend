import { httpClient } from "@/shared/api/httpClient";

import type { ReviewStatsResponse } from "@/entities/reports/model/types";

export function getReviewStats(workspaceId: number) {
  return httpClient.request<ReviewStatsResponse>({ path: `/api/workspaces/${workspaceId}/review-stats` });
}
