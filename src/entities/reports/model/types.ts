export type ReportFilters = { period: string; school: string; subject: string };
export type ReportData = {
  filters: { periods: string[]; schools: string[]; subjects: string[] };
  updatedAt: string;
  metrics: {
    sets: string;
    setsDetail: string;
    questions: string;
    questionsDetail: string;
    approval: string;
    approvalDetail: string;
    sources: string;
    sourcesDetail: string;
  };
  trend: Array<{ label: string; created: number; approved: number }>;
  subjects: Array<{ name: string; questions: number; percentage: number }>;
  schools: Array<{
    name: string;
    sets: number;
    questions: number;
    approved: number;
  }>;
  insight: Array<{ number: string; title: string; description: string }>;
};
