import { useEffect, useMemo, useState } from "react";
import { schoolTrendsRepository } from "@/entities/school-trends/api/repository";
import type {
  SchoolTrendFilters,
  TrendItem,
} from "@/entities/school-trends/model/types";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import "./SchoolTrendsPage.css";

const initialFilters: SchoolTrendFilters = {
  query: "",
  school: "전체 학교",
  subject: "전체 과목",
  exam: "전체 시험",
};
function TrendRow({
  item,
  active,
  onClick,
}: {
  item: TrendItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`trend-row${active ? " is-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span>
        <strong>{item.school}</strong>
        <small>{item.gradeSubject}</small>
      </span>
      <span>{item.exam}</span>
      <span>{item.size}</span>
      <span>{item.updatedAt}</span>
    </button>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="trend-filter">
      <strong>{label}</strong>
      <span className="trend-select">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <Icon name="chevron-down" size={14} />
      </span>
    </label>
  );
}
function DetailCard({ item }: { item: TrendItem }) {
  return (
    <section className="trend-card trend-detail-card">
      <div className="card-title-row">
        <h2>
          {item.school} · {item.gradeSubject.split(" · ")[1]}
        </h2>
        <span className="status-badge">선택됨</span>
      </div>
      <p className="detail-subtitle">
        {item.gradeSubject} · {item.exam} · 예시 학교
      </p>
      <div className="detail-badges">
        <span>사용자 자료 {item.sourceCount}건</span>
        <span className={item.reviewComplete ? "success" : ""}>
          {item.reviewComplete ? "교사 확인 완료" : "교사 확인 대기"}
        </span>
      </div>
      <div className="distribution-title">
        <strong>문항 유형 분포</strong>
        <small>데모 · {item.size.split(" · ")[1]}</small>
      </div>
      <div className="distribution-list">
        {item.distribution.map((entry) => (
          <div className="distribution-item" key={entry.label}>
            <div>
              <span>{entry.label}</span>
              <strong>
                {entry.percentage}% · {entry.count}문항
              </strong>
            </div>
            <div className="progress">
              <i style={{ width: `${entry.percentage * 2.5}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="insight-box">
        <strong>본문 근거 + 사례 적용을 함께 준비</strong>
        <p>{item.insight}</p>
      </div>
      <Button className="make-button" variant="primary">
        이 경향으로 문제 만들기
      </Button>
    </section>
  );
}
export function SchoolTrendsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState<TrendItem[]>([]);
  const [selectedId, setSelectedId] = useState("hanbit-korean");
  const [totals, setTotals] = useState({
    totalSchools: 4,
    totalSubjects: 3,
    totalUploads: 12,
  });
  useEffect(() => {
    schoolTrendsRepository.execute(filters).then((response) => {
      setItems(response.items);
      setTotals(response);
    });
  }, [filters]);
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId],
  );
  const updateFilter = (key: keyof SchoolTrendFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  return (
    <PageContainer>
      <div className="school-trends-page">
        <div className="school-trends-heading">
          <div>
            <h1>쌓인 자료가, 다음 문제의 기준이 됩니다</h1>
            <p>
              학교·시험별 기출 자료를 모으고, 교사가 확인한 출제 경향을 생성에
              반영하세요.
            </p>
          </div>
          <Button variant="primary">
            <Icon name="plus" size={16} />
            학교·시험 자료 추가
          </Button>
        </div>
        <div className="notice">
          <Icon name="search" size={16} tone="accent" />
          <span>
            특정 학교나 과목에 제한되지 않습니다. 새 학교·과목을 직접 등록하고,
            자료가 없는 시험도 기본 설정으로 시작할 수 있어요.
          </span>
        </div>
        <section className="trend-card filters-card">
          <label className="trend-filter search-filter">
            <strong>학교·시험 검색</strong>
            <input
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder="학교명 또는 시험명으로 검색"
            />
          </label>
          <SelectField
            label="학교"
            value={filters.school}
            options={[
              "전체 학교",
              "한빛고등학교",
              "세종중학교",
              "다온고등학교",
              "은솔중학교",
            ]}
            onChange={(value) => updateFilter("school", value)}
          />
          <SelectField
            label="과목"
            value={filters.subject}
            options={["전체 과목", "국어", "수학", "통합과학"]}
            onChange={(value) => updateFilter("subject", value)}
          />
          <SelectField
            label="시험 구분"
            value={filters.exam}
            options={["전체 시험", "1학기 중간", "1학기 기말", "2학기 중간"]}
            onChange={(value) => updateFilter("exam", value)}
          />
        </section>
        <div className="trends-grid">
          <div>
            <section className="trend-card registered-card">
              <div className="card-title-row">
                <h2>등록된 학교·시험</h2>
                <span className="meta-badge">데모 · 5개 분류</span>
              </div>
              <div className="trend-table-head">
                <span>학교 · 과목</span>
                <span>시험</span>
                <span>자료 규모</span>
                <span>갱신일</span>
              </div>
              <div className="trend-rows">
                {items.map((item) => (
                  <TrendRow
                    active={selected?.id === item.id}
                    item={item}
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}
                {items.length === 0 && (
                  <p className="empty-message">조건에 맞는 자료가 없습니다.</p>
                )}
              </div>
              <div className="list-footer">
                총 {totals.totalSchools}개 학교 · {totals.totalSubjects}개 과목
                · 업로드 {totals.totalUploads}건 <span>1 / 1 〈 〉</span>
              </div>
            </section>
            <section className="trend-card source-card">
              <h2>자료의 출처와 분석을 구분합니다</h2>
              <div className="source-columns">
                <div>
                  <span className="source-label">사용자 업로드</span>
                  <p>
                    학원에서 올린 시험지 원본과 문항 정보입니다. 업로드한 팀원과
                    자료 권한을 함께 기록합니다.
                  </p>
                </div>
                <div>
                  <span className="source-label accent">
                    AI 분석 · 교사 확인
                  </span>
                  <p>
                    유형·난이도·주제 분류는 분석 결과입니다. 근거를 확인하고
                    수정한 경향만 생성 기준으로 활용하세요.
                  </p>
                </div>
              </div>
              <p className="source-note">
                자료가 누적되면 경향의 근거가 보강될 수 있습니다. 과거 유형은
                다음 시험의 출제를 보장하지 않습니다.
              </p>
            </section>
          </div>
          <div>
            {selected ? (
              <DetailCard item={selected} />
            ) : (
              <section className="trend-card">
                <p className="empty-message">자료를 선택해 주세요.</p>
              </section>
            )}
            <section className="trend-card evidence-card">
              <div className="card-title-row">
                <h2>분석 근거 자료</h2>
                <span className="meta-badge">데모</span>
              </div>
              {[
                "2026년 1학기 중간 · 20문항",
                "2025년 1학기 중간 · 20문항",
                "2024년 1학기 중간 · 20문항",
              ].map((title) => (
                <div className="evidence-row" key={title}>
                  <Icon name="files" size={16} />
                  <div>
                    <strong>{title}</strong>
                    <small>사례 적용 6문항 · 대표 13·15번 · 김서현 확인</small>
                  </div>
                </div>
              ))}
              <a href="#evidence">원본과 분석 결과 확인 →</a>
            </section>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
