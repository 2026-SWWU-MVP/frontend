import { createMockRepository } from "@/shared/api/repositories";
import type { Repository } from "@/shared/api/types";
import { reviewsMockData } from "@/entities/reviews/mocks/data";
import type { ReviewData, ReviewFilters } from "@/entities/reviews/model/types";

export const reviewsRepository: Repository<ReviewFilters, ReviewData> =
  createMockRepository(async (filters) => {
    if (filters.examId === "seoul-korean")
      return {
        ...reviewsMockData,
        metrics: {
          ...reviewsMockData.metrics,
          actual: "18문항",
          related: "5 / 18",
          newScope: "자료 해석",
        },
        source: {
          ...reviewsMockData.source,
          fileName: "서울고_실제시험_국어.pdf",
          meta: "시험지 · 5쪽 · 18문항 · 2026.10.04 업로드",
        },
      };
    if (filters.setId === "literature")
      return {
        ...reviewsMockData,
        comparison: {
          ...reviewsMockData.comparison,
          types: reviewsMockData.comparison.types.map((item) => ({
            ...item,
            prepared: Math.max(0, item.prepared - 1),
          })),
        },
        summary: {
          ...reviewsMockData.summary,
          title: "작품 이해에서 표현으로, 다음 학습을 연결합니다",
        },
      };
    return reviewsMockData;
  });
