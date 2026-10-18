import { useState } from "react";
import type { PastExamResponse } from "@/entities/problem-set/api/repository";

export type SourceMode = "material" | "past-exam";
export type SourceFile = { id: string; name: string; meta: string };
export type PendingUpload = { mode: SourceMode; name: string; failed: boolean };

export function useSourceState() {
  const [uploading, setUploading] = useState(false);
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(1);
  const [examType, setExamType] = useState<"MIDTERM" | "FINAL">("MIDTERM");
  const [pastExam, setPastExam] = useState<PastExamResponse | null>(null);
  const [analyzingPastExam, setAnalyzingPastExam] = useState(false);
  const [pastExamFile, setPastExamFile] = useState<SourceFile | null>(null);
  // 업로드 중이거나 실패한 파일 이름. 자료·기출 탭이 서로의 상태를 덮지 않도록 나눠 둔다
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);

  return {
    uploading, setUploading, examYear, setExamYear,
    semester, setSemester, examType, setExamType, pastExam, setPastExam,
    analyzingPastExam, setAnalyzingPastExam, pastExamFile, setPastExamFile,
    pendingUpload, setPendingUpload,
  };
}
