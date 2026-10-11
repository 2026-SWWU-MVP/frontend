import {
  analyzePastExam,
  getPastExamQuestions,
  uploadMaterialPdf,
  uploadPastExam,
} from "@/entities/problem-set/api/repository";

export function uploadMaterial(workspaceId: number, file: File) {
  return uploadMaterialPdf(workspaceId, file);
}

export function uploadPastExamFile(
  workspaceId: number,
  file: File,
  examYear: number,
  semester: number,
  examType: "MIDTERM" | "FINAL",
) {
  return uploadPastExam(workspaceId, file, examYear, semester, examType);
}

export async function extractPastExam(examId: number) {
  await analyzePastExam(examId);
  return getPastExamQuestions(examId);
}
