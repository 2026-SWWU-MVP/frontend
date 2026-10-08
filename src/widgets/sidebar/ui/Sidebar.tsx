import { Icon } from '@/shared/ui/Icon/Icon'
import type { IconName } from '@/shared/ui/Icon/iconTypes'

import './Sidebar.css'

interface NavigationItem {
  icon: IconName
  label: string
  count?: string
  active?: boolean
}

const primaryNavigation: NavigationItem[] = [
  { icon: 'layout-dashboard', label: '워크스페이스', active: true },
  { icon: 'files', label: '문제 세트', count: '24' },
  { icon: 'database', label: '학교·시험 경향' },
  { icon: 'chart-no-axes-combined', label: '데이터 리포트' },
  { icon: 'clipboard-check', label: '시험 후 리뷰' },
]

const secondaryNavigation: NavigationItem[] = [
  { icon: 'users', label: '팀원 및 권한' },
  { icon: 'settings', label: '워크스페이스 설정' },
]

function NavigationItemView({ item }: { item: NavigationItem }) {
  return (
    <a className={`sidebar__navigation-item${item.active ? ' is-active' : ''}`} href="#">
      <Icon name={item.icon} size={18} tone={item.active ? 'accent' : 'default'} />
      <span>{item.label}</span>
      {item.count && <small>{item.count}</small>}
    </a>
  )
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__content">
        <a className="sidebar__brand" href="#">
          <span className="sidebar__brand-icon">
            <Icon name="book-open" size={20} tone="accent" />
          </span>
          <strong>문항결</strong>
        </a>

        <button className="sidebar__workspace" type="button">
          <span className="sidebar__avatar">봄</span>
          <span className="sidebar__workspace-copy">
            <strong>봄길학원</strong>
            <small>본원 · 팀 4명</small>
          </span>
          <Icon name="chevrons-up-down" size={14} />
        </button>

        <nav aria-label="주요 메뉴" className="sidebar__navigation">
          {primaryNavigation.map((item) => <NavigationItemView item={item} key={item.label} />)}
        </nav>

        <div className="sidebar__divider" />

        <nav aria-label="워크스페이스 메뉴" className="sidebar__secondary-navigation">
          {secondaryNavigation.map((item) => <NavigationItemView item={item} key={item.label} />)}
        </nav>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__demo">
          <strong>데모 워크스페이스</strong>
          <p>학교·자료·통계는 예시입니다. 실제 운영 결과가 아닙니다.</p>
        </div>
        <button className="sidebar__user" type="button">
          <span className="sidebar__user-avatar">서</span>
          <span className="sidebar__workspace-copy">
            <strong>김서연 선생님</strong>
            <small>관리자</small>
          </span>
          <Icon name="chevron-down" size={14} />
        </button>
      </div>
    </aside>
  )
}
