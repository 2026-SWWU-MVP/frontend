import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getSchoolExams,
  getSchoolTrendSummary,
  getSchoolTrends,
} from "@/entities/school-trends/api/repository";
import type {
  SchoolExamResponse,
  SchoolTrendResponse,
  SchoolTrendSummaryResponse,
} from "@/entities/school-trends/model/types";
import { questionTypeLabel } from "@/entities/problem-set/model/labels";
import { NoWorkspaceError, workspaceRepository } from "@/entities/workspace/api/repository";
import type { WorkspaceOption } from "@/entities/workspace/model/types";
import { setWorkspaceId } from "@/shared/auth/workspace";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import "./SchoolTrendsPage.css";

const confidenceLabels: Record<SchoolTrendResponse["confidence"], string> = {
  NONE: "기출 없음",
  LOW: "신뢰도 낮음 (1회분)",
  MEDIUM: "신뢰도 보통 (2~3회분)",
  HIGH: "신뢰도 높음 (4회분 이상)",
};

function percent(ratio: number | null | undefined) {
  return ratio === null || ratio === undefined ? "-" : `${Math.round(ratio * 100)}%`;
}

function examTitle(exam: SchoolExamResponse) {
  return `${exam.examYear}년 ${exam.semester}학기 ${exam.examType === "MIDTERM" ? "중간" : "기말"}`;
}

interface PageData {
  workspaceId: number;
  options: WorkspaceOption[];
  trends: SchoolTrendResponse;
  exams: SchoolExamResponse[];
}

export function SchoolTrendsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [summary, setSummary] = useState<SchoolTrendSummaryResponse | null>(null);
  const [summaryFailed, setSummaryFailed] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const workspace = await workspaceRepository.execute();
      const trends = await getSchoolTrends(workspace.id);
      const exams = trends.examCount > 0 ? await getSchoolExams(trends.schoolId, trends.grade) : [];
      if (!active) return;
      setData({ workspaceId: workspace.id, options: workspace.options, trends, exams });
      if (trends.examCount === 0) return;
      // 요약은 LLM이라 처음엔 수 초 걸린다. 통계를 먼저 보여주고 따로 불러온다
      getSchoolTrendSummary(workspace.id)
        .then((result) => active && setSummary(result))
        .catch(() => active && setSummaryFailed(true));
    })().catch((cause: unknown) => {
      if (!active) return;
      if (cause instanceof NoWorkspaceError) setEmpty(true);
      else setError(cause instanceof Error && cause.message ? cause.message : "학교 경향을 불러오지 못했습니다.");
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function selectWorkspace(workspaceId: number) {
    setWorkspaceId(workspaceId);
    setData(null);
    setSummary(null);
    setSummaryFailed(false);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  const trends = data?.trends;
  const maxTypeRatio = Math.max(...(trends?.types.map((item) => item.ratio) ?? [0]), 0.01);
  const mixEntries = Object.entries(trends?.typeMixPerPassage ?? {}).filter(([, count]) => count > 0);

  return (
    <PageContainer>
      <div className="school-trends-page">
        <div className="school-trends-heading">
          <div>
            <h1>학교·시험 경향</h1>
            <p>모든 학원이 올린 기출에서 뽑은 통계입니다. 다른 학원 기출의 원문은 보이지 않습니다.</p>
          </div>
          {data && data.options.length > 1 && (
            <label className="trend-workspace">
              <span>워크스페이스</span>
              <select
                className="trend-select"
                id="trend-workspace"
                onChange={(event) => selectWorkspace(Number(event.target.value))}
                value={data.workspaceId}
              >
                {data.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}
        {empty && (
          <div className="notice">
            <Icon name="database" size={16} tone="accent" />
            <span>
              워크스페이스가 없습니다. <Link to="/workspace">워크스페이스</Link>에서 학교를 추가해 주세요.
            </span>
          </div>
        )}
        {!data && !error && !empty && <p className="trend-muted">학교 경향을 불러오는 중입니다.</p>}

        {trends && (
          <>
            <section className="trend-card trend-hero">
              <div className="trend-hero__title">
                <h2>
                  {trends.schoolName} {trends.grade}학년
                </h2>
                <span className={`trend-confidence trend-confidence--${trends.confidence}`}>
                  {confidenceLabels[trends.confidence]}
                </span>
              </div>
              <p className="trend-muted">
                {trends.basis}
                {trends.latestExam && ` · 가장 최근 ${trends.latestExam}`}
              </p>

              {trends.examCount === 0 ? (
                <p className="trend-empty">
                  아직 이 학교·학년의 기출이 없습니다. <Link to="/problem-sets">기출을 올리면</Link> 경향이 쌓이고, 다른 학원도
                  통계를 함께 볼 수 있습니다.
                </p>
              ) : summary?.headline ? (
                <div className="trend-summary">
                  <strong>{summary.headline}</strong>
                  <ul>
                    {summary.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  {summary.prepTips.length > 0 && (
                    <div className="trend-tips">
                      <span>대비 팁</span>
                      <ul>
                        {summary.prepTips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="trend-muted">
                  {summaryFailed ? "요약을 만들지 못했습니다. 아래 통계를 참고해 주세요." : "AI가 경향을 요약하고 있습니다. 처음에는 수 초 걸립니다."}
                </p>
              )}
            </section>

            {trends.examCount > 0 && (
              <>
                <section aria-label="경향 요약 수치" className="trend-metrics">
                  <div className="trend-card trend-metric">
                    <span>서술형 문항 비중</span>
                    <strong>{percent(trends.subjectiveRatio)}</strong>
                    <small>최근 회차에 가중치</small>
                  </div>
                  <div className="trend-card trend-metric">
                    <span>서술형 배점 비중</span>
                    <strong>{percent(trends.subjectivePointsRatio)}</strong>
                    <small>배점이 있는 회차 기준</small>
                  </div>
                  <div className="trend-card trend-metric">
                    <span>회차당 평균 문항</span>
                    <strong>{trends.averageQuestions.toFixed(1)}</strong>
                    <small>기출 {trends.examCount}회분</small>
                  </div>
                  <div className="trend-card trend-metric">
                    <span>올린 학원</span>
                    <strong>{trends.contributorCount}곳</strong>
                    <small>원문은 공유되지 않음</small>
                  </div>
                </section>

                <div className="trend-grid">
                  <section className="trend-card trend-section">
                    <h3>유형별 비중</h3>
                    <ul className="trend-bars">
                      {trends.types.map((item) => (
                        <li key={item.type}>
                          <span className="trend-bars__label">{item.label}</span>
                          <span className="trend-bars__track">
                            <span style={{ width: `${(item.ratio / maxTypeRatio) * 100}%` }} />
                          </span>
                          <span className="trend-bars__value">{percent(item.ratio)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="trend-column">
                    <section className="trend-card trend-section">
                      <h3>변화</h3>
                      {trends.highlights.length > 0 ? (
                        <ul className="trend-list">
                          {trends.highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="trend-muted">눈에 띄는 변화가 없습니다.</p>
                      )}
                    </section>

                    <section className="trend-card trend-section">
                      <h3>지문당 서술형 구성</h3>
                      <p className="trend-muted">문제 생성 기본값의 참고가 됩니다.</p>
                      <div className="trend-chips">
                        {mixEntries.map(([type, count]) => (
                          <span key={type}>
                            {questionTypeLabel(type)} {count}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                <section className="trend-card trend-section">
                  <h3>연도별 서술형 비중</h3>
                  <ul className="trend-years">
                    {trends.byYear.map((year) => (
                      <li key={year.year}>
                        <span className="trend-years__value">{percent(year.subjectiveRatio)}</span>
                        <span className="trend-years__bar">
                          <span style={{ height: `${Math.max(year.subjectiveRatio * 100, 2)}%` }} />
                        </span>
                        <strong>{year.year}</strong>
                        <small>{year.examCount}회분</small>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="trend-card trend-section">
                  <h3>이 학교 기출 회차</h3>
                  <div className="trend-table-wrap">
                    <table className="trend-table">
                      <thead>
                        <tr>
                          <th>회차</th>
                          <th>문항</th>
                          <th>서술형</th>
                          <th>서술형 비중</th>
                          <th>올린 학원</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.exams.map((exam) => (
                          <tr key={exam.id}>
                            <td>{examTitle(exam)}</td>
                            <td>{exam.stats?.totalQuestions ?? "-"}</td>
                            <td>{exam.stats?.subjectiveCount ?? "-"}</td>
                            <td>{percent(exam.stats?.subjectiveRatio)}</td>
                            <td>{exam.contributorCount}곳</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
