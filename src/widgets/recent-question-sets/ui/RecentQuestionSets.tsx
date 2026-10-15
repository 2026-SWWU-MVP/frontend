import { Badge, type BadgeTone } from "@/shared/ui/Badge/Badge";
import type { RecentQuestionSet } from "@/entities/workspace/model/types";

import "./RecentQuestionSets.css";

interface RecentQuestionSetsProps {
  items: RecentQuestionSet[];
}

function getStatusTone(status: RecentQuestionSet["status"]): BadgeTone {
  if (status === "review") return "review";
  if (status === "complete") return "success";
  return "neutral";
}

export function RecentQuestionSets({ items }: RecentQuestionSetsProps) {
  return (
    <section className="workspace-panel recent-question-sets">
      <header className="workspace-panel__header">
        <h2>최근 문제 세트</h2>
      </header>
      <div className="recent-question-sets__columns" role="row">
        <span>문제 세트</span>
        <span>진행 상태</span>
        <span>최근 수정</span>
      </div>
      {items.length === 0 && <p className="workspace-panel__caption">아직 만든 시험지가 없습니다.</p>}
      <div className="recent-question-sets__list">
        {items.map((item) => (
          <article className="recent-question-set" key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
            <Badge tone={getStatusTone(item.status)}>{item.statusLabel}</Badge>
            <time>{item.updatedAt}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
