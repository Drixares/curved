import { useTeamMembers } from '@/features/issues/hooks/use-team-members'
import { useTeamProjects } from '@/features/projects/hooks/use-team-projects'
import { useUpdateProjectMutation } from '@/features/projects/hooks/use-update-project'
import { useCreateProject } from '@/features/projects/stores/create-project-store'
import { ProjectRow } from '@/features/teams/components/project-row'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { EmptyState } from '@/shared/components/empty-state'
import { Button } from '@curved/ui'
import { CubeIcon, FilterIcon, Settings01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { PROJECT_PAGES } from '@/shared/constants/pages'
import { useNavigate, useParams } from 'react-router-dom'

export default function TeamProjects() {
  const { teamIdentifier } = useParams<{ teamIdentifier: string }>()
  const navigate = useNavigate()
  const openCreateProject = useCreateProject((s) => s.open)

  const { data: teams } = useTeams()
  const team = teams?.find((t) => t.identifier === teamIdentifier)

  const { data: projects, isLoading } = useTeamProjects(team?.id)
  const { data: members } = useTeamMembers(team?.id ?? null)
  const updateProject = useUpdateProjectMutation()

  function handleUpdate(projectId: string, field: string, value: string | null) {
    updateProject.mutate({ projectId, [field]: value })
  }

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
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="bg-muted rounded-md px-2.5 py-1 text-sm font-medium">All projects</span>
          <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            + New view
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={FilterIcon} size={16} strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="flex flex-col">
          {/* Table header */}
          <div className="text-muted-foreground flex h-9 items-center text-xs font-medium">
            <div className="flex-1 px-4">Name</div>
            <div className="w-20 text-center">Priority</div>
            <div className="w-20 text-center">Lead</div>
            <div className="w-32 px-2">Target date</div>
            <div className="w-28 pr-4 text-right">Status</div>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                teamName={team.name}
                members={members ?? []}
                onClick={() => navigate(PROJECT_PAGES.DETAIL(project.id))}
                onUpdate={(field, value) => handleUpdate(project.id, field, value)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-8">
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
        </div>
      )}
    </div>
  )
}
