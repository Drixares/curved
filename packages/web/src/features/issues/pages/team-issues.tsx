import { EmptyState } from '@/shared/components/empty-state'
import { useTeamIssues } from '@/features/issues/hooks/use-team-issues'
import { useTeamStatuses } from '@/features/issues/hooks/use-team-statuses'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { IssueGroupedList } from '@/features/issues/components/issue-grouped-list'
import { useCreateIssue } from '@/features/issues/stores/create-issue-store'
import { CheckListIcon } from '@hugeicons/core-free-icons'
import { useParams } from 'react-router-dom'

export default function TeamIssues() {
  const { teamIdentifier } = useParams<{ teamIdentifier: string }>()
  const openCreateIssue = useCreateIssue((s) => s.open)

  const { data: teams } = useTeams()
  const team = teams?.find((t) => t.identifier === teamIdentifier)

  const { data: issues, isLoading: issuesLoading } = useTeamIssues(team?.id)
  const { data: statuses, isLoading: statusesLoading } = useTeamStatuses(team?.id ?? null)

  if (issuesLoading || statusesLoading || !teams) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Loading issues...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    )
  }

  return (
    <div>
      {issues && issues.length > 0 && statuses ? (
        <IssueGroupedList issues={issues} statuses={statuses} teamId={team.id} />
      ) : (
        <div className="p-8">
          <EmptyState
            icon={CheckListIcon}
            title="No issues yet"
            description="Create your first issue to start tracking work for this team."
            action={{
              label: 'Create issue',
              shortcut: 'C',
              onClick: () => openCreateIssue(team.id),
            }}
          />
        </div>
      )}
    </div>
  )
}
