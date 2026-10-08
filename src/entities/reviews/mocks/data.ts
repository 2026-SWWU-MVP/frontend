import type { ReviewData } from "@/entities/reviews/model/types";

export const reviewsMockData: ReviewData = {
  exams: [
    {
      id: "hanbit-korean",
      label: "한빛고 2학년 · 국어 · 2026년 1학기 중간고사",
      meta: "시험지 · 6쪽 · 20문항 · 2026.10.07 업로드",
    },
    {
      id: "seoul-korean",
      label: "서울고 2학년 · 국어 · 2026년 1학기 중간고사",
      meta: "시험지 · 5쪽 · 18문항 · 2026.10.04 업로드",
    },
  ],
  sets: [
    { id: "public-market", label: "공공재와 시장 실패 외 1개 · 총 10문항" },
    { id: "literature", label: "현대 문학의 이해 · 총 8문항" },
  ],
  source: {
    fileName: "한빛고_실제시험_국어.pdf",
    meta: "시험지 · 6쪽 · 20문항 · 2026.10.07 업로드",
    status: "분석 완료",
    scope: "시험 범위: 사회·경제 독서, 문학",
  },
  metrics: {
    actual: "20문항",
    related: "6 / 20",
    newScope: "외부 효과",
    reviewStatus: "검토 중",
  },
  comparison: {
    types: [
      { label: "내용 일치", actual: 8, prepared: 6 },
      { label: "사례 적용", actual: 6, prepared: 2 },
      { label: "추론", actual: 4, prepared: 2 },
      { label: "어휘·개념", actual: 2, prepared: 0 },
    ],
    difficulty: [
      { label: "상", actual: 6, prepared: 4 },
      { label: "중", actual: 12, prepared: 6 },
      { label: "하", actual: 2, prepared: 0 },
    ],
  },
  evidence: [
    {
      number: "12번",
      title: "공공재의 비경합성·비배제성",
      detail: "시험지 3쪽 / 준비 「공공재」 01번 · 개념이 겹침",
      status: "확인",
    },
    {
      number: "13번",
      title: "가로등 비용 부담 사례 적용",
      detail: "시험지 3쪽 / 준비 「공공재」 02번 · 유형이 유사함",
      status: "검토 필요",
    },
    {
      number: "14번",
      title: "외부 효과와 사회적 비용 추론",
      detail: "시험지 4쪽 / 준비 세트에 직접 대응 문항 없음",
      status: "검토 필요",
    },
  ],
  summary: {
    title: "개념에서 사례로, 다음 학습을 연결합니다",
    body: "이번 예시 시험은 공공재 개념과 사례 적용을 함께 다뤘습니다. 솔샘학원은 자료를 바탕으로 외부 효과와 근거 중심의 추론 연습을 보완할 계획입니다.",
  },
  limitations: [
    "업로드한 시험지와 선택한 세트만 비교합니다.",
    "유사 주제라도 요구 사고와 발문이 다를 수 있습니다.",
    "OCR 오류 및 유형 분류 오류가 있을 수 있어 원본 확인이 필요합니다.",
    "난이도는 추정값이며 실제 정답률 자료는 포함되지 않습니다.",
  ],
  note: "다음 시험 준비에 반영할 내용: 공공재의 정의는 충분히 연습했지만, 새로운 사례에서 비용과 편익을 추론하는 연습을 보완할 필요가 있습니다. 다음 수업에는 외부 효과 지문을 추가하고 사례 적용 문항의 근거를 학생이 직접 설명하도록 지도하겠습니다.",
};
