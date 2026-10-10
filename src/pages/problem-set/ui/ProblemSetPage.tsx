import { useRef, useState } from "react";
import {
  createGenerationJob,
  downloadWorksheetPdf,
  getConfirmedProfile,
  getGeneratedProblems,
  getGenerationJob,
  getMaterial,
  getMaterialPassages,
  uploadMaterialPdf,
} from "@/entities/problem-set/api/repository";
import type { ProblemResponse } from "@/entities/problem-set/api/repository";
import type {
  ProblemQuestion,
  ProblemSetResponse,
  ProblemSetStage,
} from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import { requireWorkspaceId } from "@/shared/auth/workspace";
import "./ProblemSetPage.css";

const stages: Array<{ id: ProblemSetStage; label: string }> = [
  { id: "source", label: "자료 입력" },
  { id: "generation", label: "AI 생성" },
  { id: "review", label: "공동 검토" },
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
  scope: "",
  passage: "",
  prompt: "",
};

function problemResponseToQuestion(problem: ProblemResponse, index: number): ProblemQuestion {
  return {
    id: String(problem.id),
    number: index + 1,
    stage: "review",
    stageLabel: problem.typeLabel ?? problem.type ?? "",
    title: problem.stem ?? problem.body ?? "",
    prompt: problem.stem ?? problem.body ?? "",
    answerText: problem.answerText,
    explanation: problem.explanation,
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

async function waitForMaterialSplit(materialId: number) {
  for (;;) {
    const material = await getMaterial(materialId);
    if (material.status === "SPLIT" || material.status === "FAILED") {
      return material;
    }
    await wait(2000);
  }
}

async function waitForGeneration(jobId: number, onProgress: (progress: number) => void) {
  for (;;) {
    const job = await getGenerationJob(jobId);
    onProgress(job.progress ?? 0);
    if (job.status === "COMPLETED" || job.status === "FAILED") {
      return job;
    }
    await wait(2000);
  }
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
function Files({
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
function InfoCard({ data }: { data: ProblemSetResponse }) {
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
function Actions({
  back,
  primary,
  onBack,
  onPrimary,
}: {
  back?: string;
  primary: string;
  onBack?: () => void;
  onPrimary: () => void;
}) {
  return (
    <div className="set-actions">
      {back && (
        <Button variant="secondary" onClick={onBack}>
          {back}
        </Button>
      )}
      <Button variant="primary" onClick={onPrimary}>
        → {primary}
      </Button>
    </div>
  );
}
function Source({
  data,
  next,
  onUpload,
  uploading,
}: {
  data: ProblemSetResponse;
  next: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="stage-grid source-grid">
        <section className="set-card source-main">
          <div className="set-card-heading">
            <h2>자료 입력</h2>
            <span className="accent-badge">2개 자료 선택됨</span>
          </div>
          <div className="source-tabs">
            <strong>파일 업로드</strong>
            <span>지문·문항 붙여넣기</span>
            <span>보관함에서 선택</span>
          </div>
          <div className="upload-box">
            <Icon name="files" size={22} tone="accent" />
            <strong>시험지 또는 보유 자료를 여기에 놓아주세요</strong>
            <small>PDF, HWP, DOCX, JPG, PNG · 파일당 최대 30MB</small>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
                event.target.value = "";
              }}
            />
            <Button
              variant="secondary"
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="plus" size={14} />
              {uploading ? "업로드 중..." : "파일 선택"}
            </Button>
          </div>
          <Files files={data.files} />
          <div className="passage-block">
            <strong>직접 입력한 지문 · 선택</strong>
            <p>{data.prompt}</p>
            <small>
              파일과 직접 입력한 내용을 함께 생성 자료로 사용할 수 있어요.
            </small>
          </div>
          <div className="privacy-note">
            ⓘ 이용 권한이 있는 자료만 업로드해 주세요. 학생 이름·연락처 등
            개인정보는 업로드 전에 삭제해 주세요.
          </div>
        </section>
        <InfoCard data={data} />
      </div>
      <Actions primary="생성 설정으로 이동" onPrimary={next} />
    </>
  );
}
function Generation({
  data,
  back,
  onGenerate,
  generating,
  progress,
}: {
  data: ProblemSetResponse;
  back: () => void;
  onGenerate: () => void;
  generating: boolean;
  progress: number;
}) {
  return (
    <>
      <div className="stage-grid generation-grid">
        <section className="set-card selected-material">
          <div className="set-card-heading">
            <h2>선택한 생성 자료</h2>
            <a href="#source">변경</a>
          </div>
          <Files files={data.files} selected />
          <div className="preview-heading">
            <strong>지문 미리보기</strong>
            <span className="neutral-badge">공공재</span>
          </div>
          <p className="long-passage">{data.passage}</p>
        </section>
        <div className="generation-main">
          <section className="set-card generation-settings">
            <h2>생성 조건</h2>
            <SelectField
              label="학교·시험 경향 적용"
              value="한빛고 · 국어 · 1학기 중간고사"
            />
            <small>데모 자료 3건 / 60문항 분석 · 2026.10.05 갱신</small>
            <div className="condition-badges">
              <span>내용 일치 중심</span>
              <span>사례 적용 비중 30%</span>
              <span>사용자 업로드 기반</span>
            </div>
            <hr />
            <label className="set-field full">
              <strong>선생님의 요청 · 사용자 프롬프트</strong>
              <textarea defaultValue="공공재의 비경합성과 비배제성을 구분할 수 있도록 5지선다형 2문항을 만들어 주세요. 내용 일치 1문항과 새로운 가로등 사례를 적용하는 1문항으로 구성하고, 오답은 본문 근거와 해설을 포함해 주세요." />
            </label>
            <div className="field-grid three">
              <SelectField label="문항 유형" value="5지선다형" />
              <SelectField label="난이도" value="중 1 · 상 1" />
              <SelectField label="생성 문항 수" value="2문항" />
            </div>
            <div className="setting-foot">
              <small>포함 항목: 변형 지문 · 문항 · 정답 · 해설</small>
              <span className="accent-badge">정답 검증 포함</span>
            </div>
          </section>
          <section className="set-card progress-card">
            <div className="set-card-heading">
              <h2>AI 생성 진행</h2>
              <span className={generating ? "accent-badge" : "success-badge"}>
                {generating ? "생성 중..." : "생성 완료"}
              </span>
            </div>
            <div className="progress-title">
              <strong>2문항과 정답·해설 초안이 준비됐어요</strong>
              <b>{progress}%</b>
            </div>
            <div className="wide-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="check-grid">
              {[
                "자료 구조 확인",
                "경향·요청 적용",
                "문항·해설 생성",
                "정답 교차 점검",
              ].map((label) => (
                <span key={label}>
                  ✓ {label}
                  <small>처리 완료 · 데모</small>
                </span>
              ))}
            </div>
            <div className="success-note">
              ⓘ 자동 점검에서 정답 중복이 발견되지 않았습니다. 문항의 적절성과
              해설은 공동 검토에서 최종 확인해 주세요.
            </div>
          </section>
        </div>
      </div>
      <Actions
        back="자료 입력으로"
        primary="생성 문항 검토하기"
        onBack={back}
        onPrimary={onGenerate}
      />
    </>
  );
}
function Question({
  question,
  index,
}: {
  question: ProblemQuestion;
  index: number;
}) {
  return (
    <article className="question-card">
      <div className="question-meta">
        <span>{question.stageLabel}</span>
        <span>난이도 {index === 0 ? "중" : "상"}</span>
        <span className="success-badge">검토 완료</span>
        <Button variant="secondary">✎ 문항 편집</Button>
      </div>
      <h3>
        <b>{String(question.number).padStart(2, "0")}</b>
        {question.title}
      </h3>
      {index === 1 && (
        <div className="example-box">
          &lt;보기&gt;
          <br />한 마을은 누구나 이용할 수 있는 가로등 설치를 추진했다. 주민들은
          설치 후 모두가 빛을 누릴 수 있음을 알면서도 다른 주민이 비용을 내기를
          기다렸다.
        </div>
      )}
      <div className="choices">
        {question.choices.map((choice) => (
          <p key={choice.id}>
            {choice.label} {choice.text}
          </p>
        ))}
      </div>
      <small className="question-review">
        검토: 김서현 · 정답 및 발문 확인 완료
      </small>
      <button className="regenerate" type="button">
        이 문항만 재생성 ↻
      </button>
    </article>
  );
}
function ReviewAside({ data }: { data: ProblemSetResponse }) {
  const sourceFile = data.files[0];
  const referenceFile = data.files[1] ?? sourceFile;

  return (
    <aside className="review-aside">
      <section className="set-card answer-card">
        <div className="set-card-heading">
          <h2>정답과 해설</h2>
          <span className="success-badge">확인 완료</span>
        </div>
        {data.questions.map((question, index) => (
          <div className="answer-summary" key={question.id}>
            <strong>
              {String(question.number).padStart(2, "0")}번 ·{" "}
              {question.stageLabel}
            </strong>
            <span>정답 {index === 0 ? "②" : "④"}</span>
            <p>
              {index === 0
                ? "둘째 문단에서 무임승차로 인해 지불 의사가 낮게 드러난다고 설명한다."
                : "비용을 내지 않아도 빛을 누릴 수 있어 주민들은 부담하기를 기다린다."}
            </p>
            <small>오답 점검: 본문 근거와 선택지의 관계를 확인했습니다.</small>
          </div>
        ))}
        <Button variant="secondary">해설 편집</Button>
      </section>
      <section className="set-card evidence-side">
        <h2>원본과 생성 근거</h2>
        <span className="neutral-badge">사용자 제공 자료</span>
        <strong>{sourceFile?.name ?? ""}</strong>
        <small>2쪽 · 공공재 개념 설명 / 직접 입력 지문</small>
        <hr />
        <span className="accent-badge">유형 참고</span>
        <strong>{referenceFile?.name ?? ""}</strong>
        <small>3쪽 · 12~13번 / 내용 일치 · 사례 적용</small>
        <a href="#source">원본과 나란히 보기 →</a>
      </section>
    </aside>
  );
}
function Review({
  data,
  index,
  next,
}: {
  data: ProblemSetResponse;
  index: number;
  next: () => void;
}) {
  const question = data.questions[index];
  return (
    <>
      <div className="review-status">
        <span>
          문항 검토 완료 {index + 1} / {data.questions.length}
        </span>
        <span>해결된 의견 1개 검토자 김서현 · 이미지</span>
        <small>마지막 저장 10:42</small>
      </div>
      <div className="stage-grid review-grid">
        <section className="set-card questions-panel">
          <div className="set-card-heading">
            <h2>지문과 문항</h2>
            <Button variant="secondary">✎ 지문 편집</Button>
          </div>
          <div className="content-tags">
            <span>사회·경제</span>
            <span>비문학 독서</span>
            <small>지문 1개 · 5지선다</small>
          </div>
          <h3 className="passage-title">
            [1~2] 다음 글을 읽고 물음에 답하세요.
          </h3>
          <p className="review-passage">{data.passage}</p>
          <div className="question-divider" />
          <Question question={question} index={index} />
        </section>
        <ReviewAside data={data} />
      </div>
      <div className="review-tip">
        ⓘ AI 생성 문항은 교사의 확인을 거친 뒤 사용하세요. 확정하면 현재 버전이
        보관되며, 이후 수정은 새 버전으로 저장됩니다.
      </div>
      <Actions
        primary={
          index === data.questions.length - 1
            ? "검토 완료 · 세트 확정"
            : "다음 문항 검토"
        }
        onPrimary={next}
      />
    </>
  );
}
function Output({
  data,
  restart,
  worksheetId,
  onDownload,
}: {
  data: ProblemSetResponse;
  restart: () => void;
  worksheetId?: number;
  onDownload: (answer: boolean) => void;
}) {
  return (
    <>
      <div className="output-status">
        <span className="success-badge">확정 완료</span>
        <span className="neutral-badge">버전 1.0</span>
        <small>수정 시 새 버전으로 저장됩니다.</small>
        <Button variant="secondary">복제하여 수정</Button>
      </div>
      <div className="stage-grid output-grid">
        <section className="preview-wrap">
          <div className="preview-tabs">
            <strong>문제지 미리보기</strong>
            <span>정답·해설지</span>
            <small>A4 · 100% · 1쪽</small>
          </div>
          <div className="paper">
            <div className="paper-top">
              <strong>솔샘학원</strong>
              <small>
                {data.school} · {data.grade} · {data.area}
              </small>
            </div>
            <h2>{data.title}</h2>
            <small>2026년 1학기 중간고사 대비 · 변형 문제</small>
            <p className="paper-name">이름: ____________</p>
            <h4>[1~2] 다음 글을 읽고 물음에 답하세요.</h4>
            <p>{data.passage}</p>
            {data.questions.map((question) => (
              <div className="paper-question" key={question.id}>
                <strong>
                  {String(question.number).padStart(2, "0")} {question.title}
                </strong>
                {question.choices.map((choice) => (
                  <span key={choice.id}>
                    {choice.label} {choice.text}
                  </span>
                ))}
              </div>
            ))}
            <footer>
              솔샘학원 · 수업용 데모 자료 / 무단 배포 금지 <b>1</b>
            </footer>
          </div>
        </section>
        <aside className="output-aside">
          <section className="set-card pdf-card">
            <h2>PDF 출력 파일</h2>
            <div className="pdf-file">
              <Icon name="files" size={18} tone="accent" />
              <div>
                <strong>문제지</strong>
                <small>지문·문항 · 정답 미포함 · 1쪽</small>
              </div>
            </div>
            <Button
              variant="primary"
              disabled={worksheetId === undefined}
              onClick={() => onDownload(false)}
            >
              문제지 PDF 다운로드
            </Button>
            <hr />
            <div className="pdf-file">
              <Icon name="files" size={18} tone="accent" />
              <div>
                <strong>정답·해설지</strong>
                <small>정답표 · 근거 · 오답 해설 · 1쪽</small>
              </div>
            </div>
            <div className="answer-table">
              공공재와 시장 실패 · 정답표
              <hr />
              01번 ② 02번 ④
            </div>
            <Button
              variant="secondary"
              disabled={worksheetId === undefined}
              onClick={() => onDownload(true)}
            >
              정답·해설지 PDF 다운로드
            </Button>
          </section>
          <section className="set-card branding-card">
            <h2>학원 브랜딩·편집 설정</h2>
            <label className="set-field full">
              <strong>학원 표시명</strong>
              <input value="솔샘학원" readOnly />
            </label>
            <div className="field-grid">
              <SelectField label="용지" value="A4 · 세로" />
              <SelectField label="단 구성" value="1단" />
              <SelectField label="글자 크기" value="10pt" />
              <SelectField label="여백" value="기본 15mm" />
            </div>
            <label className="check-label">
              <input type="checkbox" defaultChecked /> 이름 입력란 표시
            </label>
            <label className="check-label">
              <input type="checkbox" defaultChecked /> 쪽 번호 · 학원명 표시
            </label>
            <label className="check-label">
              <input type="checkbox" /> 문항별 배점 표시
            </label>
            <Button variant="secondary">미리보기 적용</Button>
          </section>
        </aside>
      </div>
      <div className="output-tip">
        ✓ 지문·문항·정답·해설을 확인했습니다.
        <small>
          최종 확인자: 김서현 · 확정 후 문제지와 정답지를 출력할 수 있습니다.
        </small>
        <Button variant="primary" onClick={restart}>
          처음부터 다시 보기
        </Button>
      </div>
    </>
  );
}
export function ProblemSetPage() {
  const [data, setData] = useState<ProblemSetResponse>(emptyProblemSet);
  const [stage, setStage] = useState<ProblemSetStage>("source");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const workspaceId = requireWorkspaceId();
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("PDF 파일만 업로드할 수 있습니다.");
      }
      const material = await uploadMaterialPdf(workspaceId, file);
      setData((current) => ({
        ...current,
        id: String(material.id),
        materialId: material.id,
        files: [{
          id: String(material.id),
          name: material.originalFilename ?? file.name,
          meta: `${material.status}${material.pageCount ? ` · ${material.pageCount}쪽` : ""}`,
        }],
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const generate = async () => {
    if (generating) return;
    setError(null);
    setGenerating(true);
    setProgress(0);
    try {
      const workspaceId = requireWorkspaceId();
      if (data.materialId === undefined) {
        throw new Error("먼저 PDF 파일을 업로드해 주세요.");
      }

      const material = await waitForMaterialSplit(data.materialId);
      if (material.status === "FAILED") {
        throw new Error(material.failureReason ?? "자료에서 지문을 분리하지 못했습니다.");
      }
      const passages = await getMaterialPassages(data.materialId);
      if (passages.length === 0) {
        throw new Error("생성에 사용할 지문이 없습니다.");
      }
      const profile = await getConfirmedProfile(workspaceId);
      const job = await createGenerationJob(
        workspaceId,
        profile.id,
        passages.map((passage) => passage.id),
      );
      const completedJob = await waitForGeneration(job.id, setProgress);
      if (completedJob.status === "FAILED") {
        throw new Error(completedJob.failureReason ?? "문제 생성에 실패했습니다.");
      }
      const problems = await getGeneratedProblems(job.id);
      if (problems.length === 0) {
        throw new Error("생성된 문제가 없습니다.");
      }
      setData((current) => ({
        ...current,
        generationJobId: job.id,
        passage: passages[0]?.content ?? "",
        questions: problems.map(problemResponseToQuestion),
      }));
      setCurrentQuestionIndex(0);
      setStage("review");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "문제 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  const download = async (answer: boolean) => {
    if (data.worksheetId === undefined) return;
    try {
      const blob = await downloadWorksheetPdf(data.worksheetId, answer);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = answer ? "answer-sheet.pdf" : "worksheet.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PDF 다운로드에 실패했습니다.");
    }
  };

  const nextQuestion = () =>
    currentQuestionIndex === data.questions.length - 1
      ? setStage("output")
      : setCurrentQuestionIndex((index) => index + 1);
  return (
    <PageContainer>
      <div className="problem-set-page">
        <Header data={data} stage={stage} />
        <Stepper stage={stage} />
        {error && <div className="privacy-note">{error}</div>}
        {stage === "source" && (
          <Source
            data={data}
            uploading={uploading}
            onUpload={upload}
            next={() => setStage("generation")}
          />
        )}
        {stage === "generation" && (
          <Generation
            data={data}
            back={() => setStage("source")}
            onGenerate={generate}
            generating={generating}
            progress={progress}
          />
        )}
        {stage === "review" && (
          <Review
            data={data}
            index={currentQuestionIndex}
            next={nextQuestion}
          />
        )}
        {stage === "output" && (
          <Output
            data={data}
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
