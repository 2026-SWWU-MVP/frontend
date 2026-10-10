import type { WorkspaceResponse } from "@/entities/workspace/model/types";

export const workspaceMockResponse: WorkspaceResponse = {
  title: "오늘의 수업 준비, 한결 가볍게",
  description: "김서연 선생님, 검토를 기다리는 문제 세트가 3개 있어요.",
  primaryActionLabel: "새 문제 세트 만들기",
  preparation: {
    eyebrow: "내신 준비 워크플로",
    steps: "자료 입력 → AI 생성 → 검토 → 확정",
    title: "우리 학원 자료로, 우리 학교에 맞는 문제를",
    description:
      "시험지와 보유 자료를 바탕으로 변형하고, 선생님의 확인을 거쳐 수업에 활용하세요.",
    actionLabel: "이어서 검토하기",
  },
  stats: [
    {
      label: "이번 달 제작 세트",
      value: "24개",
      detail: "데모 · 확정 18 / 초안·검토 6",
    },
    { label: "검토 대기", value: "3개", detail: "데모 · 담당 선생님 2명" },
    {
      label: "축적된 시험 자료",
      value: "12건",
      detail: "데모 · 4개 학교 / 3개 과목",
    },
  ],
  recentQuestionSets: [
    {
      title: "한빛고 2학년 · 공공재와 시장 실패",
      detail: "국어 독서 · 2문항 · 김서연",
      status: "review",
      statusLabel: "공동 검토",
      updatedAt: "오늘 10:24",
    },
    {
      title: "한빛고 2학년 · 문학 표현과 정서",
      detail: "국어 문학 · 8문항 · 박지훈",
      status: "complete",
      statusLabel: "확정 완료",
      updatedAt: "오늘 09:10",
    },
    {
      title: "새솔중 3학년 · 이차함수 활용",
      detail: "수학 · 10문항 · 이미진",
      status: "draft",
      statusLabel: "초안",
      updatedAt: "어제 17:32",
    },
    {
      title: "다온고 1학년 · 지구 환경 변화",
      detail: "통합과학 · 6문항 · 최도윤",
      status: "complete",
      statusLabel: "확정 완료",
      updatedAt: "어제 14:06",
    },
  ],
  teamActivities: [
    {
      initials: "지훈",
      memberName: "박지훈 선생님",
      message: "문항 세트를 확정했어요.",
      time: "09:10",
    },
    {
      initials: "민지",
      memberName: "이미진 선생님",
      message: "1번 문항에 의견을 남겼어요.",
      time: "10:18",
    },
    {
      initials: "서연",
      memberName: "김서연 선생님",
      message: "국어 자료 2건을 추가했어요.",
      time: "10:24",
    },
  ],
  insight: {
    title: "이번 시험 준비 인사이트",
    badgeLabel: "데모 분석",
    headline: "사례 적용형 문항을 더 준비해 보세요",
    description:
      "한빛고 국어 예시 자료 3건에서 사례 적용형이 30%를 차지합니다. 최근 제작 세트의 15%와 비교해 보완을 검토할 수 있어요.",
    actionLabel: "출제 경향 살펴보기",
    metrics: [
      { label: "기출 자료의 사례 적용", value: "30%", percentage: 30 },
      { label: "준비 세트의 사례 적용", value: "15%", percentage: 15 },
    ],
  },
  reviewPrompt: {
    title: "시험 후에도 이어지는 준비",
    description:
      "실제 시험과 준비 문항을 비교해 다음 시험의 학습 계획을 세워보세요.",
    actionLabel: "시험 후 리뷰 시작 →",
  },
};
