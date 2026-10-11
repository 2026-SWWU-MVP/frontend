import { Breadcrumbs } from "@/shared/ui/Breadcrumbs/Breadcrumbs";
import { Icon } from "@/shared/ui/Icon/Icon";
import { getAuthSession } from "@/shared/auth/session";
import { getStoredAcademy } from "@/shared/academy/academy";
import { useAcademyState } from "@/shared/academy/state";
import "./Header.css";
export function Header() {
  const userId = getAuthSession()?.userId ?? null;
  const academyState = useAcademyState(userId);
  const academy = getStoredAcademy(userId ?? undefined);
  const academyName = academy?.name ?? (academyState.status === "loading" ? "학원 정보 로딩 중" : "학원 정보 없음");

  return (
    <header className="app-header">
      <Breadcrumbs
        items={[{ label: academyName }, { label: "학교·시험 경향" }]}
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
