import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import type { TeamActivity as TeamActivityItem } from "@/entities/workspace/model/types";

import "./TeamActivity.css";

interface TeamActivityProps {
  items: TeamActivityItem[];
}

export function TeamActivity({ items }: TeamActivityProps) {
  return (
    <section className="workspace-panel team-activity">
      <header className="workspace-panel__header">
        <h2>팀 활동</h2>
        <Badge tone="neutral">오늘</Badge>
      </header>
      <div className="team-activity__list">
        {items.map((item) => (
          <article
            className="team-activity__item"
            key={`${item.memberName}-${item.time}`}
          >
            <span className="team-activity__avatar">{item.initials}</span>
            <div>
              <strong>{item.memberName}</strong>
              <p>{item.message}</p>
              <time>{item.time}</time>
            </div>
          </article>
        ))}
      </div>
      <div className="team-activity__footer">
        <Button variant="outline">
          <Icon name="users" size={16} />
          팀원 초대
        </Button>
      </div>
    </section>
  );
}
