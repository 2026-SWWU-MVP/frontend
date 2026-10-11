import type { PastExamResponse, ProblemResponse } from "@/entities/problem-set/api/repository";
import {
  getGenerationJob,
  getMaterial,
  getPastExam,
} from "@/entities/problem-set/api/repository";
import type { ProblemQuestion } from "@/entities/problem-set/model/types";

export const problemSetStages = [
  { id: "source", label: "?먮즺 ?낅젰" },
  { id: "generation", label: "AI ?앹꽦" },
  { id: "review", label: "怨듬룞 寃??" },
  { id: "output", label: "?뺤젙쨌異쒕젰" },
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
  throw new Error("?먮즺 遺꾨━ ?쒓컙??珥덇낵?섏뿀?듬땲??");
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
  throw new Error("湲곗텧 遺꾩꽍 ?쒓컙??珥덇낵?섏뿀?듬땲??");
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
  throw new Error("臾몄젣 ?앹꽦 ?쒓컙??珥덇낵?섏뿀?듬땲??");
}
