import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getReviewStats } from "@/entities/reports/api/repository";
import type { ReviewCounts, ReviewStatsResponse } from "@/entities/reports/model/types";
import { NoWorkspaceError, workspaceRepository } from "@/entities/workspace/api/repository";
import type { WorkspaceOption } from "@/entities/workspace/model/types";
import { setWorkspaceId } from "@/shared/auth/workspace";
import { formatDateTime } from "@/shared/lib/date";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import "./ReportsPage.css";

function percent(rate: number | null | undefined) {
  return rate === null || rate === undefined ? "-" : `${Math.round(rate * 100)}%`;
}

function reviewed(counts: ReviewCounts) {
  return counts.accepted + counts.rejected;
}

interface PageData {
  workspaceId: number;
  title: string;
  options: WorkspaceOption[];
  stats: ReviewStatsResponse;
}

export function ReportsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const workspace = await workspaceRepository.execute();
      const stats = await getReviewStats(workspace.id);
      if (active) setData({ workspaceId: workspace.id, title: workspace.title, options: workspace.options, stats });
    })().catch((cause: unknown) => {
      if (!active) return;
      if (cause instanceof NoWorkspaceError) setEmpty(true);
      else setError(cause instanceof Error && cause.message ? cause.message : "리포트를 불러오지 못했습니다.");
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function selectWorkspace(workspaceId: number) {
    setWorkspaceId(workspaceId);
    setData(null);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  const stats = data?.stats;
  const total = stats?.total;
  const jobs = stats?.byJob ?? [];
  const firstRate = jobs.find((job) => job.counts.acceptanceRate !== null)?.counts.acceptanceRate ?? null;
  const lastRate = [...jobs].reverse().find((job) => job.counts.acceptanceRate !== null)?.counts.acceptanceRate ?? null;

  return (
    <PageContainer>
      <div className="reports-page">
        <div className="reports-heading">
          <div>
            <h1>데이터 리포트</h1>
            <p>AI가 만든 문항을 얼마나 채택했는지 봅니다. 폐기 사유와 수정 내용이 다음 생성에 반영되어, 쓸수록 채택률이 오릅니다.</p>
          </div>
          {data && data.options.length > 1 && (
            <label className="reports-workspace">
              <span>워크스페이스</span>
              <select
                id="reports-workspace"
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
          <p className="reports-notice reports-notice--error" role="alert">
            {error}
          </p>
        )}
        {empty && (
          <p className="reports-notice">
            워크스페이스가 없습니다. <Link to="/workspace">워크스페이스</Link>에서 학교를 추가해 주세요.
          </p>
        )}
        {!data && !error && !empty && <p className="reports-muted">리포트를 불러오는 중입니다.</p>}

        {total && total.generated === 0 && (
          <section className="reports-card reports-empty">
            <h2>아직 생성한 문항이 없습니다</h2>
            <p>
              {data?.title}에서 <Link to="/problem-sets">문제를 생성하고 검수</Link>하면 채택률이 여기에 쌓입니다.
            </p>
          </section>
        )}

        {stats && total && total.generated > 0 && (
          <>
            <section aria-label="검수 요약" className="reports-metrics">
              <div className="reports-card reports-metric">
                <span>채택률</span>
                <strong>{percent(total.acceptanceRate)}</strong>
                <small>
                  채택 {total.accepted} / 검수 {reviewed(total)}
                </small>
              </div>
              <div className="reports-card reports-metric">
                <span>생성한 문항</span>
                <strong>{total.generated}</strong>
                <small>생성 작업 {jobs.length}회</small>
              </div>
              <div className="reports-card reports-metric">
                <span>수정한 문항</span>
                <strong>{total.edited}</strong>
                <small>고친 내용은 다음 생성에 반영</small>
              </div>
              <div className="reports-card reports-metric">
                <span>검수 전</span>
                <strong>{total.pending}</strong>
                <small>폐기 {total.rejected}</small>
              </div>
            </section>

            <section className="reports-card reports-section">
              <div className="reports-section__heading">
                <h2>생성 작업별 채택률</h2>
                {firstRate !== null && lastRate !== null && jobs.length > 1 && (
                  <span className={lastRate >= firstRate ? "reports-trend reports-trend--up" : "reports-trend"}>
                    첫 작업 {percent(firstRate)} → 최근 {percent(lastRate)}
                  </span>
                )}
              </div>
              <ol className="reports-jobs">
                {jobs.map((job, index) => (
                  <li key={job.generationJobId}>
                    <span className="reports-jobs__value">{percent(job.counts.acceptanceRate)}</span>
                    <span className="reports-jobs__bar">
                      <span style={{ height: `${Math.max((job.counts.acceptanceRate ?? 0) * 100, 2)}%` }} />
                    </span>
                    <strong>{index + 1}회차</strong>
                    <small>{formatDateTime(job.createdAt)}</small>
                    <small>
                      {job.counts.generated}문항 · 검수 전 {job.counts.pending}
                    </small>
                  </li>
                ))}
              </ol>
            </section>

            <section className="reports-card reports-section">
              <h2>유형별</h2>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>유형</th>
                      <th>생성</th>
                      <th>채택</th>
                      <th>폐기</th>
                      <th>수정</th>
                      <th>검수 전</th>
                      <th>채택률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byType.map((item) => (
                      <tr key={item.type}>
                        <td>{item.label}</td>
                        <td>{item.counts.generated}</td>
                        <td>{item.counts.accepted}</td>
                        <td>{item.counts.rejected}</td>
                        <td>{item.counts.edited}</td>
                        <td>{item.counts.pending}</td>
                        <td>
                          <span className="reports-rate">
                            <span className="reports-rate__track">
                              <span style={{ width: `${(item.counts.acceptanceRate ?? 0) * 100}%` }} />
                            </span>
                            {percent(item.counts.acceptanceRate)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </PageContainer>
  );
}
