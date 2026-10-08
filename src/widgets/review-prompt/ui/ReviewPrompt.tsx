import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import type { WorkspaceResponse } from "@/entities/workspace/model/types";

import "./ReviewPrompt.css";

interface ReviewPromptProps {
  prompt: WorkspaceResponse["reviewPrompt"];
}

export function ReviewPrompt({ prompt }: ReviewPromptProps) {
  return (
    <section className="review-prompt">
      <h2>{prompt.title}</h2>
      <Icon name="clipboard-check" size={26} tone="accent" />
      <p>{prompt.description}</p>
      <Button variant="text">{prompt.actionLabel}</Button>
    </section>
  );
}
