import {
  createWorksheet,
  downloadWorksheetPdf,
  getAcceptedProblems,
  getWorksheet,
} from "@/entities/problem-set/api/repository";

export async function createProblemWorksheet(
  workspaceId: number,
  title: string,
) {
  const accepted = await getAcceptedProblems(workspaceId);
  const worksheet = await createWorksheet(workspaceId, {
    title,
    problemIds: accepted.map((problem) => problem.id),
    headerText: "?섏뾽??臾몄젣吏",
    showLogo: true,
  });
  await getWorksheet(worksheet.id);
  return worksheet;
}

export function downloadProblemWorksheet(worksheetId: number, answer: boolean) {
  return downloadWorksheetPdf(worksheetId, answer);
}
