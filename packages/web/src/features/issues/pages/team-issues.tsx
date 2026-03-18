import { EmptyState } from '@/shared/components/empty-state'
import { useTeamIssues } from '@/features/issues/hooks/use-team-issues'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { columns } from '@/features/issues/components/columns'
import { DataTable } from '@/features/issues/components/data-table'
import { type Issue } from '@/features/issues/data/schema'
import { useCreateIssue } from '@/features/issues/stores/create-issue-store'
import { CheckListIcon } from '@hugeicons/core-free-icons'
import { useNavigate, useParams } from 'react-router-dom'

export default function TeamIssues() {
  const { teamIdentifier } = useParams<{ teamIdentifier: string }>()
  const navigate = useNavigate()
  const openCreateIssue = useCreateIssue((s) => s.open)

  const { data: teams } = useTeams()
  const team = teams?.find((t) => t.identifier === teamIdentifier)

  const { data: issues, isLoading } = useTeamIssues(team?.id)

  if (isLoading || !teams) {
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
    <div className="p-8">
      {issues && issues.length > 0 ? (
        <DataTable
          data={issues}
          columns={columns}
          onRowClick={(issue: Issue) => navigate(`/issue/${issue.id}`)}
        />
      ) : (
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
      )}
    </div>
  )
}
