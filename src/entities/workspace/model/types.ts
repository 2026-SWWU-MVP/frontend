export type WorkspaceSetStatus = "review" | "complete" | "draft";

export interface WorkspaceStat {
  label: string;
  value: string;
  detail: string;
}

export interface PreparationBanner {
  eyebrow: string;
  steps: string;
  title: string;
  description: string;
  actionLabel: string;
}

export interface RecentQuestionSet {
  title: string;
  detail: string;
  status: WorkspaceSetStatus;
  statusLabel: string;
  updatedAt: string;
}

export interface TeamActivity {
  initials: string;
  memberName: string;
  message: string;
  time: string;
}

export interface InsightMetric {
  label: string;
  value: string;
  percentage: number;
}

export interface WorkspaceResponse {
  title: string;
  description: string;
  primaryActionLabel: string;
  preparation: PreparationBanner;
  stats: WorkspaceStat[];
  recentQuestionSets: RecentQuestionSet[];
  teamActivities: TeamActivity[];
  insight: {
    title: string;
    badgeLabel: string;
    headline: string;
    description: string;
    actionLabel: string;
    metrics: InsightMetric[];
  };
  reviewPrompt: {
    title: string;
    description: string;
    actionLabel: string;
  };
}
