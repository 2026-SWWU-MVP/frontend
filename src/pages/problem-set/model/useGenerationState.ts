import { useState } from "react";

export function useGenerationState() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  return { generating, setGenerating, progress, setProgress };
}
