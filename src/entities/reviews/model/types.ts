export type ReviewFilters = { examId: string; setId: string };
export type ReviewData = {
  exams: Array<{ id: string; label: string; meta: string }>;
  sets: Array<{ id: string; label: string }>;
  source: { fileName: string; meta: string; status: string; scope: string };
  metrics: {
    actual: string;
    related: string;
    newScope: string;
    reviewStatus: string;
  };
  comparison: {
    types: Array<{ label: string; actual: number; prepared: number }>;
    difficulty: Array<{ label: string; actual: number; prepared: number }>;
  };
  evidence: Array<{
    number: string;
    title: string;
    detail: string;
    status: "확인" | "검토 필요";
  }>;
  summary: { title: string; body: string };
  limitations: string[];
  note: string;
};
