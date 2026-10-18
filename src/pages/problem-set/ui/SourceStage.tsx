import { useEffect, useRef, useState } from "react";
import type { MaterialResponse, PastExamResponse } from "@/entities/problem-set/api/repository";
import type { ProblemSetResponse } from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Select } from "@/shared/ui/Select/Select";
import { Icon } from "@/shared/ui/Icon/Icon";
import { examTypeLabels, pastExamStatusLabels } from "@/entities/problem-set/model/labels";
import { Link } from "react-router-dom";
import { workspaceRepository } from "@/entities/workspace/api/repository";

import type { PendingUpload, SourceFile, SourceMode } from "@/pages/problem-set/model/useSourceState";

import { ExistingMaterials, TextMaterialForm } from "./MaterialPicker";

type SetInfo = { school: string; grade: string; subject: string; exam: string };
type Props = {
  data: ProblemSetResponse;
  next: () => void;
  onUpload: (files: File[]) => void;
  uploading: boolean;
  sourceMode: SourceMode;
  onSourceModeChange: (mode: SourceMode) => void;
  examYear: number;
  semester: number;
  examType: "MIDTERM" | "FINAL";
  onExamYearChange: (value: number) => void;
  onSemesterChange: (value: number) => void;
  onExamTypeChange: (value: "MIDTERM" | "FINAL") => void;
  onAnalyzePastExam: () => void;
  pastExam: PastExamResponse | null;
  analyzingPastExam: boolean;
  pastExamFile: SourceFile | null;
  pendingUpload: PendingUpload | null;
  setInfo: SetInfo;
  onSetInfoChange: (key: keyof SetInfo, value: string) => void;
  onRemoveFile: (mode: SourceMode, id: string) => void;
  onTextSubmit: (title: string, text: string) => void;
  onToggleMaterial: (material: MaterialResponse) => void;
};

function Field({
  label,
  value,
  options,
  onChange,
  labels,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <label className="set-field">
      <strong>{label}</strong>
      <Select
        aria-label={label}
        fullWidth
        value={value}
        onValueChange={onChange}
        options={[{ value: "", label: "선택해 주세요" }, ...options.map((option) => ({ value: option, label: labels?.[option] ?? option }))]}
      />
    </label>
  );
}

/** 문제 세트 정보: 워크스페이스(학교·학년)는 고른 것을 쓰고, 시험만 고른다 (영어 전용) */
function Metadata({
  info,
  onChange,
  sourceMode,
}: {
  info: SetInfo;
  onChange: (key: keyof SetInfo, value: string) => void;
  sourceMode: SourceMode;
}) {
  const [workspaceTitle, setWorkspaceTitle] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    workspaceRepository
      .execute()
      .then((workspace) => {
        if (!active) return;
        setWorkspaceTitle(workspace.title);
        onChange("school", workspace.title);
      })
      .catch(() => active && setWorkspaceTitle(""));
    return () => {
      active = false;
    };
    // 화면에 들어올 때 한 번만 워크스페이스 이름을 채운다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="set-card info-card">
      <h2>{sourceMode === "past-exam" ? "기출 정보" : "문제 세트 정보"}</h2>
      <div className="set-field">
        <strong>워크스페이스</strong>
        <p className="info-card__value">
          {workspaceTitle === null ? "불러오는 중..." : workspaceTitle || "워크스페이스 없음"}{" "}
          <Link to="/workspace">바꾸기</Link>
        </p>
      </div>
      {sourceMode === "material" && <Field
        label="시험"
        value={info.exam}
        options={["중간고사", "기말고사"]}
        onChange={(value) => onChange("exam", value)}
      />}
      <small className="field-help">
        {sourceMode === "past-exam" ? "연도·학기·시험 유형을 확인한 뒤 기출을 올려 주세요." : info.school && info.exam ? `문제 세트 이름: ${info.school} ${info.exam} 대비` : "시험을 고르면 문제 세트 이름이 만들어집니다."}
      </small>
    </section>
  );
}

function Files({
  files,
  onRemove,
}: {
  files: ProblemSetResponse["files"];
  onRemove: (id: string) => void;
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
          <Button
            variant="secondary"
            type="button"
            onClick={() => onRemove(file.id)}
          >
            <Icon name="files" size={14} />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function SourceStage({
  data,
  next,
  onUpload,
  uploading,
  sourceMode,
  onSourceModeChange,
  examYear,
  semester,
  examType,
  onExamYearChange,
  onSemesterChange,
  onExamTypeChange,
  onAnalyzePastExam,
  pastExam,
  analyzingPastExam,
  pastExamFile,
  pendingUpload,
  setInfo,
  onSetInfoChange,
  onRemoveFile,
  onTextSubmit,
  onToggleMaterial,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [materialInput, setMaterialInput] = useState<"pdf" | "text" | "existing">("pdf");
  // 자료 탭은 고른 시험범위 자료, 기출 탭은 올린 기출만 보여준다
  const files = sourceMode === "past-exam" ? (pastExamFile ? [pastExamFile] : []) : data.files;

  return (
    <>
      <div className="stage-grid source-grid">
        <section className="set-card source-main">
          <div className="set-card-heading">
            <h2>자료 입력</h2>
            <span className="accent-badge">
              {files.length}개 자료 선택
            </span>
          </div>

          <div className="source-tabs">
            <button
              className={sourceMode === "material" ? "is-active" : ""}
              type="button"
              onClick={() => onSourceModeChange("material")}
            >
              자료 업로드
            </button>
            <button
              className={sourceMode === "past-exam" ? "is-active" : ""}
              type="button"
              onClick={() => onSourceModeChange("past-exam")}
            >
              기출 업로드 / 분석
            </button>
          </div>

          {sourceMode === "past-exam" && (
            <div className="field-grid three">
              <Field
                label="시험 연도"
                value={String(examYear)}
                options={Array.from({ length: 101 }, (_, index) =>
                  String(2100 - index),
                )}
                onChange={(value) => onExamYearChange(Number(value))}
              />
              <Field
                label="학기"
                value={String(semester)}
                options={["1", "2"]}
                onChange={(value) => onSemesterChange(Number(value))}
              />
              <Field
                label="시험 유형"
                value={examType}
                options={["MIDTERM", "FINAL"]}
                labels={examTypeLabels}
                onChange={(value) =>
                  onExamTypeChange(value as "MIDTERM" | "FINAL")
                }
              />
            </div>
          )}

          {sourceMode === "material" && (
            <div className="material-input-tabs" role="tablist" aria-label="자료 입력 방법">
              {(
                [
                  ["pdf", "PDF 올리기"],
                  ["text", "텍스트 붙여넣기"],
                  ["existing", "올린 자료에서 고르기"],
                ] as const
              ).map(([value, label]) => (
                <button
                  aria-selected={materialInput === value}
                  className={materialInput === value ? "is-active" : undefined}
                  key={value}
                  onClick={() => setMaterialInput(value)}
                  role="tab"
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {sourceMode === "material" && materialInput === "text" && (
            <TextMaterialForm busy={uploading} onSubmit={onTextSubmit} />
          )}
          {sourceMode === "material" && materialInput === "existing" && (
            <ExistingMaterials onToggle={onToggleMaterial} selectedIds={data.materialIds} />
          )}

          <div className={`upload-box ${sourceMode}`} hidden={sourceMode === "material" && materialInput !== "pdf"}>
            <Icon name="files" size={22} tone="accent" />
            <strong>
              {sourceMode === "past-exam"
                ? "기출 PDF를 선택해 주세요"
                : "시험지 또는 보유 자료를 여기에 끌어 놓으세요"}
            </strong>
            <small>PDF 파일만 업로드할 수 있습니다 · 최대 30MB</small>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple={sourceMode === "material"}
              hidden
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length) onUpload(files);
                event.target.value = "";
              }}
            />
            <Button
              variant="secondary"
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="plus" size={14} />
              {uploading ? "업로드 중..." : "파일 선택"}
            </Button>
          </div>

          {sourceMode === "past-exam" && pastExam && (
            <div className="privacy-note source-analysis-status">
              <span>{pastExamStatusLabels[pastExam.status] ?? pastExam.status}</span>
              {pastExam.status === "EXTRACTED" && <Link to="/past-exams">추출 결과 확인·수정</Link>}
              {(pastExam.status === "UPLOADED" ||
                pastExam.status === "FAILED") && (
                <Button
                  variant="secondary"
                  type="button"
                  disabled={analyzingPastExam}
                  onClick={onAnalyzePastExam}
                >
                  {analyzingPastExam ? "분석 중..." : "분석 시작"}
                </Button>
              )}
            </div>
          )}

          {files.length > 0 && (
            <Files files={files} onRemove={(id) => onRemoveFile(sourceMode, id)} />
          )}
          {pendingUpload && (
            <div className="file-list">
              <div className="set-file">
                <Icon name="files" size={18} tone="accent" />
                <strong>{pendingUpload.name}</strong>
                <small>{pendingUpload.failed ? "업로드 실패" : "업로드 중..."}</small>
              </div>
            </div>
          )}

          <div className="privacy-note">
            업로드 권한이 있는 자료만 업로드해 주세요.
          </div>
        </section>

        <Metadata info={setInfo} onChange={onSetInfoChange} sourceMode={sourceMode} />
      </div>

      <div className="set-actions">
        <Button
          variant="primary"
          onClick={next}
          disabled={sourceMode === "past-exam" && (pastExam?.status !== "EXTRACTED" || uploading || analyzingPastExam)}
        >
          {sourceMode === "past-exam" ? "출제 프로필로 이동" : "문제 생성 설정으로 이동"}
        </Button>
      </div>
    </>
  );
}
