import type { ProblemSetResponse } from "@/entities/problem-set/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";

export function OutputStage({
  data,
  academy,
  academyLoading,
  restart,
  worksheetId,
  onDownload,
}: {
  data: ProblemSetResponse;
  academy: { name?: string | null } | null;
  academyLoading: boolean;
  restart: () => void;
  worksheetId?: number;
  onDownload: (answer: boolean) => void;
}) {
  return (
    <>
      <div className="output-status">
        <span className="success-badge">생성 완료</span>
        <span className="neutral-badge">버전 1.0</span>
        <small>수정 사항이 새 버전으로 저장됩니다.</small>
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
              <strong>
                {academy?.name ??
                  (academyLoading ? "학원 정보 로딩 중" : "학원 정보 없음")}
              </strong>
              <small>
                {data.school} · {data.grade} · {data.area}
              </small>
            </div>

            <h2>{data.title}</h2>
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
          </div>
        </section>

        <aside className="output-aside">
          <section className="set-card pdf-card">
            <h2>PDF 출력 파일</h2>

            <div className="pdf-file">
              <Icon name="files" size={18} tone="accent" />
              <div>
                <strong>문제지</strong>
                <small>지문·문항 포함 · 정답 미포함</small>
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
                <small>정답 및 해설 포함</small>
              </div>
            </div>

            <Button
              variant="secondary"
              disabled={worksheetId === undefined}
              onClick={() => onDownload(true)}
            >
              정답·해설지 PDF 다운로드
            </Button>
          </section>
        </aside>
      </div>

      <div className="output-tip">
        <Button variant="primary" onClick={restart}>
          처음부터 다시 시작
        </Button>
      </div>
    </>
  );
}
