import type {
  ProfileOrigin,
  ProfileStatus,
  RuleCategory,
  RuleSource,
} from "@/entities/problem-set/api/repository";

/** 백엔드 QuestionType 이름 (pastexam/extraction/QuestionType.java) */
export const questionTypeLabels: Record<string, string> = {
  OBJ_MAIN_IDEA: "주제·제목·요지",
  OBJ_DETAIL: "내용 일치",
  OBJ_BLANK: "빈칸 추론",
  OBJ_GRAMMAR: "어법",
  OBJ_VOCAB: "어휘",
  OBJ_ORDER: "글의 순서",
  OBJ_INSERT: "문장 삽입",
  OBJ_IRRELEVANT: "무관한 문장",
  OBJ_REFERENCE: "지칭 대상",
  OBJ_SUMMARY: "요약문 완성(객관식)",
  OBJ_LISTENING: "듣기",
  OBJ_OTHER: "기타 객관식",
  SUMMARY_BLANK: "요약문 빈칸",
  SENTENCE_ORDER: "어구 배열",
  GRAMMAR_FIX: "어법 오류 수정",
  GUIDED_WRITING: "조건 영작",
  SUBJ_SHORT_ANSWER: "단답형",
  SUBJ_OTHER: "기타 서술형",
};

/** 문제 생성이 가능한 서술형 유형 (지문당 유형 구성에 쓸 수 있는 것) */
export const generatableTypes = [
  "SUMMARY_BLANK",
  "SENTENCE_ORDER",
  "GRAMMAR_FIX",
  "GUIDED_WRITING",
] as const;

export function questionTypeLabel(type: string) {
  return questionTypeLabels[type] ?? type;
}

export const profileStatusLabels: Record<ProfileStatus, string> = {
  DRAFT: "검토 중 초안",
  CONFIRMED: "확정",
  SUPERSEDED: "이전 확정본",
};

export const profileOriginLabels: Record<ProfileOrigin, string> = {
  INITIAL_ANALYSIS: "기출 분석",
  AI_RECHECK: "AI 재검토",
  TEACHER_FEEDBACK: "강사 의견 반영",
  MANUAL_EDIT: "직접 수정",
};

export const ruleSourceLabels: Record<RuleSource, string> = {
  PAST_EXAM: "기출",
  SCHOOL_DB: "학교 DB",
  TEACHER: "강사",
};

export const ruleCategoryLabels: Record<RuleCategory, string> = {
  QUESTION_TYPE: "출제 유형",
  CONDITION: "조건",
  PASSAGE_USE: "지문 활용",
  GRAMMAR_POINT: "문법·어휘",
  SCORING: "배점",
  OTHER: "기타",
};
