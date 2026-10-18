import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createGenerationJob,
  getGeneratedProblems,
  analyzePastExam,
  getPastExamQuestions,
  uploadMaterialText,
} from "@/entities/problem-set/api/repository";
import type {
  MaterialResponse,
  ProblemResponse,
} from "@/entities/problem-set/api/repository";
import type {
  ProblemSetResponse,
  ProblemSetStage,
} from "@/entities/problem-set/model/types";
import { buildProblemSetName } from "@/entities/problem-set/model/types";
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
            : [data.school, data.exam].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}
export function ProblemSetPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceMode = searchParams.get("source") === "past-exam" ? "past-exam" : "material";
  function setSourceMode(mode: "material" | "past-exam") {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (mode === "past-exam") next.set("source", mode);
      else next.delete("source");
      return next;
    }, { replace: true });
  }
  const userId = getAuthSession()?.userId ?? null;
  // 학원 정보가 바뀌면(로고 등) 다시 그린다
  useAcademyState(userId);
  const academy = getStoredAcademy(userId ?? undefined);
  const [data, setData] = useState<ProblemSetResponse>(emptyProblemSet);
  const [setInfo, setSetInfo] = useState({
    school: "",
    grade: "",
    subject: "영어",
    exam: "",
  });
  const [stage, setStage] = useState<ProblemSetStage>("source");
  const { currentQuestionIndex, setCurrentQuestionIndex } = useReviewState();
  const {
    uploading,
    setUploading,
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
      const title = buildProblemSetName(next.school, next.exam);
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


  // 다음 문항으로 넘어가기만 한다 (채택은 채택 버튼으로만)
  // 마지막 문항에서는 시험지 구성으로 넘어간다 (이번 생성 작업에서 채택한 문항만)
  const nextQuestion = async () => {
    if (currentQuestionIndex !== data.questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }
    if (!data.questions.some((question) => question.reviewStatus === "ACCEPTED")) {
      setError("채택된 문항이 없어 시험지를 만들 수 없습니다. 시험지에 넣을 문항을 채택해 주세요.");
      return;
    }
    setError(null);
    setStage("output");
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
                  setError("시험(중간고사·기말고사)을 선택해 주세요.");
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
