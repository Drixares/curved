import { useParams, Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Calendar03Icon,
  CubeIcon,
  Edit02Icon,
  MoreHorizontalIcon,
  StarIcon,
  UserAdd01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@curved/ui'

import { useProject } from '@/features/projects/hooks/use-project'
import {
  projectStatuses,
  projectPriorities,
  projectStatusIcons,
} from '@/features/projects/data/data'
import { useTeams } from '@/features/teams/hooks/use-teams'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatActivityDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading, error } = useProject(projectId)
  const { data: teams } = useTeams()

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
        <Link to="/dashboard" className="text-sm underline">
          Back to dashboard
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
                to={`/team/${project.team.identifier}/projects`}
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

            {/* Title */}
            <h1 className="mb-1 text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground/50 mb-6 text-sm">Add a short summary...</p>

            {/* Inline properties */}
            <div className="mb-4 flex items-center gap-1 text-sm">
              <span className="text-muted-foreground mr-1 text-xs">Properties</span>
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
              <button className="hover:bg-muted text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                <HugeiconsIcon icon={UserIcon} className="size-3.5" strokeWidth={2} />
                <span>Lead</span>
              </button>
              <button className="hover:bg-muted text-muted-foreground flex items-center gap-1.5 rounded px-2 py-1 transition-colors">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" strokeWidth={2} />
                <span>Target date</span>
              </button>
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

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-muted-foreground mb-4 text-sm font-medium">Description</h2>
              {project.description ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              ) : (
                <p className="text-muted-foreground/50 text-sm italic">No description</p>
              )}
            </div>

            {/* Add milestone */}
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors">
              <HugeiconsIcon icon={Add01Icon} className="size-4" />
              <span>Milestone</span>
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="border-border w-[300px] shrink-0 overflow-y-auto border-l">
          {/* Properties section */}
          <div className="border-border border-b p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Properties</h3>
              <button className="text-muted-foreground hover:text-foreground">
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Status</span>
                <button className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
                  {statusIcon && (
                    <HugeiconsIcon
                      icon={statusIcon}
                      className="text-muted-foreground size-3.5"
                      strokeWidth={2}
                    />
                  )}
                  {status?.label ?? project.status}
                </button>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Priority</span>
                <button className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
                  {priority?.icon && (
                    <HugeiconsIcon
                      icon={priority.icon}
                      className="text-muted-foreground size-3.5"
                      strokeWidth={2}
                    />
                  )}
                  {priority?.label ?? 'No priority'}
                </button>
              </div>

              {/* Lead */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Lead</span>
                {project.lead ? (
                  <button className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
                    <Avatar className="size-4">
                      {project.lead.image && <AvatarImage src={project.lead.image} />}
                      <AvatarFallback className="text-[8px]">
                        {getInitials(project.lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    {project.lead.name}
                  </button>
                ) : (
                  <button className="text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
                    <HugeiconsIcon icon={UserIcon} className="size-3.5" />
                    Add lead
                  </button>
                )}
              </div>

              {/* Members */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Members</span>
                <button className="text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
                  <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5" />
                  Add members
                </button>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Dates</span>
                <div className="flex items-center gap-1.5 text-sm">
                  <button className="text-muted-foreground hover:bg-muted flex items-center gap-1 rounded px-2 py-0.5 transition-colors">
                    <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                    {formatDate(project.startDate) ?? 'Start'}
                  </button>
                  <span className="text-muted-foreground">&rarr;</span>
                  <button className="text-muted-foreground hover:bg-muted flex items-center gap-1 rounded px-2 py-0.5 transition-colors">
                    <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                    {formatDate(project.targetDate) ?? 'Target'}
                  </button>
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Teams</span>
                {team && (
                  <Link
                    to={`/team/${project.team.identifier}/projects`}
                    className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors"
                  >
                    <HugeiconsIcon icon={CubeIcon} className="text-muted-foreground size-3.5" />
                    {team.name}
                  </Link>
                )}
              </div>

              {/* Labels */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Labels</span>
                <button className="text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
                  <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
                  Add label
                </button>
              </div>
            </div>
          </div>

          {/* Milestones section */}
          <div className="border-border border-b p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Milestones</h3>
              <button className="text-muted-foreground hover:text-foreground">
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
              </button>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Add milestones to organize work within your project and break it into more granular
              stages.
            </p>
          </div>

          {/* Activity section */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Activity</h3>
              <button className="text-muted-foreground hover:text-foreground text-xs">
                See all
              </button>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-muted mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                <HugeiconsIcon icon={CubeIcon} className="text-muted-foreground size-3" />
              </div>
              <p className="text-muted-foreground text-xs">
                {project.lead ? (
                  <span className="text-foreground font-medium">{project.lead.name}</span>
                ) : (
                  <span className="text-foreground font-medium">Someone</span>
                )}{' '}
                created the project &middot; {formatActivityDate(project.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
