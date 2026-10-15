import { downloadWorksheetPdf } from "@/entities/problem-set/api/repository";

/** 문제지·정답지 PDF를 서버가 정한 파일 이름으로 내려받는다 */
export async function downloadProblemWorksheet(worksheetId: number, answer: boolean) {
  const { blob, filename } = await downloadWorksheetPdf(worksheetId, answer);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
