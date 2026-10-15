import { useRef, useState } from "react";
import type { MaterialResponse, PastExamResponse } from "@/entities/problem-set/api/repository";
import type { ProblemSetResponse } from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { examTypeLabels, pastExamStatusLabels } from "@/entities/problem-set/model/labels";
import { Link } from "react-router-dom";

import { ExistingMaterials, TextMaterialForm } from "./MaterialPicker";

type SetInfo = { school: string; grade: string; subject: string; exam: string };
type Props = {
  data: ProblemSetResponse;
  next: () => void;
  onUpload: (files: File[]) => void;
  uploading: boolean;
  sourceMode: "material" | "past-exam";
  onSourceModeChange: (mode: "material" | "past-exam") => void;
  examYear: number;
  semester: number;
  examType: "MIDTERM" | "FINAL";
  onExamYearChange: (value: number) => void;
  onSemesterChange: (value: number) => void;
  onExamTypeChange: (value: "MIDTERM" | "FINAL") => void;
  onAnalyzePastExam: () => void;
  pastExam: PastExamResponse | null;
  analyzingPastExam: boolean;
  selectedFileName: string | null;
  uploadFailed: boolean;
  setInfo: SetInfo;
  onSetInfoChange: (key: keyof SetInfo, value: string) => void;
  onRemoveFile: (id: string) => void;
  onTextSubmit: (title: string, text: string) => void;
  onPickMaterial: (material: MaterialResponse) => void;
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
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">선택해 주세요</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metadata({
  info,
  onChange,
}: {
  info: SetInfo;
  onChange: (key: keyof SetInfo, value: string) => void;
}) {
  return (
    <section className="set-card info-card">
      <h2>문제 세트 정보</h2>
      <Field
        label="학교"
        value={info.school}
        options={["건대부고", "압구정고", "현대고"]}
        onChange={(value) => onChange("school", value)}
      />
      <Field
        label="학년"
        value={info.grade}
        options={["1", "2", "3", "4", "5", "6"]}
        onChange={(value) => onChange("grade", value)}
      />
      <Field
        label="과목"
        value={info.subject}
        options={["국어", "영어", "사회", "과학", "수학"]}
        onChange={(value) => onChange("subject", value)}
      />
      <Field
        label="시험"
        value={info.exam}
        options={["중간고사", "기말고사"]}
        onChange={(value) => onChange("exam", value)}
      />
      <small className="field-help">
        선택이 완료되면 문제 세트 이름이 자동으로 생성됩니다.
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
  selectedFileName,
  uploadFailed,
  setInfo,
  onSetInfoChange,
  onRemoveFile,
  onTextSubmit,
  onPickMaterial,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [materialInput, setMaterialInput] = useState<"pdf" | "text" | "existing">("pdf");

  return (
    <>
      <div className="stage-grid source-grid">
        <section className="set-card source-main">
          <div className="set-card-heading">
            <h2>자료 입력</h2>
            <span className="accent-badge">
              {data.files.length}개 자료 선택
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
            <ExistingMaterials onPick={onPickMaterial} selectedId={data.materialId} />
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

          {data.files.length ? (
            <Files files={data.files} onRemove={onRemoveFile} />
          ) : selectedFileName ? (
            <div className="file-list">
              <div className="set-file">
                <Icon name="files" size={18} tone="accent" />
                <strong>{selectedFileName}</strong>
                <small>{uploadFailed ? "업로드 실패" : "업로드 중..."}</small>
              </div>
            </div>
          ) : null}

          <div className="privacy-note">
            업로드 권한이 있는 자료만 업로드해 주세요.
          </div>
        </section>

        <Metadata info={setInfo} onChange={onSetInfoChange} />
      </div>

      <div className="set-actions">
        <Button variant="primary" onClick={next}>
          문제 생성 설정으로 이동
        </Button>
      </div>
    </>
  );
}
