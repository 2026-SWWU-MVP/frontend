/** 학교 + 학년의 누적 출제 경향 (모든 학원 기출의 통계, 원문 없음) */
export interface SchoolTrendResponse {
  schoolId: number;
  schoolName: string;
  grade: number;
  examCount: number;
  contributorCount: number;
  /** 화면 표시용 근거. 예) 학교 DB 기출 4회분 · 학원 2곳 기준 */
  basis: string;
  confidence: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  latestExam: string | null;
  subjectiveRatio: number;
  subjectivePointsRatio: number | null;
  averageQuestions: number;
  types: Array<{ type: string; label: string; ratio: number }>;
  typeMixPerPassage: Record<string, number>;
  byYear: Array<{ year: number; examCount: number; subjectiveRatio: number; typeCounts: Record<string, number> }>;
  highlights: string[];
}

/** 경향 요약 (LLM). 기출이 없으면 headline이 null */
export interface SchoolTrendSummaryResponse {
  schoolId: number;
  grade: number;
  examCount: number;
  basis: string;
  headline: string | null;
  points: string[];
  prepTips: string[];
  llmModel: string | null;
  cached: boolean;
  generatedAt: string | null;
}

/** 학교 DB 기출 회차 (원문·올린 학원은 보이지 않음) */
export interface SchoolExamResponse {
  id: number;
  schoolId: number;
  grade: number;
  examYear: number;
  semester: number;
  examType: "MIDTERM" | "FINAL";
  contributorCount: number;
  stats: {
    totalQuestions: number;
    objectiveCount: number;
    subjectiveCount: number;
    subjectiveRatio: number;
    subjectivePointsRatio: number | null;
    typeCounts: Record<string, number>;
    passageCount: number;
  } | null;
}
