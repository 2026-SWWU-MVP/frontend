import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import type { WorkspaceResponse } from "@/entities/workspace/model/types";

import "./ExamInsight.css";

interface ExamInsightProps {
  insight: WorkspaceResponse["insight"];
}

export function ExamInsight({ insight }: ExamInsightProps) {
  return (
    <section className="workspace-panel exam-insight">
      <header className="workspace-panel__header">
        <h2>{insight.title}</h2>
        <Badge tone="accent">{insight.badgeLabel}</Badge>
      </header>
      <div className="exam-insight__body">
        <div className="exam-insight__copy">
          <h3>{insight.headline}</h3>
          <p>{insight.description}</p>
          <Button variant="text">{insight.actionLabel} →</Button>
        </div>
        <div className="exam-insight__metrics">
          {insight.metrics.map((metric) => (
            <div className="exam-insight__metric" key={metric.label}>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
              <div className="exam-insight__track">
                <span style={{ width: `${metric.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
