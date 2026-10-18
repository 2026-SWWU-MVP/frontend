import { useState } from "react";
import type { PastExamResponse } from "@/entities/problem-set/api/repository";

export function useSourceState() {
  const [uploading, setUploading] = useState(false);
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(1);
  const [examType, setExamType] = useState<"MIDTERM" | "FINAL">("MIDTERM");
  const [pastExam, setPastExam] = useState<PastExamResponse | null>(null);
  const [analyzingPastExam, setAnalyzingPastExam] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);

  return {
    uploading, setUploading, examYear, setExamYear,
    semester, setSemester, examType, setExamType, pastExam, setPastExam,
    analyzingPastExam, setAnalyzingPastExam, selectedFileName, setSelectedFileName,
    uploadFailed, setUploadFailed,
  };
}
