import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NoWorkspaceError, workspaceRepository } from "@/entities/workspace/api/repository";
import type { WorkspaceOption, WorkspaceResponse } from "@/entities/workspace/model/types";
import { setWorkspaceId } from "@/shared/auth/workspace";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { PageContainer } from "@/shared/ui/PageContainer/PageContainer";
import { ExamInsight } from "@/widgets/exam-insight/ui/ExamInsight";
import { RecentQuestionSets } from "@/widgets/recent-question-sets/ui/RecentQuestionSets";
import { ReviewPrompt } from "@/widgets/review-prompt/ui/ReviewPrompt";
import { TeamActivity } from "@/widgets/team-activity/ui/TeamActivity";
import { WorkspaceOverview } from "@/widgets/workspace-overview/ui/WorkspaceOverview";

import { AddWorkspaceModal } from "./AddWorkspaceModal";
import "./WorkspacePage.css";

function profileLabel(option: WorkspaceOption) {
  if (option.profileStatus === "CONFIRMED") return { text: `프로필 v${option.confirmedProfileVersion ?? "-"} 확정`, tone: "confirmed" };
  if (option.profileStatus === "DRAFT") return { text: "프로필 검토 중", tone: "draft" };
  return { text: "프로필 없음", tone: "none" };
}

/** 카드 상태에 맞춰 다음에 할 일을 알려준다 */
function nextStep(option: WorkspaceOption) {
  if (option.profileStatus === "CONFIRMED") return "문제를 만들 수 있어요";
  if (option.profileStatus === "DRAFT") return "출제 프로필을 확정해 주세요";
  if (option.pastExamCount > 0) return "기출로 출제 프로필을 만들어 주세요";
  return "기출부터 올려 주세요";
}

function WorkspaceCards({
  options,
  selectedId,
  onSelect,
  onAdd,
}: {
  options: WorkspaceOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
}) {
  return (
    <section aria-label="워크스페이스 목록" className="workspace-cards">
      {options.map((option) => {
        const profile = profileLabel(option);
        return (
          <button
            aria-pressed={option.id === selectedId}
            className={`workspace-card${option.id === selectedId ? " is-active" : ""}`}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <strong>{option.title}</strong>
            <span className="workspace-card__meta">
              기출 {option.pastExamCount}회분
              <span className={`workspace-card__profile workspace-card__profile--${profile.tone}`}>{profile.text}</span>
            </span>
            <small>{option.latestWorksheetTitle ? `최근 시험지: ${option.latestWorksheetTitle}` : nextStep(option)}</small>
          </button>
        );
      })}
      <button className="workspace-card workspace-card--add" onClick={onAdd} type="button">
        <Icon name="plus" size={18} tone="accent" />
        <strong>학교 추가</strong>
        <small>학교 + 학년으로 워크스페이스를 만듭니다</small>
      </button>
    </section>
  );
}

export function WorkspacePage() {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [adding, setAdding] = useState(false);

  function reload() {
    setError(null);
    setWorkspace(null);
    setReloadKey((key) => key + 1);
  }

  function selectWorkspace(workspaceId: number) {
    setWorkspaceId(workspaceId);
    reload();
  }

  useEffect(() => {
    let isMounted = true;

    workspaceRepository
      .execute()
      .then((response) => {
        if (!isMounted) return;
        setEmpty(false);
        setWorkspace(response);
      })
      .catch((cause: unknown) => {
        if (!isMounted) return;
        if (cause instanceof NoWorkspaceError) {
          setEmpty(true);
          return;
        }
        setError("워크스페이스 정보를 불러오지 못했습니다.");
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const addModal = adding && (
    <AddWorkspaceModal
      onClose={() => setAdding(false)}
      onCreated={(workspaceId) => {
        setAdding(false);
        selectWorkspace(workspaceId);
      }}
    />
  );

  if (error) {
    return (
      <PageContainer>
        <p className="workspace-page__message">{error}</p>
      </PageContainer>
    );
  }

  if (empty) {
    return (
      <PageContainer>
        <section className="workspace-empty">
          <h1>첫 워크스페이스를 만들어 주세요</h1>
          <p>
            워크스페이스는 학교와 학년 단위입니다(예: 압구정고 1학년). 워크스페이스마다 기출을 올려 출제 프로필을 만들고,
            그 학교 스타일로 문제를 생성합니다.
          </p>
          <Button onClick={() => setAdding(true)} variant="primary">
            <Icon name="plus" size={16} tone="default" />
            학교 추가
          </Button>
        </section>
        {addModal}
      </PageContainer>
    );
  }

  if (!workspace) {
    return (
      <PageContainer>
        <p className="workspace-page__message">워크스페이스를 불러오는 중입니다.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <WorkspaceCards
        onAdd={() => setAdding(true)}
        onSelect={selectWorkspace}
        options={workspace.options}
        selectedId={workspace.id}
      />

      <WorkspaceOverview
        description={workspace.description}
        onPreparationAction={() => navigate("/problem-sets")}
        onPrimaryAction={() => navigate("/problem-sets")}
        preparation={workspace.preparation}
        primaryActionLabel={workspace.primaryActionLabel}
        stats={workspace.stats}
        title={workspace.title}
      />

      <div className="workspace-page__content-grid">
        <div>
          <RecentQuestionSets items={workspace.recentQuestionSets} />
          <ExamInsight insight={workspace.insight} />
        </div>

        <div>
          <TeamActivity items={workspace.teamActivities} />
          <ReviewPrompt prompt={workspace.reviewPrompt} />
        </div>
      </div>
      {addModal}
    </PageContainer>
  );
}
