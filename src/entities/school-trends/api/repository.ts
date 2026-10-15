import { httpClient } from "@/shared/api/httpClient";

import type {
  SchoolExamResponse,
  SchoolTrendResponse,
  SchoolTrendSummaryResponse,
} from "@/entities/school-trends/model/types";

/** GET /api/workspaces/{id}/school-trends - 워크스페이스의 학교·학년 경향 */
export function getSchoolTrends(workspaceId: number) {
  return httpClient.request<SchoolTrendResponse>({ path: `/api/workspaces/${workspaceId}/school-trends` });
}

/** GET /api/workspaces/{id}/school-trends/summary - 요약 문장 (처음엔 수 초, 이후 캐시) */
export function getSchoolTrendSummary(workspaceId: number) {
  return httpClient.request<SchoolTrendSummaryResponse>({
    path: `/api/workspaces/${workspaceId}/school-trends/summary`,
  });
}

/** GET /api/schools/{schoolId}/exams?grade= - 학교 DB 기출 회차 (최신순) */
export function getSchoolExams(schoolId: number, grade: number) {
  return httpClient.request<SchoolExamResponse[]>({ path: `/api/schools/${schoolId}/exams?grade=${grade}` });
}
