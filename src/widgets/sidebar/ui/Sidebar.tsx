import { NavLink } from "react-router-dom";
import { Icon } from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/iconTypes";
import "./Sidebar.css";

interface NavigationItem {
  icon: IconName;
  label: string;
  path: string;
  count?: string;
}

const primaryNavigation: NavigationItem[] = [
  { icon: "layout-dashboard", label: "워크스페이스", path: "/workspace" },
  { icon: "files", label: "문제 세트", path: "/problem-sets", count: "24" },
  { icon: "database", label: "학교·시험 경향", path: "/school-trends" },
  { icon: "chart-no-axes-combined", label: "데이터 리포트", path: "/reports" },
  { icon: "clipboard-check", label: "시험 후 리뷰", path: "/reviews" },
];

const secondaryNavigation: NavigationItem[] = [
  { icon: "users", label: "팀원 및 권한", path: "/members" },
  { icon: "settings", label: "워크스페이스 설정", path: "/settings" },
];

const workspaceName = "솔샘학원";

function NavigationItemView({ item }: { item: NavigationItem }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `sidebar__navigation-item${isActive ? " is-active" : ""}`
      }
      end={item.path === "/workspace"}
      to={item.path}
    >
      {({ isActive }) => (
        <>
          <Icon
            name={item.icon}
            size={18}
            tone={isActive ? "accent" : "default"}
          />
          <span>{item.label}</span>
          {item.count && <small>{item.count}</small>}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__content">
        <a className="sidebar__brand" href="#">
          <span className="sidebar__brand-icon">
            <Icon name="book-open" size={20} tone="accent" />
          </span>
          <strong>내신 뚝딱</strong>
        </a>

        <button className="sidebar__workspace" type="button">
          <span className="sidebar__avatar">{workspaceName.charAt(0)}</span>

          <span className="sidebar__workspace-copy">
            <strong>{workspaceName}</strong>
            <small>본원 · 팀 4명</small>
          </span>

          <Icon name="chevrons-up-down" size={14} />
        </button>

        <nav aria-label="주요 메뉴" className="sidebar__navigation">
          {primaryNavigation.map((item) => (
            <NavigationItemView item={item} key={item.label} />
          ))}
        </nav>

        <div className="sidebar__divider" />

        <nav
          aria-label="워크스페이스 메뉴"
          className="sidebar__secondary-navigation"
        >
          {secondaryNavigation.map((item) => (
            <NavigationItemView item={item} key={item.label} />
          ))}
        </nav>
      </div>

      <div className="sidebar__footer">
        <button className="sidebar__user" type="button">
          <span className="sidebar__user-avatar">서</span>
          <span className="sidebar__workspace-copy">
            <strong>김서현 선생님</strong>
            <small>관리자</small>
          </span>
          <Icon name="chevron-down" size={14} />
        </button>
      </div>
    </aside>
  );
}
