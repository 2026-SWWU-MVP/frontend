import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "@/widgets/header/ui/Header";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { AcademyStatusNotice } from "@/widgets/academy-status/ui/AcademyStatusNotice";

import "./AppShell.css";

export function AppShell() {
  // 767px 이하에서는 사이드바를 서랍처럼 열고 닫는다
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={`app-shell${navOpen ? " is-nav-open" : ""}`}>
      <Sidebar onNavigate={() => setNavOpen(false)} />
      {navOpen && <div aria-hidden="true" className="app-shell__overlay" onClick={() => setNavOpen(false)} />}
      <div className="app-shell__workspace">
        <Header menuOpen={navOpen} onMenuClick={() => setNavOpen((open) => !open)} />
        <AcademyStatusNotice />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
