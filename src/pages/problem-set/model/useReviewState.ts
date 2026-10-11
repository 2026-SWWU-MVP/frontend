import { useState } from "react";

export function useReviewState() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  return { currentQuestionIndex, setCurrentQuestionIndex };
}
