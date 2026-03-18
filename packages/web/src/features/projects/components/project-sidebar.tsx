import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import ProjectActivityCard from '@/features/projects/components/project-activity-card'
import ProjectMilestonesCard from '@/features/projects/components/project-milestones-card'
import ProjectPropertiesCard from '@/features/projects/components/project-properties-card'

interface ProjectSidebarProps {
  project: {
    status: string
    priority: string
    lead: { id: string; name: string; image: string | null } | null
    startDate: string | null
    targetDate: string | null
    team: { id: string; identifier: string }
    createdAt: string
  }
  team: { id: string; name: string; identifier: string } | undefined
  members: TeamMember[]
  onUpdate: (fields: Record<string, unknown>) => void
}

export default function ProjectSidebar({ project, team, members, onUpdate }: ProjectSidebarProps) {
  return (
    <div className="w-75 shrink-0 space-y-3 overflow-y-auto p-3">
      <ProjectPropertiesCard project={project} team={team} members={members} onUpdate={onUpdate} />
      <ProjectMilestonesCard />
      <ProjectActivityCard lead={project.lead} createdAt={project.createdAt} />
    </div>
  )
}
