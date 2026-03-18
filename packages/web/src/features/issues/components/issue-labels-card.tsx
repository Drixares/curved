import { LabelsChip } from '@/features/issues/components/labels-chip'
import type { TeamLabel } from '@/features/issues/hooks/use-team-labels'
import SidebarCard from '@/shared/components/sidebar-card'

interface IssueLabelsCardProps {
  labels: TeamLabel[]
  selectedIds: string[]
  onToggle: (labelId: string) => void
}

export default function IssueLabelsCard({ labels, selectedIds, onToggle }: IssueLabelsCardProps) {
  return (
    <SidebarCard title="Labels">
      <LabelsChip labels={labels} selectedIds={selectedIds} onToggle={onToggle} />
    </SidebarCard>
  )
}
