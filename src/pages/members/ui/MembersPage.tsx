import { useMemo, useState } from "react";

import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";

import "./MembersPage.css";

type MemberRole = "관리자" | "강사";

interface Member {
  id: number;
  initials: string;
  name: string;
  email: string;
  role: MemberRole;
  subject: string;
  joinedAt: string;
  lastActive: string;
  isCurrentUser?: boolean;
}

const members: Member[] = [
  {
    id: 1,
    initials: "서연",
    name: "김서연 선생님",
    email: "seoyeon.kim@bomgil.kr",
    role: "관리자",
    subject: "국어",
    joinedAt: "2026.09.01",
    lastActive: "오늘 10:24",
    isCurrentUser: true,
  },
  {
    id: 2,
    initials: "지훈",
    name: "박지훈 선생님",
    email: "jihoon.park@bomgil.kr",
    role: "강사",
    subject: "국어",
    joinedAt: "2026.09.03",
    lastActive: "오늘 09:10",
  },
  {
    id: 3,
    initials: "민지",
    name: "이미진 선생님",
    email: "minji.lee@bomgil.kr",
    role: "강사",
    subject: "수학",
    joinedAt: "2026.09.05",
    lastActive: "오늘 10:18",
  },
  {
    id: 4,
    initials: "도윤",
    name: "최도윤 선생님",
    email: "doyoon.choi@bomgil.kr",
    role: "강사",
    subject: "통합과학",
    joinedAt: "2026.09.08",
    lastActive: "어제 14:06",
  },
];

export function MembersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"전체 권한" | MemberRole>("전체 권한");
  const [sortAscending, setSortAscending] = useState(true);
  const [page, setPage] = useState(1);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members
      .filter((member) => role === "전체 권한" || member.role === role)
      .filter(
        (member) =>
          !normalizedQuery ||
          `${member.name} ${member.email}`
            .toLowerCase()
            .includes(normalizedQuery),
      )
      .sort((a, b) =>
        sortAscending
          ? a.name.localeCompare(b.name, "ko")
          : b.name.localeCompare(a.name, "ko"),
      );
  }, [query, role, sortAscending]);

  return (
    <PageContainer>
      <div className="members-page">
        <div className="members-page__heading">
          <div>
            <h1>팀원 및 권한</h1>
            <p>
              함께 수업을 준비하는 강사를 초대하고, 팀의 접근 권한을 관리하세요.
            </p>
          </div>
          <Button
            className="members-page__invite"
            variant="primary"
            type="button"
          >
            <Icon name="plus" size={16} tone="accent" /> 강사 초대 코드 발급
          </Button>
        </div>

        <section
          className="members-page__invite-banner"
          aria-label="강사 초대 안내"
        >
          <span className="members-page__banner-icon">
            <Icon name="users" size={22} tone="accent" />
          </span>
          <div>
            <strong>초대 코드 하나로, 선생님과 함께 준비하세요</strong>
            <p>
              발급한 코드를 전달하면 강사가 봄길학원에 참여할 수 있어요. 초대
              코드는 7일 동안 유효합니다.
            </p>
          </div>
          <span className="members-page__banner-note">관리자만 발급 가능</span>
        </section>

        <section className="members-page__members-card">
          <div className="members-page__card-header">
            <h2>
              강사 목록 <Badge tone="accent">{members.length}명</Badge>
            </h2>
            <div className="members-page__filters">
              <label className="members-page__search">
                <Icon name="search" size={18} />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="강사 이름 또는 이메일 검색"
                />
              </label>
              <select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value as typeof role);
                  setPage(1);
                }}
                aria-label="권한 필터"
              >
                <option>전체 권한</option>
                <option>관리자</option>
                <option>강사</option>
              </select>
            </div>
          </div>

          <div className="members-page__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    강사{" "}
                    <button
                      type="button"
                      className="members-page__sort"
                      onClick={() => setSortAscending((value) => !value)}
                      aria-label="이름순 정렬"
                    >
                      ↕
                    </button>
                  </th>
                  <th>권한</th>
                  <th>담당 과목</th>
                  <th>참여일</th>
                  <th>최근 활동</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="members-page__member">
                        <span
                          className={`members-page__avatar ${member.isCurrentUser ? "is-accent" : ""}`}
                        >
                          {member.initials}
                        </span>
                        <span>
                          <strong>{member.name}</strong>
                          {member.isCurrentUser && <small>나</small>}
                          <em>{member.email}</em>
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge
                        tone={member.role === "관리자" ? "accent" : "neutral"}
                      >
                        {member.role}
                      </Badge>
                    </td>
                    <td>{member.subject}</td>
                    <td>{member.joinedAt}</td>
                    <td>{member.lastActive}</td>
                    <td>
                      <button
                        className={`members-page__manage ${member.isCurrentUser ? "is-current" : ""}`}
                        type="button"
                      >
                        {member.isCurrentUser ? "내 계정" : "내보내기"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="members-page__table-footer">
            <span>
              전체 {filteredMembers.length}명 중{" "}
              {filteredMembers.length ? "1-" + filteredMembers.length : "0"}명
              표시
            </span>
            <span>관리자는 본인을 내보낼 수 없습니다.</span>
          </div>
        </section>

        <div className="members-page__bottom-grid">
          <section className="members-page__info-card">
            <h2>권한별로 할 수 있는 일</h2>
            <p>
              <Badge tone="accent">관리자</Badge>
              <span>
                문제 세트 제작·검토, 강사 초대·내보내기, 워크스페이스 설정
              </span>
            </p>
            <p>
              <Badge tone="neutral">강사</Badge>
              <span>팀 자료 조회, 문제 세트 제작·공동 검토, 시험 후 리뷰</span>
            </p>
          </section>
          <section className="members-page__info-card members-page__code-card">
            <div className="members-page__code-heading">
              <h2>초대 코드</h2>
              <Icon name="layers" size={20} />
            </div>
            <strong>현재 유효한 초대 코드가 없어요</strong>
            <p>
              새 코드를 발급해 강사에게 전달하세요. 참여 시 강사 권한이 자동으로
              부여됩니다.
            </p>
          </section>
        </div>

        <div className="members-page__pagination" aria-label="페이지네이션">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            ‹
          </button>
          <button className="is-active" type="button">
            1
          </button>
          <button type="button" disabled>
            ›
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
