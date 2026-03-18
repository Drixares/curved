import { projectStatusIcons } from '@/features/projects/data/data'
import { useTeamProjects, type TeamProject } from '@/features/projects/hooks/use-team-projects'
import { useCreateProject } from '@/features/projects/stores/create-project-store'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { EmptyState } from '@/shared/components/empty-state'
import { CubeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate, useParams } from 'react-router-dom'

const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  planned: 'Planned',
  in_progress: 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function ProjectRow({ project, onClick }: { project: TeamProject; onClick: () => void }) {
  const statusIcon = projectStatusIcons[project.status]

  return (
    <button
      onClick={onClick}
      className="hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
    >
      <div className="text-muted-foreground">
        {statusIcon && <HugeiconsIcon icon={statusIcon} size={16} strokeWidth={2} />}
      </div>
      <span className="flex-1 truncate text-sm font-medium">{project.name}</span>
      <span className="text-muted-foreground text-xs">
        {statusLabels[project.status] ?? project.status}
      </span>
      {project.lead && <span className="text-muted-foreground text-xs">{project.lead.name}</span>}
    </button>
  )
}

export default function TeamProjects() {
  const { teamIdentifier } = useParams<{ teamIdentifier: string }>()
  const navigate = useNavigate()
  const openCreateProject = useCreateProject((s) => s.open)

  const { data: teams } = useTeams()
  const team = teams?.find((t) => t.identifier === teamIdentifier)

  const { data: projects, isLoading } = useTeamProjects(team?.id)

  if (isLoading || !teams) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Loading projects...</p>
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
      {projects && projects.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onClick={() => navigate(`/project/${project.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CubeIcon}
          title="No projects yet"
          description="Create your first project to start organizing work for this team."
          action={{
            label: 'Create project',
            shortcut: 'N P',
            onClick: () => openCreateProject(team.id),
          }}
        />
      )}
    </div>
  )
}
