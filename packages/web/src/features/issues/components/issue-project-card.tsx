import { ProjectChip } from '@/features/issues/components/project-chip'
import type { TeamProject } from '@/features/projects/hooks/use-team-projects'
import SidebarCard from '@/shared/components/sidebar-card'

interface IssueProjectCardProps {
  projects: TeamProject[]
  currentProject: TeamProject | null
  teamId: string
  onSelect: (projectId: string | null) => void
}

export default function IssueProjectCard({
  projects,
  currentProject,
  teamId,
  onSelect,
}: IssueProjectCardProps) {
  return (
    <SidebarCard title="Project">
      <ProjectChip
        projects={projects}
        currentProject={currentProject}
        teamId={teamId}
        onSelect={onSelect}
      />
    </SidebarCard>
  )
}
