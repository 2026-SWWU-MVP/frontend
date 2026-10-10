import { createMockRepository } from "@/shared/api/repositories";
import type { Repository } from "@/shared/api/types";
import { schoolTrendsMockResponse } from "@/entities/school-trends/mocks/data";
import type {
  SchoolTrendFilters,
  SchoolTrendsResponse,
} from "@/entities/school-trends/model/types";
export const schoolTrendsRepository: Repository<
  SchoolTrendFilters,
  SchoolTrendsResponse
> = createMockRepository(async (filters) => {
  const query = filters.query.trim().toLowerCase();
  const items = schoolTrendsMockResponse.items.filter(
    (item) =>
      (!query || `${item.school} ${item.exam}`.toLowerCase().includes(query)) &&
      (filters.school === "전체 학교" || item.school === filters.school) &&
      (filters.subject === "전체 과목" ||
        item.gradeSubject.includes(filters.subject)) &&
      (filters.exam === "전체 시험" || item.exam === filters.exam),
  );
  return { ...schoolTrendsMockResponse, items };
});
