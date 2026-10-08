import type { ReportData } from "@/entities/reports/model/types";

export const reportsMockData: ReportData = {
  filters: {
    periods: [
      "2026.10.01 ~ 2026.10.07",
      "2026.09.24 ~ 2026.09.30",
      "2026.09.17 ~ 2026.09.23",
    ],
    schools: ["전체 학교", "한빛고", "세솔중", "다온고", "은솔고"],
    subjects: ["전체 과목", "국어", "수학", "통합과학"],
  },
  updatedAt: "2026.10.07 10:45",
  metrics: {
    sets: "24개",
    setsDetail: "초안 3 · 검토 중 3 · 확정 18",
    questions: "156문항",
    questionsDetail: "국어 84 · 수학 48 · 통합과학 24",
    approval: "75%",
    approvalDetail: "18 / 24세트 · 교사 확인 기준",
    sources: "12건",
    sourcesDetail: "4개 학교 · 사용자 업로드",
  },
  trend: [
    { label: "1~2일", created: 4, approved: 3 },
    { label: "3~4일", created: 5, approved: 4 },
    { label: "5~6일", created: 7, approved: 5 },
    { label: "7일", created: 8, approved: 6 },
  ],
  subjects: [
    { name: "국어", questions: 84, percentage: 54 },
    { name: "수학", questions: 48, percentage: 31 },
    { name: "통합과학", questions: 24, percentage: 15 },
  ],
  schools: [
    { name: "한빛고", sets: 10, questions: 64, approved: 8 },
    { name: "세솔중", sets: 6, questions: 40, approved: 4 },
    { name: "다온고", sets: 5, questions: 32, approved: 4 },
    { name: "은솔고", sets: 3, questions: 20, approved: 2 },
  ],
  insight: [
    {
      number: "01",
      title: "검토 대기 3세트를 먼저 확인하세요",
      description: "담당자를 지정해 확정 전 문항·해설 검검을 마무리하세요.",
    },
    {
      number: "02",
      title: "사례 적용률을 보완해 보세요",
      description:
        "최근 준비 세트 15% vs 한빛고 기출 예시 30%. 비교 범위가 다르므로 교사 판단이 필요합니다.",
    },
    {
      number: "03",
      title: "실제 시험으로 준비를 돌아보세요",
      description:
        "시험 후 리뷰에서 주제·유형 차이를 확인하고 다음 수업 계획에 반영하세요.",
    },
  ],
};
