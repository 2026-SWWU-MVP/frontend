import { useEffect, useMemo, useRef, useState } from "react";

import {
  cancelInvite,
  deleteLogo,
  getLogo,
  issueInvite,
  listInvites,
  listMembers,
  removeMember,
  renameAcademy,
  uploadLogo,
} from "@/entities/academy/api/repository";
import type { AcademyMember, InviteCode } from "@/entities/academy/api/repository";
import { getAcademyPlanLabel, getStoredAcademy } from "@/shared/academy/academy";
import { loadAcademy, useAcademyState } from "@/shared/academy/state";
import { getAuthSession } from "@/shared/auth/session";
import { formatDateTime } from "@/shared/lib/date";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";

import "./MembersPage.css";
import { InviteCodeModal } from "./InviteCodeModal";
import { RemoveMemberModal, type MemberForModal } from "./RemoveMemberModal";

type MemberRole = "원장" | "강사";

const roleLabel = (role: AcademyMember["role"]): MemberRole => (role === "OWNER" ? "원장" : "강사");

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export function MembersPage() {
  const session = getAuthSession();
  const userId = session?.userId ?? null;
  const isOwner = session?.role === "OWNER";
  useAcademyState(userId);
  const academy = getStoredAcademy(userId ?? undefined);

  const [members, setMembers] = useState<AcademyMember[] | null>(null);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"전체 권한" | MemberRole>("전체 권한");
  const [sortAscending, setSortAscending] = useState(true);
  const [academyName, setAcademyName] = useState<string | null>(null);

  const [issuedInvite, setIssuedInvite] = useState<InviteCode | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<MemberForModal | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    listMembers()
      .then((items) => active && setMembers(items))
      .catch((cause: unknown) => {
        if (!active) return;
        setMembers([]);
        setError(errorMessage(cause, "강사 목록을 불러오지 못했습니다."));
      });
    if (isOwner) {
      listInvites()
        .then((items) => active && setInvites(items))
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [isOwner]);

  const hasLogo = academy?.hasLogo === true;
  useEffect(() => {
    if (!hasLogo) return;
    let url: string | null = null;
    let active = true;
    getLogo()
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setLogoUrl(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [hasLogo, academy?.logoWidth, academy?.logoHeight]);

  const activeInvite = invites.find((invite) => invite.status === "ACTIVE") ?? null;

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (members ?? [])
      .filter((member) => role === "전체 권한" || roleLabel(member.role) === role)
      .filter(
        (member) => !normalizedQuery || `${member.name} ${member.loginId}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => (sortAscending ? a.name.localeCompare(b.name, "ko") : b.name.localeCompare(a.name, "ko")));
  }, [members, query, role, sortAscending]);

  async function run(action: () => Promise<unknown>, fallback: string) {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (cause) {
      setError(errorMessage(cause, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const refreshAcademy = () => (userId === null ? Promise.resolve() : loadAcademy(userId, { force: true }).then(() => undefined));

  async function issue() {
    await run(async () => {
      const invite = await issueInvite();
      setInvites(await listInvites());
      setIssuedInvite(invite);
    }, "초대 코드를 발급하지 못했습니다.");
  }

  async function cancel(invite: InviteCode) {
    await run(async () => {
      await cancelInvite(invite.id);
      setInvites(await listInvites());
    }, "초대 코드를 취소하지 못했습니다.");
  }

  async function confirmRemove(member: MemberForModal) {
    const removed = await run(async () => {
      await removeMember(member.id);
      setMembers(await listMembers());
      await refreshAcademy();
    }, "강사를 내보내지 못했습니다.");
    if (removed) setMemberToRemove(null);
  }

  async function saveName() {
    const name = (academyName ?? "").trim();
    if (!name) {
      setError("학원 이름을 입력해 주세요.");
      return;
    }
    const saved = await run(async () => {
      await renameAcademy(name);
      await refreshAcademy();
    }, "학원 이름을 바꾸지 못했습니다.");
    if (saved) setAcademyName(null);
  }

  async function changeLogo(file: File) {
    await run(async () => {
      await uploadLogo(file);
      await refreshAcademy();
    }, "로고를 올리지 못했습니다.");
  }

  async function removeLogo() {
    await run(async () => {
      await deleteLogo();
      setLogoUrl(null);
      await refreshAcademy();
    }, "로고를 삭제하지 못했습니다.");
  }

  const academyLabel = academy?.name ?? "우리 학원";

  return (
    <PageContainer>
      <div className="members-page">
        <div className="members-page__heading">
          <div>
            <h1>팀원 및 권한</h1>
            <p>함께 수업을 준비하는 강사를 초대하고, 학원 정보를 관리하세요.</p>
          </div>

          {isOwner && (
            <Button
              className="members-page__invite"
              disabled={busy}
              onClick={() => void issue()}
              type="button"
              variant="primary"
            >
              <Icon name="plus" size={16} tone="accent" />
              강사 초대 코드 발급
            </Button>
          )}
        </div>

        {error && (
          <p className="members-page__error" role="alert">
            {error}
          </p>
        )}

        <section aria-label="강사 초대 안내" className="members-page__invite-banner">
          <span className="members-page__banner-icon">
            <Icon name="users" size={22} tone="accent" />
          </span>

          <div>
            <strong>초대 코드 하나로, 선생님과 함께 준비하세요</strong>
            <p>
              발급한 코드를 전달하면 강사가 {academyLabel}에 참여할 수 있어요. 초대 코드는 7일 동안 유효하고, 강사 한
              명이 쓰면 끝나는 1회용입니다.
            </p>
          </div>

          <span className="members-page__banner-note">
            강사 {academy?.teacherCount ?? "-"} / 최대 {academy?.maxTeachers ?? "-"}명
          </span>
        </section>

        <section className="members-page__members-card">
          <div className="members-page__card-header">
            <h2>
              구성원 <Badge tone="accent">{filteredMembers.length}명</Badge>
            </h2>

            <div className="members-page__filters">
              <label className="members-page__search">
                <Icon name="search" size={18} />
                <input
                  id="members-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="이름 또는 아이디 검색"
                  value={query}
                />
              </label>

              <select
                aria-label="권한 필터"
                id="members-role"
                onChange={(event) => setRole(event.target.value as typeof role)}
                value={role}
              >
                <option>전체 권한</option>
                <option>원장</option>
                <option>강사</option>
              </select>
            </div>
          </div>

          <div className="members-page__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    이름{" "}
                    <button
                      aria-label="이름순 정렬"
                      className="members-page__sort"
                      onClick={() => setSortAscending((value) => !value)}
                      type="button"
                    >
                      ↕
                    </button>
                  </th>
                  <th>아이디</th>
                  <th>권한</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => {
                  const isCurrentUser = member.userId === userId;
                  const memberRole = roleLabel(member.role);
                  return (
                    <tr key={member.userId}>
                      <td>
                        <div className="members-page__member">
                          <span className={`members-page__avatar ${isCurrentUser ? "is-accent" : ""}`}>
                            {member.name.slice(0, 2)}
                          </span>
                          <span>
                            <strong>{member.name}</strong>
                            {isCurrentUser && <small>나</small>}
                          </span>
                        </div>
                      </td>
                      <td>{member.loginId}</td>
                      <td>
                        <Badge tone={member.role === "OWNER" ? "accent" : "neutral"}>{memberRole}</Badge>
                      </td>
                      <td>
                        {isOwner && member.role !== "OWNER" ? (
                          <button
                            className="members-page__manage"
                            disabled={busy}
                            onClick={() =>
                              setMemberToRemove({
                                id: member.userId,
                                initials: member.name.slice(0, 2),
                                name: member.name,
                                loginId: member.loginId,
                                role: memberRole,
                              })
                            }
                            type="button"
                          >
                            내보내기
                          </button>
                        ) : (
                          <span className="members-page__manage is-current">{isCurrentUser ? "내 계정" : "-"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {members !== null && filteredMembers.length === 0 && (
                  <tr>
                    <td className="members-page__empty" colSpan={4}>
                      {members.length === 0 ? "구성원이 없습니다." : "검색 결과가 없습니다."}
                    </td>
                  </tr>
                )}
                {members === null && (
                  <tr>
                    <td className="members-page__empty" colSpan={4}>
                      구성원을 불러오는 중입니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="members-page__table-footer">
            <span>전체 {members?.length ?? 0}명</span>
            <span>원장은 내보낼 수 없습니다.</span>
          </div>
        </section>

        <div className="members-page__bottom-grid">
          <section className="members-page__info-card">
            <h2>학원 정보</h2>
            {isOwner ? (
              <form
                className="members-page__academy-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveName();
                }}
              >
                <label htmlFor="academy-name">학원 이름</label>
                <div>
                  <input
                    id="academy-name"
                    maxLength={50}
                    onChange={(event) => setAcademyName(event.target.value)}
                    value={academyName ?? academy?.name ?? ""}
                  />
                  <Button disabled={busy || academyName === null} type="submit" variant="secondary">
                    저장
                  </Button>
                </div>
              </form>
            ) : (
              <p>
                <strong>{academyLabel}</strong>
              </p>
            )}
            <p className="members-page__muted">
              요금제 {getAcademyPlanLabel(academy?.plan ?? null)} · 강사 {academy?.teacherCount ?? "-"} / 최대{" "}
              {academy?.maxTeachers ?? "-"}명
            </p>

            <div className="members-page__logo">
              <div className="members-page__logo-preview">
                {hasLogo && logoUrl ? <img alt={`${academyLabel} 로고`} src={logoUrl} /> : <span>로고 없음</span>}
              </div>
              <div>
                <p className="members-page__muted">시험지 머리글에 들어갑니다. 없으면 학원 이름이 들어갑니다.</p>
                {isOwner && (
                  <div className="members-page__logo-actions">
                    <input
                      accept="image/png,image/jpeg"
                      hidden
                      id="academy-logo"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void changeLogo(file);
                        event.target.value = "";
                      }}
                      ref={logoInput}
                      type="file"
                    />
                    <Button disabled={busy} onClick={() => logoInput.current?.click()} type="button" variant="secondary">
                      {hasLogo ? "로고 변경" : "로고 올리기"}
                    </Button>
                    {hasLogo && (
                      <Button disabled={busy} onClick={() => void removeLogo()} type="button" variant="outline">
                        삭제
                      </Button>
                    )}
                    <span className="members-page__muted">PNG·JPG, 2MB 이하</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {isOwner ? (
            <section className="members-page__info-card members-page__code-card">
              <div className="members-page__code-heading">
                <h2>초대 코드</h2>
                <Icon name="layers" size={20} />
              </div>

              {activeInvite ? (
                <>
                  <strong className="members-page__code">{activeInvite.code}</strong>
                  <p>{formatDateTime(activeInvite.expiresAt)}까지 사용할 수 있어요. 강사 권한으로 참여합니다.</p>
                  <div className="members-page__logo-actions">
                    <Button
                      disabled={busy}
                      onClick={() => setIssuedInvite(activeInvite)}
                      type="button"
                      variant="secondary"
                    >
                      코드 보기·복사
                    </Button>
                    <Button disabled={busy} onClick={() => void cancel(activeInvite)} type="button" variant="outline">
                      코드 취소
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <strong>현재 유효한 초대 코드가 없어요</strong>
                  <p>새 코드를 발급해 강사에게 전달하세요. 참여 시 강사 권한이 자동으로 부여됩니다.</p>
                </>
              )}
            </section>
          ) : (
            <section className="members-page__info-card">
              <h2>권한별로 할 수 있는 일</h2>
              <p>
                <Badge tone="accent">원장</Badge>
                <span>강사 초대·내보내기, 학원 이름·로고 관리, 문제 세트 제작</span>
              </p>
              <p>
                <Badge tone="neutral">강사</Badge>
                <span>기출 분석, 출제 프로필 검토, 문제 세트 제작·검수</span>
              </p>
            </section>
          )}
        </div>
      </div>

      {issuedInvite && (
        <InviteCodeModal academyName={academyLabel} invite={issuedInvite} onClose={() => setIssuedInvite(null)} />
      )}

      {memberToRemove && (
        <RemoveMemberModal
          academyName={academyLabel}
          busy={busy}
          member={memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onConfirm={(member) => void confirmRemove(member)}
        />
      )}
    </PageContainer>
  );
}
