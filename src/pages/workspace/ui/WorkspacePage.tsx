import { useEffect, useState } from 'react'

import { workspaceRepository } from '@/entities/workspace/api/repository'
import type { WorkspaceResponse } from '@/entities/workspace/model/types'
import { PageContainer } from '@/shared/ui/PageContainer/PageContainer'
import { ExamInsight } from '@/widgets/exam-insight/ui/ExamInsight'
import { RecentQuestionSets } from '@/widgets/recent-question-sets/ui/RecentQuestionSets'
import { ReviewPrompt } from '@/widgets/review-prompt/ui/ReviewPrompt'
import { TeamActivity } from '@/widgets/team-activity/ui/TeamActivity'
import { WorkspaceOverview } from '@/widgets/workspace-overview/ui/WorkspaceOverview'

import './WorkspacePage.css'

export function WorkspacePage() {
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    workspaceRepository
      .execute()
      .then((response) => {
        if (isMounted) setWorkspace(response)
      })
      .catch(() => {
        if (isMounted) setError('워크스페이스 정보를 불러오지 못했습니다.')
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (error) {
    return <PageContainer><p className="workspace-page__message">{error}</p></PageContainer>
  }

  if (!workspace) {
    return <PageContainer><p className="workspace-page__message">워크스페이스를 불러오는 중입니다.</p></PageContainer>
  }

  return (
    <PageContainer>
      <WorkspaceOverview
        description={workspace.description}
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
    </PageContainer>
  )
}
