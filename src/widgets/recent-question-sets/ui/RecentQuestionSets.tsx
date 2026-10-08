import { Badge, type BadgeTone } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
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
        <Button variant="text">전체 보기 →</Button>
      </header>
      <div className="recent-question-sets__columns" role="row">
        <span>문제 세트</span>
        <span>진행 상태</span>
        <span>최근 수정</span>
      </div>
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
      <p className="workspace-panel__caption">
        학교평과 모든 자료는 화면 설명을 위한 가상 예시입니다.
      </p>
    </section>
  );
}
