import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  Calendar03Icon,
  CubeIcon,
  UserAdd01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { Avatar, AvatarFallback, AvatarImage } from '@curved/ui'

import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import {
  projectStatuses,
  projectPriorities,
  projectStatusIcons,
} from '@/features/projects/data/data'
import { StatusSelect } from '@/features/projects/components/status-select'
import { PrioritySelect } from '@/features/projects/components/priority-select'
import { LeadSelect } from '@/features/projects/components/lead-select'
import { DateSelect } from '@/features/projects/components/date-select'
import { getInitials, formatDate, formatActivityDate } from '@/shared/lib/format'

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
  const status = projectStatuses.find((s) => s.value === project.status)
  const priority = projectPriorities.find((p) => p.value === project.priority)
  const statusIcon = projectStatusIcons[project.status]

  return (
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
            <StatusSelect status={project.status} onSelect={(val) => onUpdate({ status: val })}>
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
            </StatusSelect>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Priority</span>
            <PrioritySelect
              priority={project.priority}
              onSelect={(val) => onUpdate({ priority: val })}
            >
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
            </PrioritySelect>
          </div>

          {/* Lead */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Lead</span>
            <LeadSelect
              members={members}
              currentLeadId={project.lead?.id ?? null}
              onSelect={(id) => onUpdate({ leadId: id })}
            >
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
            </LeadSelect>
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
              <DateSelect
                value={project.startDate ? new Date(project.startDate) : undefined}
                onSelect={(date) => onUpdate({ startDate: date ? date.toISOString() : null })}
              >
                <button className="text-muted-foreground hover:bg-muted flex items-center gap-1 rounded px-2 py-0.5 transition-colors">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                  {formatDate(project.startDate) ?? 'Start'}
                </button>
              </DateSelect>
              <span className="text-muted-foreground">&rarr;</span>
              <DateSelect
                value={project.targetDate ? new Date(project.targetDate) : undefined}
                onSelect={(date) => onUpdate({ targetDate: date ? date.toISOString() : null })}
              >
                <button className="text-muted-foreground hover:bg-muted flex items-center gap-1 rounded px-2 py-0.5 transition-colors">
                  <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                  {formatDate(project.targetDate) ?? 'Target'}
                </button>
              </DateSelect>
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
          <button className="text-muted-foreground hover:text-foreground text-xs">See all</button>
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
  )
}
