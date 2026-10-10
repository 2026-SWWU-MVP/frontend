import type {
  SchoolTrendsResponse,
  TrendItem,
} from "@/entities/school-trends/model/types";

const trends: TrendItem[] = [
  {
    id: "hanbit-korean",
    school: "한빛고등학교",
    gradeSubject: "2학년 · 국어",
    exam: "1학기 중간",
    size: "3건 · 60문항",
    updatedAt: "10.05",
    sourceCount: 3,
    reviewComplete: true,
    distribution: [
      { label: "내용 일치", percentage: 40, count: 24 },
      { label: "사례 적용", percentage: 30, count: 18 },
      { label: "추론", percentage: 20, count: 12 },
      { label: "어휘·개념", percentage: 10, count: 6 },
    ],
    insight:
      "내용 일치가 가장 많고, 낯선 상황에 개념을 적용하는 문항도 반복됩니다.",
  },
  {
    id: "hanbit-math",
    school: "한빛고등학교",
    gradeSubject: "2학년 · 수학",
    exam: "1학기 기말",
    size: "2건 · 40문항",
    updatedAt: "09.30",
    sourceCount: 2,
    reviewComplete: true,
    distribution: [
      { label: "개념 이해", percentage: 45, count: 18 },
      { label: "계산", percentage: 30, count: 12 },
      { label: "문제 해결", percentage: 25, count: 10 },
    ],
    insight: "기본 개념을 변형한 계산 문항과 문제 해결 문항의 비중이 높습니다.",
  },
  {
    id: "sejong-math",
    school: "세종중학교",
    gradeSubject: "3학년 · 수학",
    exam: "2학기 중간",
    size: "3건 · 60문항",
    updatedAt: "09.28",
    sourceCount: 3,
    reviewComplete: false,
    distribution: [
      { label: "개념 이해", percentage: 35, count: 21 },
      { label: "문제 해결", percentage: 35, count: 21 },
      { label: "추론", percentage: 30, count: 18 },
    ],
    insight:
      "개념을 새로운 조건에 적용하고 풀이 과정을 설명하는 문항이 중심입니다.",
  },
  {
    id: "daon-science",
    school: "다온고등학교",
    gradeSubject: "1학년 · 통합과학",
    exam: "1학기 기말",
    size: "2건 · 40문항",
    updatedAt: "09.26",
    sourceCount: 2,
    reviewComplete: true,
    distribution: [
      { label: "자료 해석", percentage: 40, count: 16 },
      { label: "개념 이해", percentage: 35, count: 14 },
      { label: "탐구 설계", percentage: 25, count: 10 },
    ],
    insight: "자료를 해석하고 개념을 연결하는 문항이 고르게 출제되었습니다.",
  },
  {
    id: "eunsol-korean",
    school: "은솔중학교",
    gradeSubject: "1학년 · 국어",
    exam: "2학기 중간",
    size: "2건 · 40문항",
    updatedAt: "09.24",
    sourceCount: 2,
    reviewComplete: false,
    distribution: [
      { label: "내용 이해", percentage: 40, count: 16 },
      { label: "표현", percentage: 35, count: 14 },
      { label: "문법", percentage: 25, count: 10 },
    ],
    insight:
      "본문 이해를 바탕으로 표현과 문법을 함께 확인하는 구성이 많습니다.",
  },
];
export const schoolTrendsMockResponse: SchoolTrendsResponse = {
  items: trends,
  totalSchools: 4,
  totalSubjects: 3,
  totalUploads: 12,
};
