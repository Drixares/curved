import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@curved/ui'
import {
  Add01Icon,
  Calendar03Icon,
  CubeIcon,
  Edit02Icon,
  MoreHorizontalIcon,
  StarIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useTeamMembers } from '@/features/issues/hooks/use-team-members'
import { DateSelect } from '@/features/projects/components/date-select'
import { InlineEditableText } from '@/features/projects/components/inline-editable-text'
import { InlineEditableTextarea } from '@/features/projects/components/inline-editable-textarea'
import { LeadSelect } from '@/features/projects/components/lead-select'
import { PrioritySelect } from '@/features/projects/components/priority-select'
import ProjectSidebar from '@/features/projects/components/project-sidebar'
import { StatusSelect } from '@/features/projects/components/status-select'
import {
  projectPriorities,
  projectStatuses,
  projectStatusIcons,
} from '@/features/projects/data/data'
import { useProject } from '@/features/projects/hooks/use-project'
import { useUpdateProjectMutation } from '@/features/projects/hooks/use-update-project'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { PAGES } from '@/shared/constants/pages'
import { formatDate, getInitials } from '@/shared/lib/format'

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading, error } = useProject(projectId)
  const { data: teams } = useTeams()
  const updateMutation = useUpdateProjectMutation()

  const teamId = project?.team?.id ?? null
  const { data: members } = useTeamMembers(teamId)

  const update = useCallback(
    (fields: Record<string, unknown>) => {
      if (!projectId) return
      updateMutation.mutate({ projectId, ...fields })
    },
    [projectId, updateMutation],
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Project not found</p>
        <Link to={PAGES.MY_ASSIGNED} className="text-sm underline">
          Back to issues
        </Link>
      </div>
    )
  }

  const team = teams?.find((t) => t.id === project.team.id)
  const status = projectStatuses.find((s) => s.value === project.status)
  const priority = projectPriorities.find((p) => p.value === project.priority)
  const statusIcon = projectStatusIcons[project.status]

  return (
    <div className="flex h-full flex-col">
      {/* Top bar with breadcrumb and tabs */}
      <header className="border-border shrink-0 border-b">
        <div className="flex items-center gap-1.5 px-5 pt-3 pb-0 text-sm">
          {team && (
            <>
              <Link
                to={PAGES.PROJECTS(project.team.identifier)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={CubeIcon} className="size-4" />
                {team.name}
              </Link>
              <span className="text-muted-foreground">&gt;</span>
            </>
          )}
          <span className="text-muted-foreground flex items-center gap-1.5">
            <HugeiconsIcon icon={CubeIcon} className="size-4" />
            {project.name}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors">
              <HugeiconsIcon icon={StarIcon} className="size-4" />
            </button>
            <button className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors">
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
            </button>
          </div>
        </div>
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="px-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="add" disabled>
              <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Content area */}
      <div className="flex min-h-0 flex-1">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-8">
            {/* Project icon */}
            <div className="bg-muted mb-4 flex size-10 items-center justify-center rounded-lg">
              <HugeiconsIcon icon={CubeIcon} className="text-muted-foreground size-5" />
            </div>

            {/* Editable Title */}
            <div className="mb-1">
              <InlineEditableText
                value={project.name}
                placeholder="Project name"
                onSave={(name) => update({ name })}
                className="text-2xl font-bold tracking-tight"
              />
            </div>

            {/* Editable Summary */}
            <p className="text-muted-foreground/50 mb-6 text-sm">Add a short summary...</p>

            {/* Inline properties */}
            <div className="mb-4 flex items-center gap-1 text-sm">
              <span className="text-muted-foreground mr-1 text-xs">Properties</span>

              <StatusSelect status={project.status} onSelect={(val) => update({ status: val })}>
                <button className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                  {statusIcon && (
                    <HugeiconsIcon
                      icon={statusIcon}
                      className="text-muted-foreground size-3.5"
                      strokeWidth={2}
                    />
                  )}
                  <span>{status?.label ?? project.status}</span>
                </button>
              </StatusSelect>

              <PrioritySelect
                priority={project.priority}
                onSelect={(val) => update({ priority: val })}
              >
                <button className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                  {priority?.icon && (
                    <HugeiconsIcon
                      icon={priority.icon}
                      className="text-muted-foreground size-3.5"
                      strokeWidth={2}
                    />
                  )}
                  <span>{priority?.label ?? 'No priority'}</span>
                </button>
              </PrioritySelect>

              <LeadSelect
                members={members ?? []}
                currentLeadId={project.lead?.id ?? null}
                onSelect={(id) => update({ leadId: id })}
              >
                <button className="hover:bg-muted text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                  {project.lead ? (
                    <>
                      <Avatar className="size-4">
                        {project.lead.image && <AvatarImage src={project.lead.image} />}
                        <AvatarFallback className="text-[8px]">
                          {getInitials(project.lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-foreground">{project.lead.name}</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={UserIcon} className="size-3.5" strokeWidth={2} />
                      <span>Lead</span>
                    </>
                  )}
                </button>
              </LeadSelect>

              <DateSelect
                value={project.targetDate ? new Date(project.targetDate) : undefined}
                onSelect={(date) => update({ targetDate: date ? date.toISOString() : null })}
              >
                <button className="hover:bg-muted text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" strokeWidth={2} />
                  <span>{formatDate(project.targetDate) ?? 'Target date'}</span>
                </button>
              </DateSelect>

              {team && (
                <button className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                  <HugeiconsIcon
                    icon={CubeIcon}
                    className="text-muted-foreground size-3.5"
                    strokeWidth={2}
                  />
                  <span>{team.name}</span>
                </button>
              )}
              <button className="text-muted-foreground hover:bg-muted rounded p-1 transition-colors">
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
              </button>
            </div>

            {/* Resources */}
            <div className="mb-6 flex items-center gap-1 text-sm">
              <span className="text-muted-foreground mr-1 text-xs">Resources</span>
              <button className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
                <span>Add document or link...</span>
              </button>
            </div>

            <Separator className="mb-6" />

            {/* Write first project update */}
            <button className="border-border hover:border-muted-foreground/30 mb-8 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 transition-colors">
              <HugeiconsIcon icon={Edit02Icon} className="text-muted-foreground size-4" />
              <span className="text-muted-foreground text-sm">Write first project update</span>
            </button>

            {/* Editable Description */}
            <div className="mb-8">
              <h2 className="text-muted-foreground mb-4 text-sm font-medium">Description</h2>
              <InlineEditableTextarea
                value={project.description ?? ''}
                placeholder="Add a description..."
                onSave={(description) => update({ description: description || null })}
              />
            </div>

            {/* Add milestone */}
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors">
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              <span>Milestone</span>
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <ProjectSidebar project={project} team={team} members={members ?? []} onUpdate={update} />
      </div>
    </div>
  )
}
