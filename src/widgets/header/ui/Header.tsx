import { Breadcrumbs } from "@/shared/ui/Breadcrumbs/Breadcrumbs";
import { useLocation } from "react-router-dom";
import { Icon } from "@/shared/ui/Icon/Icon";
import { getAuthSession } from "@/shared/auth/session";
import { getStoredAcademy } from "@/shared/academy/academy";
import { useAcademyState } from "@/shared/academy/state";
import "./Header.css";
export function Header() {
  const location = useLocation();
  const userId = getAuthSession()?.userId ?? null;
  const academyState = useAcademyState(userId);
  const academy = getStoredAcademy(userId ?? undefined);
  const academyName = academy?.name ?? (academyState.status === "loading" ? "학원 정보 로딩 중" : "학원 정보 없음");

  const pageLabels: Record<string, string> = {
    "/members": "팀원 및 권한",
    "/workspace": "워크스페이스",
    "/problem-sets": "문제 세트",
    "/school-trends": "학교·시험 경향",
    "/reports": "데이터 리포트",
    "/profile": "출제 프로필",
    "/settings": "워크스페이스 설정",
  };
  const pageLabel =
    pageLabels[location.pathname] ??
    (location.pathname.startsWith("/problem-sets/") ? "문제 세트" : "페이지");

  return (
    <header className="app-header">
      <Breadcrumbs
        items={[{ label: academyName }, { label: pageLabel }]}
      />
      <div className="app-header__actions">
        <span className="app-header__badge">데모 데이터</span>
        <button
          aria-label="검색"
          className="app-header__icon-button"
          type="button"
        >
          <Icon name="search" size={18} />
        </button>
        <button
          aria-label="알림"
          className="app-header__icon-button"
          type="button"
        >
          <Icon name="bell" size={18} />
        </button>
        <button className="app-header__help" type="button">
          도움말
        </button>
      </div>
    </header>
  );
}
