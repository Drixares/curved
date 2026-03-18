import { AssigneeChip } from '@/features/issues/components/assignee-chip'
import { PriorityChip } from '@/features/issues/components/priority-chip'
import { StatusChip } from '@/features/issues/components/status-chip'
import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import type { Status } from '@/features/issues/hooks/use-team-statuses'
import SidebarCard from '@/shared/components/sidebar-card'

interface IssuePropertiesCardProps {
  statuses: Status[]
  currentStatus: Status | null
  priority: string
  members: TeamMember[]
  currentAssignee: TeamMember | null
  onStatusChange: (statusId: string) => void
  onPriorityChange: (priority: string) => void
  onAssigneeChange: (assigneeId: string | null) => void
}

export default function IssuePropertiesCard({
  statuses,
  currentStatus,
  priority,
  members,
  currentAssignee,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
}: IssuePropertiesCardProps) {
  return (
    <SidebarCard title="Properties">
      <div className="space-y-3">
        <StatusChip statuses={statuses} currentStatus={currentStatus} onSelect={onStatusChange} />
        <PriorityChip priority={priority} onSelect={onPriorityChange} />
        <AssigneeChip
          members={members}
          currentAssignee={currentAssignee}
          onSelect={onAssigneeChange}
        />
      </div>
    </SidebarCard>
  )
}
