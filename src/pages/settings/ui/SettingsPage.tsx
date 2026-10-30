import { useEffect, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";

import { workspaceRepository } from "@/entities/workspace/api/repository";
import { getWorkspaceId } from "@/shared/auth/workspace";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/iconTypes";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import { Select } from "@/shared/ui/Select/Select";

import "./SettingsPage.css";

// 백엔드 API 없이 브라우저에만 저장하는 설정 (워크스페이스별)
type Difficulty = "easy" | "normal" | "hard";

interface WorkspaceSettings {
  name: string;
  description: string;
  semester: "1" | "2";
  midtermDate: string;
  finalDate: string;
  defaultQuestionCount: string;
  difficulty: Difficulty;
  includeExplanation: boolean;
  showSourcePassage: boolean;
  paperSize: "A4" | "B4";
  showAcademyLogo: boolean;
  separateAnswerSheet: boolean;
  notifyGeneration: boolean;
  notifyProfile: boolean;
}

const defaultSettings: WorkspaceSettings = {
  name: "",
  description: "",
  semester: "2",
  midtermDate: "",
  finalDate: "",
  defaultQuestionCount: "20",
  difficulty: "normal",
  includeExplanation: true,
  showSourcePassage: true,
  paperSize: "A4",
  showAcademyLogo: true,
  separateAnswerSheet: true,
  notifyGeneration: true,
  notifyProfile: false,
};

const semesterOptions = [
  { value: "1", label: "1학기" },
  { value: "2", label: "2학기" },
];

const questionCountOptions = ["10", "15", "20", "25", "30"].map((count) => ({ value: count, label: `${count}문항` }));

const paperSizeOptions = [
  { value: "A4", label: "A4 (210 × 297mm)" },
  { value: "B4", label: "B4 (257 × 364mm)" },
];

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "쉬움" },
  { value: "normal", label: "보통" },
  { value: "hard", label: "어려움" },
];

const storageKey = (workspaceId: number | null) => `testfit.workspace-settings.${workspaceId ?? "default"}`;

function loadSettings(workspaceId: number | null): WorkspaceSettings | null {
  try {
    const stored = localStorage.getItem(storageKey(workspaceId));
    return stored ? { ...defaultSettings, ...(JSON.parse(stored) as Partial<WorkspaceSettings>) } : null;
  } catch {
    return null;
  }
}

function saveSettings(workspaceId: number | null, settings: WorkspaceSettings) {
  try {
    localStorage.setItem(storageKey(workspaceId), JSON.stringify(settings));
  } catch {
    // 저장소를 쓸 수 없는 환경(시크릿 창 등)에서는 화면 상태만 유지한다
  }
}

function daysUntil(date: string) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
}

function dDayLabel(date: string) {
  const days = daysUntil(date);
  if (days === null) return null;
  if (days === 0) return "D-Day";
  return days > 0 ? `D-${days}` : "종료";
}

function Section({ icon, title, description, children }: PropsWithChildren<{ icon: IconName; title: string; description: string }>) {
  return (
    <section className="settings-page__card">
      <header className="settings-page__card-header">
        <span className="settings-page__card-icon">
          <Icon name={icon} size={18} tone="accent" />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="settings-page__card-body">{children}</div>
    </section>
  );
}

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="settings-page__field">
      <div className="settings-page__field-label">
        <label htmlFor={htmlFor}>{label}</label>
        {hint && <small>{hint}</small>}
      </div>
      <div className="settings-page__field-control">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint: string }) {
  return (
    <label className="settings-page__toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="settings-page__switch" aria-hidden="true" />
    </label>
  );
}

export function SettingsPage() {
  const workspaceId = getWorkspaceId();
  const [schoolTitle, setSchoolTitle] = useState<string | null>(null);
  const [saved, setSaved] = useState<WorkspaceSettings>(() => loadSettings(workspaceId) ?? defaultSettings);
  const [settings, setSettings] = useState<WorkspaceSettings>(saved);
  const [notice, setNotice] = useState<string | null>(null);

  // 워크스페이스 이름 기본값은 실제 워크스페이스(학교 · 학년)에서 가져온다
  useEffect(() => {
    let active = true;
    workspaceRepository
      .execute()
      .then((workspace) => {
        if (!active) return;
        const current = workspace.options.find((option) => option.id === workspaceId) ?? workspace.options[0];
        if (!current) return;
        setSchoolTitle(current.title);
        const fillName = (value: WorkspaceSettings) => (value.name ? value : { ...value, name: current.title });
        setSaved(fillName);
        setSettings(fillName);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [workspaceId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  function update<K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const next = { ...settings, name: settings.name.trim() || schoolTitle || "" };
    saveSettings(workspaceId, next);
    setSaved(next);
    setSettings(next);
    setNotice("설정을 저장했습니다.");
  }

  function restoreDefaults() {
    setSettings({ ...defaultSettings, name: schoolTitle ?? "" });
    setNotice("기본값으로 되돌렸습니다. 저장을 눌러야 적용됩니다.");
  }

  const midtermDDay = dDayLabel(settings.midtermDate);
  const finalDDay = dDayLabel(settings.finalDate);

  return (
    <PageContainer>
      <div className="settings-page">
        <div className="settings-page__heading">
          <div>
            <h1>워크스페이스 설정</h1>
            <p>{schoolTitle ? `${schoolTitle} 워크스페이스의 기본 정보와 출제·출력 기본값을 관리합니다.` : "워크스페이스의 기본 정보와 출제·출력 기본값을 관리합니다."}</p>
          </div>
          <div className="settings-page__actions">
            <Button variant="outline" onClick={restoreDefaults}>
              기본값으로
            </Button>
            <Button variant="primary" onClick={save} disabled={!dirty}>
              <Icon name="check" size={16} />
              변경사항 저장
            </Button>
          </div>
        </div>

        {notice && (
          <div className="settings-page__notice" role="status">
            <Icon name="check" size={16} tone="accent" />
            {notice}
          </div>
        )}

        <div className="settings-page__grid">
          <Section icon="layers" title="기본 정보" description="워크스페이스 목록과 시험지 머리말에 표시되는 정보입니다.">
            <Field label="워크스페이스 이름" htmlFor="settings-name">
              <input id="settings-name" className="settings-page__input" value={settings.name} maxLength={40} onChange={(event) => update("name", event.target.value)} placeholder="예: 숙명여고 · 2학년" />
            </Field>
            <Field label="학교 · 학년" hint="워크스페이스를 만들 때 정해져 바꿀 수 없습니다.">
              <div className="settings-page__readonly">
                <Icon name="lock-keyhole" size={14} />
                {schoolTitle ?? "불러오는 중"}
              </div>
            </Field>
            <Field label="학기" htmlFor="settings-semester">
              <Select id="settings-semester" value={settings.semester} options={semesterOptions} onValueChange={(value) => update("semester", value as WorkspaceSettings["semester"])} fullWidth />
            </Field>
            <Field label="메모" hint="강사들끼리 공유할 짧은 메모" htmlFor="settings-description">
              <textarea id="settings-description" className="settings-page__input settings-page__textarea" value={settings.description} maxLength={200} rows={3} onChange={(event) => update("description", event.target.value)} placeholder="예: 2학기 중간 범위는 교과서 1~3과 + 모의고사 3월" />
            </Field>
          </Section>

          <Section icon="clipboard-check" title="시험 일정" description="대시보드에 남은 기간을 표시하는 데 사용됩니다.">
            <Field label="중간고사" htmlFor="settings-midterm">
              <div className="settings-page__date">
                <input id="settings-midterm" type="date" className="settings-page__input" value={settings.midtermDate} onChange={(event) => update("midtermDate", event.target.value)} />
                {midtermDDay && <span className="settings-page__dday">{midtermDDay}</span>}
              </div>
            </Field>
            <Field label="기말고사" htmlFor="settings-final">
              <div className="settings-page__date">
                <input id="settings-final" type="date" className="settings-page__input" value={settings.finalDate} onChange={(event) => update("finalDate", event.target.value)} />
                {finalDDay && <span className="settings-page__dday">{finalDDay}</span>}
              </div>
            </Field>
          </Section>

          <Section icon="files" title="문제 생성 기본값" description="새 문제 세트를 만들 때 처음 선택되어 있는 값입니다.">
            <Field label="기본 문항 수" htmlFor="settings-count">
              <Select id="settings-count" value={settings.defaultQuestionCount} options={questionCountOptions} onValueChange={(value) => update("defaultQuestionCount", value)} fullWidth />
            </Field>
            <Field label="난이도">
              <div className="settings-page__segmented" role="radiogroup" aria-label="난이도">
                {difficultyOptions.map((option) => (
                  <button key={option.value} type="button" role="radio" aria-checked={settings.difficulty === option.value} className={settings.difficulty === option.value ? "is-active" : ""} onClick={() => update("difficulty", option.value)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
            <Toggle checked={settings.includeExplanation} onChange={(value) => update("includeExplanation", value)} label="정답 해설 포함" hint="문항마다 해설을 함께 생성합니다." />
            <Toggle checked={settings.showSourcePassage} onChange={(value) => update("showSourcePassage", value)} label="출처 지문 표시" hint="검수 화면에서 문항 옆에 원문 지문을 보여줍니다." />
          </Section>

          <Section icon="book-open" title="시험지 출력" description="PDF로 내려받는 시험지와 답안지 형식입니다.">
            <Field label="용지 크기" htmlFor="settings-paper">
              <Select id="settings-paper" value={settings.paperSize} options={paperSizeOptions} onValueChange={(value) => update("paperSize", value as WorkspaceSettings["paperSize"])} fullWidth />
            </Field>
            <Toggle checked={settings.showAcademyLogo} onChange={(value) => update("showAcademyLogo", value)} label="학원 로고 표시" hint="시험지 머리말에 학원 로고를 넣습니다." />
            <Toggle checked={settings.separateAnswerSheet} onChange={(value) => update("separateAnswerSheet", value)} label="답안지 별도 출력" hint="정답과 해설을 따로 된 PDF로 만듭니다." />
          </Section>

          <Section icon="bell" title="알림" description="이 워크스페이스에서 받을 알림을 고릅니다.">
            <Toggle checked={settings.notifyGeneration} onChange={(value) => update("notifyGeneration", value)} label="문제 생성 완료" hint="AI 문제 생성이 끝나면 알려줍니다." />
            <Toggle checked={settings.notifyProfile} onChange={(value) => update("notifyProfile", value)} label="출제 프로필 변경" hint="다른 강사가 출제 프로필을 확정하면 알려줍니다." />
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
