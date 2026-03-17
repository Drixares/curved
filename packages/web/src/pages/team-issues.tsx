import { EmptyState } from '@/components/empty-state'
import { useTeamIssues } from '@/hooks/use-team-issues'
import { useTeams } from '@/hooks/use-teams'
import { columns } from '@/issues/components/columns'
import { DataTable } from '@/issues/components/data-table'
import { type Issue } from '@/issues/data/schema'
import { useCreateIssue } from '@/stores/create-issue-store'
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
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Issues</h1>
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
