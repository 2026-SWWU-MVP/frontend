import { Outlet } from "react-router-dom";

import { Header } from "@/widgets/header/ui/Header";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { AcademyStatusNotice } from "@/widgets/academy-status/ui/AcademyStatusNotice";

import "./AppShell.css";

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__workspace">
        <Header />
        <AcademyStatusNotice />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
