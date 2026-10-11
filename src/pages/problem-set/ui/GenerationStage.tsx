import type { ProblemSetResponse } from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";

export function GenerationStage({
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
          <div className="file-list">
            {data.files.map((file) => (
              <div className="set-file" key={file.id}>
                <Icon name="files" size={18} tone="accent" />
                <div>
                  <strong>{file.name}</strong>
                  <small>{file.meta}</small>
                </div>
              </div>
            ))}
          </div>
          <p className="long-passage">{data.passage}</p>
        </section>
        <div className="generation-main">
          <section className="set-card generation-settings">
            <h2>생성 조건</h2>
            <div className="condition-badges">
              <span>내용 일치 중심</span>
              <span>서술형 적용 비중 30%</span>
            </div>
            <textarea className="set-field full" />
          </section>
          <section className="set-card progress-card">
            <div className="set-card-heading">
              <h2>AI 생성 진행</h2>
              <span className={generating ? "accent-badge" : "success-badge"}>
                {generating ? "생성 중..." : "생성 완료"}
              </span>
            </div>
            <div className="progress-title">
              <b>{progress}%</b>
            </div>
            <div className="wide-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
          </section>
        </div>
      </div>
      <div className="set-actions">
        <Button variant="secondary" onClick={back}>
          자료 입력으로
        </Button>
        <Button variant="primary" onClick={onGenerate}>
          문제 생성하기
        </Button>
      </div>
    </>
  );
}
