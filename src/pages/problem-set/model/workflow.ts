import type { PastExamResponse, ProblemResponse } from "@/entities/problem-set/api/repository";
import {
  getGenerationJob,
  getMaterial,
  getPastExam,
} from "@/entities/problem-set/api/repository";
import type { ProblemQuestion } from "@/entities/problem-set/model/types";

export const problemSetStages = [
  { id: "source", label: "자료 입력" },
  { id: "generation", label: "AI 생성" },
  { id: "review", label: "공동 검토" },
  { id: "output", label: "확정·출력" },
] as const;

export function problemResponseToQuestion(
  problem: ProblemResponse,
  index: number,
): ProblemQuestion {
  return {
    id: String(problem.id),
    number: index + 1,
    stage: "review",
    stageLabel: problem.typeLabel ?? problem.type ?? "",
    title: problem.stem ?? problem.body ?? "",
    prompt: problem.stem ?? problem.body ?? "",
    answerText: problem.answerText,
    explanation: problem.explanation,
    reviewStatus: problem.reviewStatus,
    choices: (problem.choices ?? []).map((choice, choiceIndex) => ({
      id: `${problem.id}-${choiceIndex}`,
      label: String.fromCharCode(65 + choiceIndex),
      text: choice,
    })),
  };
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export async function waitForMaterialSplit(materialId: number) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const material = await getMaterial(materialId);
    if (material.status === "SPLIT" || material.status === "FAILED") return material;
    await wait(2000);
  }
  throw new Error("자료 분리 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
}

export async function waitForPastExamExtraction(
  examId: number,
  onStatus: (status: PastExamResponse["status"]) => void,
) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const exam = await getPastExam(examId);
    onStatus(exam.status);
    if (exam.status === "EXTRACTED" || exam.status === "FAILED") return exam;
    await wait(2000);
  }
  throw new Error("기출 분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
}

export async function waitForGeneration(
  jobId: number,
  onProgress: (progress: number) => void,
) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const job = await getGenerationJob(jobId);
    onProgress(job.progress ?? 0);
    if (job.status === "COMPLETED" || job.status === "FAILED") return job;
    await wait(2000);
  }
  throw new Error("문제 생성 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
}
