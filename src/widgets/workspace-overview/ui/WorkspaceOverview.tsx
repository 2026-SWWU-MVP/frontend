import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import type {
  PreparationBanner,
  WorkspaceStat,
} from "@/entities/workspace/model/types";

import "./WorkspaceOverview.css";

interface WorkspaceOverviewProps {
  title: string;
  description: string;
  primaryActionLabel: string;
  preparation: PreparationBanner;
  stats: WorkspaceStat[];
}

export function WorkspaceOverview({
  title,
  description,
  primaryActionLabel,
  preparation,
  stats,
}: WorkspaceOverviewProps) {
  return (
    <>
      <section className="workspace-page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Button variant="primary">
          <Icon name="plus" size={16} tone="default" />
          {primaryActionLabel}
        </Button>
      </section>

      <section className="preparation-banner">
        <div className="preparation-banner__icon">
          <Icon name="layers" size={30} tone="accent" />
        </div>
        <div className="preparation-banner__content">
          <div className="preparation-banner__meta">
            <strong>{preparation.eyebrow}</strong>
            <span>{preparation.steps}</span>
          </div>
          <h2>{preparation.title}</h2>
          <p>{preparation.description}</p>
        </div>
        <Button>{preparation.actionLabel}</Button>
      </section>

      <section aria-label="워크스페이스 요약" className="workspace-stats">
        {stats.map((stat) => (
          <article className="workspace-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>
    </>
  );
}
