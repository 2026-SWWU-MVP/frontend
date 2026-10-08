import { useEffect, useState } from "react";
import { reviewsRepository } from "@/entities/reviews/api/repository";
import type { ReviewData, ReviewFilters } from "@/entities/reviews/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import "./ReviewsPage.css";

const initialFilters: ReviewFilters = {
  examId: "hanbit-korean",
  setId: "public-market",
};
function SelectBox({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <span className="review-select">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={14} />
    </span>
  );
}
function ReviewCard({
  data,
  filters,
  onChange,
}: {
  data: ReviewData;
  filters: ReviewFilters;
  onChange: (key: keyof ReviewFilters, value: string) => void;
}) {
  return (
    <div className="review-top-grid">
      <section className="review-card source-panel">
        <div className="review-card-heading">
          <h2>실제 시험 자료</h2>
          <span className="review-badge">사용자 업로드</span>
        </div>
        <div className="file-row">
          <span className="file-icon">
            <Icon name="files" size={18} tone="accent" />
          </span>
          <div>
            <strong>{data.source.fileName}</strong>
            <small>{data.source.meta}</small>
          </div>
          <em>{data.source.status}</em>
        </div>
        <div className="panel-footer">
          <small>{data.source.scope}</small>
          <Button variant="secondary">
            <Icon name="plus" size={14} />
            자료 교체·추가
          </Button>
        </div>
      </section>
      <section className="review-card set-panel">
        <div className="review-card-heading">
          <h2>비교할 준비 문제 세트</h2>
          <span className="success-badge">확정 세트</span>
        </div>
        <label className="select-label">
          선택된 세트
          <SelectBox
            value={filters.setId}
            options={data.sets}
            onChange={(value) => onChange("setId", value)}
          />
        </label>
        <div className="panel-footer">
          <small>공공재 2문항 + 경제 지문 연습 8문항</small>
          <Button variant="secondary">
            <Icon name="search" size={14} />
            비교 분석
          </Button>
        </div>
      </section>
    </div>
  );
}
function MetricCards({ metrics }: { metrics: ReviewData["metrics"] }) {
  return (
    <div className="review-metrics">
      <section className="review-card review-metric">
        <span>실제 시험</span>
        <strong>{metrics.actual}</strong>
        <small>준비 세트 10문항과 비교</small>
      </section>
      <section className="review-card review-metric">
        <span>관련 주제 문항</span>
        <strong>{metrics.related}</strong>
        <small>공공재·시장 실패 · 데모</small>
      </section>
      <section className="review-card review-metric">
        <span>새로 확인한 범위</span>
        <strong>{metrics.newScope}</strong>
        <small>다음 수업 보완 주제</small>
      </section>
      <section className="review-card review-metric">
        <span>교사 검토 상태</span>
        <strong>{metrics.reviewStatus}</strong>
        <small>분석 근거와 분류 확인 필요</small>
      </section>
    </div>
  );
}
function CompareBars({
  items,
  title,
  color,
}: {
  items: Array<{ label: string; actual: number; prepared: number }>;
  title: string;
  color?: string;
}) {
  const max = Math.max(...items.map((item) => item.actual), 1);
  return (
    <div className="compare-column">
      <h3>{title}</h3>
      {items.map((item) => (
        <div className="compare-item" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>
              {item.actual} / {item.prepared}문항
            </strong>
          </div>
          <div className="compare-track">
            <i
              className={color ?? ""}
              style={{ width: `${(item.actual / max) * 100}%` }}
            />
            <b style={{ width: `${(item.prepared / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function ComparisonCard({
  comparison,
}: {
  comparison: ReviewData["comparison"];
}) {
  return (
    <section className="review-card comparison-card">
      <div className="review-card-heading">
        <h2>유형·난이도 비교</h2>
        <span className="analysis-badge">데모 분석</span>
      </div>
      <div className="compare-grid">
        <CompareBars items={comparison.types} title="유형 구성 · 실제 / 준비" />
        <CompareBars
          items={comparison.difficulty}
          title="난이도 분류 · 실제 / 준비"
          color="light"
        />
      </div>
      <div className="compare-notice">
        <Icon name="search" size={16} />
        준비 세트와 실제 시험의 문항 수가 다릅니다. 단순 개수 비교만으로 준비의
        충분성이나 적중률을 판단할 수 없습니다.
      </div>
    </section>
  );
}
function EvidenceCard({ evidence }: { evidence: ReviewData["evidence"] }) {
  return (
    <section className="review-card evidence-card">
      <div className="review-card-heading">
        <h2>문항별 비교 근거</h2>
        <small>대표 근거 3건</small>
      </div>
      <div className="evidence-head">
        <span>시험 문항</span>
        <span>분석 근거 · 연결된 준비 문항</span>
        <span>확인 상태</span>
      </div>
      {evidence.map((item) => (
        <div className="evidence-item" key={item.number}>
          <strong>{item.number}</strong>
          <div>
            <b>{item.title}</b>
            <small>{item.detail}</small>
          </div>
          <em className={item.status === "확인" ? "confirmed" : ""}>
            {item.status}
          </em>
        </div>
      ))}
      <a href="#review">원본 시험지와 준비 문항 나란히 보기 →</a>
    </section>
  );
}
function SummaryCard({ data }: { data: ReviewData }) {
  return (
    <section className="review-card summary-card">
      <div className="review-card-heading">
        <h2>학부모용 요약 리포트</h2>
        <span className="analysis-badge">선택 사항</span>
      </div>
      <p>
        상담과 학원 안내에 활용할 수 있는 학습 중심 요약입니다. 내부 문항과 원본
        시험지는 제외됩니다.
      </p>
      <label className="toggle-label">
        요약 포함 <input type="checkbox" defaultChecked />
        <i />
      </label>
      <div className="summary-paper">
        <strong>솔샘학원 · 시험 후 학습 안내</strong>
        <h3>{data.summary.title}</h3>
        <p>{data.summary.body}</p>
        <small>
          가상 자료를 사용한 데모 요약입니다. 실제 학생 성적 또는 학원 성과를
          제시하지 않습니다.
        </small>
      </div>
      <label className="check-label">
        <input type="checkbox" defaultChecked /> 학습 계획과 교사 의견 포함
      </label>
      <label className="check-label">
        <input type="checkbox" /> 시험 원문·내부 문항 포함
      </label>
      <Button variant="secondary">
        <Icon name="files" size={14} />
        학부모용 요약 PDF
      </Button>
      <small className="summary-note">
        외부 제공 전 내용·자료 권한을 확인하세요. 등록 증가나 성적 향상을
        보장하지 않습니다.
      </small>
    </section>
  );
}
function LimitationsCard({ items }: { items: string[] }) {
  return (
    <section className="review-card limitations-card">
      <h2>분석의 범위와 한계</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
function NotesCard({ note }: { note: string }) {
  return (
    <section className="review-card notes-card">
      <div className="review-card-heading">
        <h2>선생님 리뷰 노트</h2>
        <span className="review-badge">김서현</span>
      </div>
      <strong>다음 시험 준비에 반영할 내용</strong>
      <textarea defaultValue={note} />
      <div className="notes-footer">
        <small>팀 내부 공유 · 오늘 11:20 저장</small>
        <Button variant="secondary">노트 저장</Button>
      </div>
    </section>
  );
}
export function ReviewsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState<ReviewData | null>(null);
  useEffect(() => {
    reviewsRepository.execute(filters).then(setData);
  }, [filters]);
  const update = (key: keyof ReviewFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  if (!data)
    return (
      <PageContainer>
        <p>리뷰를 불러오는 중입니다.</p>
      </PageContainer>
    );
  const examOptions = data.exams.map((exam) => ({
    id: exam.id,
    label: exam.label,
  }));
  return (
    <PageContainer>
      <div className="reviews-page">
        <div className="reviews-heading">
          <div>
            <h1>시험이 끝난 뒤, 다음 준비가 시작됩니다</h1>
            <p>
              {data.exams.find((exam) => exam.id === filters.examId)?.label} ·
              분석과 교사 의견을 함께 기록하세요.
            </p>
          </div>
          <Button variant="secondary">
            <Icon name="files" size={16} />
            내부 리뷰 PDF 내보내기
          </Button>
        </div>
        <div className="exam-select-row">
          <label>
            분석할 시험
            <SelectBox
              value={filters.examId}
              options={examOptions}
              onChange={(value) => update("examId", value)}
            />
          </label>
        </div>
        <div className="reviews-notice">
          <Icon name="search" size={16} tone="accent" />
          가상 시험지와 준비 세트를 비교한 데모 분석입니다. 주제·유형의 겹침은
          문항 적중이나 학습 성과를 의미하지 않습니다.
        </div>
        <ReviewCard data={data} filters={filters} onChange={update} />
        <MetricCards metrics={data.metrics} />
        <div className="reviews-content-grid">
          <div>
            <ComparisonCard comparison={data.comparison} />
            <EvidenceCard evidence={data.evidence} />
            <NotesCard note={data.note} />
          </div>
          <div>
            <SummaryCard data={data} />
            <LimitationsCard items={data.limitations} />
          </div>
        </div>
        <div className="review-actions">
          <span>남은 근거 검토 2건 · 확인 후 최종 리포트를 확정하세요.</span>
          <div>
            <Button variant="secondary">초안 저장</Button>
            <Button variant="primary">✓ 검토 완료 · 리포트 확정</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
