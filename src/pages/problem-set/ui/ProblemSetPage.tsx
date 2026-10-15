import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createGenerationJob,
  getGeneratedProblems,
  getGenerationJob,
  getWorksheet,
  createWorksheet,
  getMaterial,
  analyzePastExam,
  getPastExam,
  getPastExamQuestions,
  uploadMaterialText,
} from "@/entities/problem-set/api/repository";
import type {
  MaterialResponse,
  PastExamResponse,
  ProblemResponse,
} from "@/entities/problem-set/api/repository";
import type {
  ProblemQuestion,
  ProblemSetResponse,
  ProblemSetStage,
} from "@/entities/problem-set/model/types";
import { buildProblemSetName } from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import { resolveWorkspaceId } from "@/entities/workspace/api/repository";
import { getAuthSession } from "@/shared/auth/session";
import { getStoredAcademy } from "@/shared/academy/academy";
import { useAcademyState } from "@/shared/academy/state";
import "./ProblemSetPage.css";
import {
  uploadMaterial as uploadMaterialWorkflow,
  uploadPastExamFile as uploadPastExamWorkflow,
} from "@/pages/problem-set/model/sourceWorkflow";
import {
  acceptProblem,
  editProblem,
  regenerateReviewedProblem,
  rejectProblem,
  resetProblemReview,
} from "@/pages/problem-set/model/reviewWorkflow";
import type { ReviewAction, ReviewEdit } from "@/pages/problem-set/ui/ReviewStage";
import { downloadProblemWorksheet } from "@/pages/problem-set/model/outputWorkflow";
import { SourceStage } from "@/pages/problem-set/ui/SourceStage";
import { GenerationStage } from "@/pages/problem-set/ui/GenerationStage";
import type { GenerationSelection } from "@/pages/problem-set/ui/GenerationStage";
import { ReviewStage } from "@/pages/problem-set/ui/ReviewStage";
import { OutputStage } from "@/pages/problem-set/ui/OutputStage";
import { useSourceState } from "@/pages/problem-set/model/useSourceState";
import { useGenerationState } from "@/pages/problem-set/model/useGenerationState";
import { useReviewState } from "@/pages/problem-set/model/useReviewState";
import {
  problemResponseToQuestion as toProblemQuestion,
  waitForGeneration as waitForGenerationWorkflow,
  waitForPastExamExtraction as waitForPastExamExtractionWorkflow,
} from "@/pages/problem-set/model/workflow";

const stages: Array<{ id: ProblemSetStage; label: string }> = [
  { id: "source", label: "자료 입력" },
  { id: "generation", label: "AI 생성" },
  { id: "review", label: "문항 검토" },
  { id: "output", label: "확정·출력" },
];

/* Legacy stage labels retained below for reference only.
const brokenStages: Array<{ id: ProblemSetStage; label: string }> = [
  { id: "source", label: "자료 입력" },
  { id: "generation", label: "AI 생성" },
  { id: "review", label: "문항 검토" },
  { id: "output", label: "확정·출력" },
];

const legacyStages: Array<{ id: ProblemSetStage; label: string }> = [
  { id: "source", label: "자료 입력" },
  { id: "generation", label: "AI 생성" },
  { id: "review", label: "공동 검토" },
  { id: "output", label: "확정·출력" },
];

*/

const emptyProblemSet: ProblemSetResponse = {
  id: "backend-problem-set",
  title: "",
  description: "",
  questions: [],
  files: [],
  school: "",
  grade: "",
  subject: "",
  area: "",
  exam: "",
  passage: "",
};

function problemResponseToQuestion(
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
    explanation: problem.explanation ?? undefined,
    reviewStatus: problem.reviewStatus,
    choices: (problem.choices ?? []).map((choice, choiceIndex) => ({
      id: `${problem.id}-${choiceIndex}`,
      label: String.fromCharCode(65 + choiceIndex),
      text: choice,
    })),
  };
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function waitForMaterialSplitLegacy(materialId: number) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const material = await getMaterial(materialId);
    if (material.status === "SPLIT" || material.status === "FAILED") {
      return material;
    }
    await wait(2000);
  }
  throw new Error(
    "자료 분리 시간이 초과되었습니다. 잠시 후 상태를 다시 확인해 주세요.",
  );
}

async function waitForPastExamExtractionLegacy(
  examId: number,
  onStatus: (status: PastExamResponse["status"]) => void,
) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const exam = await getPastExam(examId);
    onStatus(exam.status);
    if (exam.status === "EXTRACTED" || exam.status === "FAILED") return exam;
    await wait(2000);
  }
  throw new Error(
    "기출 분석 시간이 초과되었습니다. 잠시 후 상태를 다시 확인해 주세요.",
  );
}

async function waitForGenerationLegacy(
  jobId: number,
  onProgress: (progress: number) => void,
) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const job = await getGenerationJob(jobId);
    onProgress(job.progress ?? 0);
    if (job.status === "COMPLETED" || job.status === "FAILED") {
      return job;
    }
    await wait(2000);
  }
  throw new Error(
    "문제 생성 시간이 초과되었습니다. 잠시 후 다시 확인해 주세요.",
  );
}
function Stepper({ stage }: { stage: ProblemSetStage }) {
  const active = stages.findIndex((item) => item.id === stage);
  return (
    <div className="set-stepper">
      {stages.map((item, index) => (
        <div
          className={`set-step${index <= active ? " is-active" : ""}`}
          key={item.id}
        >
          <span>{index < active ? "✓" : index + 1}</span>
          <strong>{item.label}</strong>
          {index < 3 && <Icon name="chevron-right" size={14} />}
        </div>
      ))}
    </div>
  );
}
function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="set-field">
      <strong>{label}</strong>
      <span>
        {value}
        <Icon name="chevron-down" size={14} />
      </span>
    </label>
  );
}
function LegacyFiles({
  files,
  selected = false,
}: {
  files: ProblemSetResponse["files"];
  selected?: boolean;
}) {
  return (
    <div className="file-list">
      {files.map((file) => (
        <div className="set-file" key={file.id}>
          <span className="file-icon">
            <Icon name="files" size={18} tone="accent" />
          </span>
          <div>
            <strong>{file.name}</strong>
            <small>{file.meta}</small>
          </div>
          <em>{selected ? "선택됨" : "분석 완료"}</em>
        </div>
      ))}
    </div>
  );
}

function LegacyPendingFile({
  name,
  uploading,
  failed,
}: {
  name: string;
  uploading: boolean;
  failed: boolean;
}) {
  return (
    <div className="file-list">
      <div className="set-file">
        <span className="file-icon">
          <Icon name="files" size={18} tone="accent" />
        </span>
        <div>
          <strong>{name}</strong>
          <small>
            {uploading
              ? "업로드 중..."
              : failed
                ? "업로드 실패"
                : "파일 선택됨"}
          </small>
        </div>
        <em className={failed ? "is-failed" : ""}>
          {uploading ? "업로드 중" : failed ? "실패" : "대기 중"}
        </em>
      </div>
    </div>
  );
}

function LegacyDisplayedFiles({
  files,
  selected = false,
}: {
  files: ProblemSetResponse["files"];
  selected?: boolean;
}) {
  return (
    <div className="file-list">
      {files.map((file) => {
        const analyzed = /SPLIT|EXTRACTED/.test(file.meta);
        return (
          <div className="set-file" key={file.id}>
            <span className="file-icon">
              <Icon name="files" size={18} tone="accent" />
            </span>
            <div>
              <strong>{file.name}</strong>
              <small>{file.meta}</small>
            </div>
            <em>
              {selected ? "선택됨" : analyzed ? "분석 완료" : "업로드 완료"}
            </em>
          </div>
        );
      })}
    </div>
  );
}

void LegacyPendingFile;
void problemResponseToQuestion;
void waitForMaterialSplitLegacy;
void waitForPastExamExtractionLegacy;
void waitForGenerationLegacy;

void LegacyFiles;
void LegacyInfoCard;

void LegacyDisplayedFiles;

function Header({
  data,
  stage,
}: {
  data: ProblemSetResponse;
  stage: ProblemSetStage;
}) {
  return (
    <div className="set-heading">
      <div>
        <small>
          문제 세트 / {stages.find((item) => item.id === stage)?.label}
        </small>
        <h1>
          {stage === "source"
            ? "먼저, 문제의 바탕이 될 자료를 담아주세요"
            : stage === "generation"
              ? "학교의 맥락을 담아, 문항을 설계하세요"
              : stage === "review"
                ? data.title
                : "검토를 마친 문제, 수업에 바로 준비하세요"}
        </h1>
        <p>
          {stage === "source"
            ? "시험지·보유 교재를 올리거나 지문과 문항을 직접 입력할 수 있습니다."
            : `${data.school} · ${data.grade} · ${data.subject} · ${data.exam}`}
        </p>
      </div>
      <Button variant="secondary">▣ 초안 저장</Button>
    </div>
  );
}
function LegacyInfoCard({ data }: { data: ProblemSetResponse }) {
  return (
    <section className="set-card info-card">
      <h2>문제 세트 정보</h2>
      <label className="set-field full">
        <strong>세트 이름</strong>
        <input value="한빛고 2학년 · 공공재와 시장 실패" readOnly />
      </label>
      <div className="field-grid">
        <SelectField label="학교" value={data.school} />
        <SelectField label="학년" value={data.grade} />
        <SelectField label="과목" value={data.subject} />
        <SelectField label="영역" value={data.area} />
      </div>
      <SelectField label="시험" value={data.exam} />
      <label className="set-field full">
        <strong>시험 범위</strong>
        <input value={data.scope} readOnly />
      </label>
      <small className="field-help">
        학교와 과목은 직접 입력해 추가할 수 있습니다. 등록된 목록에 없는 경우도
        생성 가능해요.
      </small>
    </section>
  );
}

const schoolOptions = ["건대부고", "압구정고", "현대고"];
const gradeOptions = ["1", "2", "3", "4", "5", "6"];
const subjectOptions = ["국어", "영어", "사회", "과학", "수학"];
const examOptions = ["중간고사", "기말고사"];

function InfoCard({
  school,
  grade,
  subject,
  exam,
  onChange,
}: {
  school: string;
  grade: string;
  subject: string;
  exam: string;
  onChange: (
    key: "school" | "grade" | "subject" | "exam",
    value: string,
  ) => void;
}) {
  const field = (
    label: string,
    value: string,
    options: string[],
    key: "school" | "grade" | "subject" | "exam",
  ) => (
    <label className="set-field">
      <strong>{label}</strong>
      <select
        value={value}
        onChange={(event) => onChange(key, event.target.value)}
      >
        <option value="">선택해 주세요</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section className="set-card info-card">
      <h2>문제 세트 정보</h2>
      {field("학교", school, schoolOptions, "school")}
      {field("학년", grade, gradeOptions, "grade")}
      {field("과목", subject, subjectOptions, "subject")}
      {field("시험", exam, examOptions, "exam")}
      <small className="field-help">
        학교, 학년, 과목, 시험을 모두 선택하면 문제 세트 이름이 자동으로
        생성됩니다.
      </small>
    </section>
  );
}

void InfoCard;

export function ProblemSetPage() {
  const navigate = useNavigate();
  const userId = getAuthSession()?.userId ?? null;
  const academyState = useAcademyState(userId);
  const academy = getStoredAcademy(userId ?? undefined);
  const [data, setData] = useState<ProblemSetResponse>(emptyProblemSet);
  const [setInfo, setSetInfo] = useState({
    school: "",
    grade: "",
    subject: "",
    exam: "",
  });
  const [stage, setStage] = useState<ProblemSetStage>("source");
  const { currentQuestionIndex, setCurrentQuestionIndex } = useReviewState();
  const {
    uploading,
    setUploading,
    sourceMode,
    setSourceMode,
    examYear,
    setExamYear,
    semester,
    setSemester,
    examType,
    setExamType,
    pastExam,
    setPastExam,
    analyzingPastExam,
    setAnalyzingPastExam,
    selectedFileName,
    setSelectedFileName,
    uploadFailed,
    setUploadFailed,
  } = useSourceState();
  const { generating, setGenerating, progress, setProgress } =
    useGenerationState();
  const [error, setError] = useState<string | null>(null);
  const [reviewBusy, setReviewBusy] = useState<ReviewAction | null>(null);

  const updateSetInfo = (
    key: "school" | "grade" | "subject" | "exam",
    value: string,
  ) => {
    setSetInfo((current) => {
      const next = { ...current, [key]: value };
      const title = buildProblemSetName(
        next.school,
        next.grade,
        next.subject,
        next.exam,
      );
      setData((dataCurrent) => ({
        ...dataCurrent,
        ...next,
        title,
      }));
      return next;
    });
  };

  // 검수 동작(채택·폐기·되돌리기·수정·다시 생성)은 서버가 돌려준 문항으로 화면을 바꾼다
  const reviewCurrentQuestion = async (
    action: ReviewAction,
    request: (problemId: number) => Promise<ProblemResponse>,
    fallback: string,
  ) => {
    const question = data.questions[currentQuestionIndex];
    if (!question || reviewBusy) return false;
    setReviewBusy(action);
    setError(null);
    try {
      const updated = await request(Number(question.id));
      setData((current) => ({
        ...current,
        questions: current.questions.map((item) =>
          item.id === question.id ? toProblemQuestion(updated, item.number - 1) : item,
        ),
      }));
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fallback);
      return false;
    } finally {
      setReviewBusy(null);
    }
  };
  const acceptCurrentQuestion = () =>
    reviewCurrentQuestion("accept", (id) => acceptProblem(id), "문항 채택에 실패했습니다.");
  const rejectCurrentQuestion = (reason: string) =>
    reviewCurrentQuestion("reject", (id) => rejectProblem(id, reason.trim() || undefined), "문항 폐기에 실패했습니다.");
  const resetCurrentQuestion = () =>
    reviewCurrentQuestion("reset", (id) => resetProblemReview(id), "검수 상태를 되돌리지 못했습니다.");
  const editCurrentQuestion = (fields: ReviewEdit) =>
    reviewCurrentQuestion("edit", (id) => editProblem(id, fields), "문항을 수정하지 못했습니다.");
  const regenerateCurrentQuestion = () =>
    reviewCurrentQuestion("regenerate", (id) => regenerateReviewedProblem(id), "문항 재생성에 실패했습니다.");

  const uploadSingle = async (file: File) => {
    setError(null);
    setSelectedFileName(file.name);
    setUploadFailed(false);
    setUploading(true);
    try {
      const workspaceId = await resolveWorkspaceId();
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error("PDF 파일만 업로드할 수 있습니다.");
      }
      const material = await uploadMaterialWorkflow(workspaceId, file);
      setData((current) => ({
        ...current,
        id: String(material.id),
        materialId: material.id,
        files: [
          ...current.files.filter((item) => item.id !== String(material.id)),
          {
            id: String(material.id),
            name: material.originalFilename ?? file.name,
            meta: `${material.status}${material.pageCount ? ` · ${material.pageCount}쪽` : ""}`,
          },
        ],
      }));
    } catch (cause) {
      setUploadFailed(true);
      setError(
        cause instanceof Error ? cause.message : "파일 업로드에 실패했습니다.",
      );
    } finally {
      setUploading(false);
    }
  };

  const upload = async (files: File[]) => {
    await Promise.all(files.map((file) => uploadSingle(file)));
  };

  const uploadPastExamFile = async (file: File) => {
    setError(null);
    setSelectedFileName(file.name);
    setUploadFailed(false);
    setUploading(true);
    try {
      const workspaceId = await resolveWorkspaceId();
      setPastExam(null);
      setData((current) => ({ ...current, materialId: undefined, files: [] }));
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error("기출은 PDF 파일만 업로드할 수 있습니다.");
      }
      if (file.size > 30 * 1024 * 1024) {
        throw new Error("PDF 파일은 최대 30MB까지 업로드할 수 있습니다.");
      }
      const uploaded = await uploadPastExamWorkflow(
        workspaceId,
        file,
        examYear,
        semester,
        examType,
      );
      setPastExam(uploaded);
      setData((current) => ({
        ...current,
        id: String(uploaded.id),
        files: [
          {
            id: String(uploaded.id),
            name: uploaded.originalFilename ?? file.name,
            meta: uploaded.status,
          },
        ],
      }));
    } catch (cause) {
      setUploadFailed(true);
      setError(
        cause instanceof Error ? cause.message : "기출 업로드에 실패했습니다.",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setData((current) => ({
      ...current,
      files: current.files.filter((file) => file.id !== fileId),
      ...(current.materialId !== undefined &&
      String(current.materialId) === fileId
        ? { materialId: undefined }
        : {}),
    }));
    if (pastExam && String(pastExam.id) === fileId) setPastExam(null);
    setSelectedFileName(null);
    setUploadFailed(false);
  };

  const analyzePastExamFlow = async () => {
    if (!pastExam || analyzingPastExam) return;
    setError(null);
    setAnalyzingPastExam(true);
    try {
      const started = await analyzePastExam(pastExam.id);
      setPastExam(started);
      const completed = await waitForPastExamExtractionWorkflow(
        pastExam.id,
        (status) => {
          setPastExam((current) =>
            current ? { ...current, status } : current,
          );
        },
      );
      setPastExam(completed);
      if (completed.status === "FAILED") {
        throw new Error(completed.failureReason ?? "기출 분석에 실패했습니다.");
      }
      const extraction = await getPastExamQuestions(pastExam.id);
      setData((current) => ({
        ...current,
        passage: extraction.passages[0]?.text ?? "",
        files: current.files.map((file) => ({
          ...file,
          meta: `${completed.status} · ${extraction.issueCount}개 이슈`,
        })),
      }));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "기출 분석에 실패했습니다.",
      );
    } finally {
      setAnalyzingPastExam(false);
    }
  };

  const generate = async (selection: GenerationSelection) => {
    if (generating) return;
    setError(null);
    setGenerating(true);
    setProgress(0);
    try {
      const workspaceId = await resolveWorkspaceId();
      const { passages } = selection;
      const job = await createGenerationJob(
        workspaceId,
        selection.profileId,
        passages.map((passage) => passage.id),
        selection.perPassage,
      );
      const completedJob = await waitForGenerationWorkflow(job.id, setProgress);
      if (completedJob.status === "FAILED") {
        throw new Error(
          completedJob.failureReason ?? "문제 생성에 실패했습니다.",
        );
      }
      const problems = await getGeneratedProblems(job.id);
      if (problems.length === 0) {
        throw new Error("생성된 문제가 없습니다.");
      }
      setData((current) => ({
        ...current,
        generationJobId: job.id,
        passage: passages[0]?.content ?? "",
        passages: Object.fromEntries(
          passages.map((passage) => [passage.id, { title: passage.title, content: passage.content }]),
        ),
        questions: problems.map(toProblemQuestion),
      }));
      setCurrentQuestionIndex(0);
      setStage("review");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "문제 생성에 실패했습니다.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // 자료를 고르면(PDF·텍스트·기존 자료) 이 자료로 생성한다
  const selectMaterial = (material: MaterialResponse, fallbackName: string) => {
    setError(null);
    setData((current) => ({
      ...current,
      id: String(material.id),
      materialId: material.id,
      files: [
        {
          id: String(material.id),
          name: material.title || material.originalFilename || fallbackName,
          meta: `${material.sourceType === "TEXT" ? "텍스트" : "PDF"} · 지문 ${material.passageCount ?? 0}개`,
        },
      ],
    }));
  };

  const uploadText = async (title: string, text: string) => {
    setError(null);
    setUploading(true);
    try {
      const workspaceId = await resolveWorkspaceId();
      selectMaterial(await uploadMaterialText(workspaceId, title, text), title);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "텍스트 자료를 등록하지 못했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const download = async (answer: boolean) => {
    if (data.worksheetId === undefined) return;
    try {
      const blob = await downloadProblemWorksheet(data.worksheetId, answer);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = answer ? "answer-sheet.pdf" : "worksheet.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "PDF 다운로드에 실패했습니다.",
      );
    }
  };

  // 다음 문항으로 넘어가기만 한다 (채택은 채택 버튼으로만)
  const nextQuestion = async () => {
    if (currentQuestionIndex !== data.questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }
    setError(null);
    try {
      const workspaceId = await resolveWorkspaceId();
      // 시험지에는 이번 생성 작업에서 채택한 문항만 넣는다 (워크스페이스 전체 채택 문항 아님)
      const accepted = data.questions.filter(
        (question) => question.reviewStatus === "ACCEPTED",
      );
      if (accepted.length === 0)
        throw new Error(
          "채택된 문항이 없어 시험지를 만들 수 없습니다. 시험지에 넣을 문항을 채택해 주세요.",
        );
      const worksheet = await createWorksheet(workspaceId, {
        title: data.title || "문제 세트",
        problemIds: accepted.map((question) => Number(question.id)),
        headerText: "수업용 문제지",
        showLogo: true,
      });
      await getWorksheet(worksheet.id);
      setData((current) => ({ ...current, worksheetId: worksheet.id }));
      setStage("output");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "시험지를 만들지 못했습니다.",
      );
    }
  };
  return (
    <PageContainer>
      <div className="problem-set-page">
        <Header data={data} stage={stage} />
        <Stepper stage={stage} />
        {error && <div className="privacy-note">{error}</div>}
        {stage === "source" && (
          <SourceStage
            data={data}
            uploading={uploading}
            onUpload={
              sourceMode === "past-exam"
                ? (files) => uploadPastExamFile(files[0])
                : upload
            }
            next={() => {
              if (sourceMode === "material") {
                if (!data.materialId) {
                  setError("자료를 먼저 업로드해 주세요.");
                  return;
                }
                if (!data.title) {
                  setError("학교, 학년, 과목, 시험을 모두 선택해 주세요.");
                  return;
                }
                setStage("generation");
              } else if (pastExam?.status !== "EXTRACTED") {
                setError("기출 분석이 완료되지 않았습니다.");
              } else {
                // 기출 분석이 끝나면 출제 프로필을 검토·확정하러 간다
                navigate("/profile");
              }
            }}
            sourceMode={sourceMode}
            onSourceModeChange={(mode) => {
              setSourceMode(mode);
              setError(null);
            }}
            examYear={examYear}
            semester={semester}
            examType={examType}
            onExamYearChange={setExamYear}
            onSemesterChange={setSemester}
            onExamTypeChange={setExamType}
            onAnalyzePastExam={analyzePastExamFlow}
            pastExam={pastExam}
            analyzingPastExam={analyzingPastExam}
            selectedFileName={selectedFileName}
            uploadFailed={uploadFailed}
            setInfo={setInfo}
            onSetInfoChange={updateSetInfo}
            onRemoveFile={removeFile}
            onTextSubmit={(title, text) => void uploadText(title, text)}
            onPickMaterial={(material) => selectMaterial(material, `자료 ${material.id}`)}
          />
        )}
        {stage === "generation" && (
          <GenerationStage
            data={data}
            back={() => setStage("source")}
            onGenerate={generate}
            generating={generating}
            progress={progress}
          />
        )}
        {stage === "review" && (
          <ReviewStage
            data={data}
            index={currentQuestionIndex}
            next={nextQuestion}
            busy={reviewBusy}
            onSelect={setCurrentQuestionIndex}
            onAccept={acceptCurrentQuestion}
            onReject={rejectCurrentQuestion}
            onReset={resetCurrentQuestion}
            onEdit={editCurrentQuestion}
            onRegenerate={regenerateCurrentQuestion}
          />
        )}
        {stage === "output" && (
          <OutputStage
            data={data}
            academy={academy}
            academyLoading={academyState.status === "loading"}
            worksheetId={data.worksheetId}
            onDownload={download}
            restart={() => {
              setStage("source");
              setCurrentQuestionIndex(0);
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
