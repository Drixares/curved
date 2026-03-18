import IssueLabelsCard from '@/features/issues/components/issue-labels-card'
import IssueProjectCard from '@/features/issues/components/issue-project-card'
import IssuePropertiesCard from '@/features/issues/components/issue-properties-card'
import IssueSidebarActions from '@/features/issues/components/issue-sidebar-actions'
import type { TeamLabel } from '@/features/issues/hooks/use-team-labels'
import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import type { Status } from '@/features/issues/hooks/use-team-statuses'
import type { TeamProject } from '@/features/projects/hooks/use-team-projects'

interface IssueSidebarProps {
  identifier: string
  statuses: Status[]
  currentStatus: Status | null
  priority: string
  members: TeamMember[]
  currentAssignee: TeamMember | null
  labels: TeamLabel[]
  selectedLabelIds: string[]
  projects: TeamProject[]
  currentProject: TeamProject | null
  teamId: string
  onUpdate: (fields: Record<string, unknown>) => void
}

export default function IssueSidebar({
  identifier,
  statuses,
  currentStatus,
  priority,
  members,
  currentAssignee,
  labels,
  selectedLabelIds,
  projects,
  currentProject,
  teamId,
  onUpdate,
}: IssueSidebarProps) {
  return (
    <div className="w-75 overflow-y-auto p-3">
      <IssueSidebarActions identifier={identifier} />

      <div className="space-y-3">
        <IssuePropertiesCard
          statuses={statuses}
          currentStatus={currentStatus}
          priority={priority}
          members={members}
          currentAssignee={currentAssignee}
          onStatusChange={(statusId) => onUpdate({ statusId })}
          onPriorityChange={(p) => onUpdate({ priority: p })}
          onAssigneeChange={(assigneeId) => onUpdate({ assigneeId })}
        />

        <IssueLabelsCard
          labels={labels}
          selectedIds={selectedLabelIds}
          onToggle={(labelId) => {
            const newIds = selectedLabelIds.includes(labelId)
              ? selectedLabelIds.filter((id) => id !== labelId)
              : [...selectedLabelIds, labelId]
            onUpdate({ labelIds: newIds })
          }}
        />

        <IssueProjectCard
          projects={projects}
          currentProject={currentProject}
          teamId={teamId}
          onSelect={(projectId) => onUpdate({ projectId })}
        />
      </div>
    </div>
  )
}
