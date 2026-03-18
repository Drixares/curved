import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { TEAM_PAGES } from '@/shared/constants/pages'
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
import { getInitials, formatDate } from '@/shared/lib/format'
import SidebarCard from '@/shared/components/sidebar-card'

interface ProjectPropertiesCardProps {
  project: {
    status: string
    priority: string
    lead: { id: string; name: string; image: string | null } | null
    startDate: string | null
    targetDate: string | null
    team: { id: string; identifier: string }
  }
  team: { id: string; name: string; identifier: string } | undefined
  members: TeamMember[]
  onUpdate: (fields: Record<string, unknown>) => void
}

export default function ProjectPropertiesCard({
  project,
  team,
  members,
  onUpdate,
}: ProjectPropertiesCardProps) {
  const status = projectStatuses.find((s) => s.value === project.status)
  const priority = projectPriorities.find((p) => p.value === project.priority)
  const statusIcon = projectStatusIcons[project.status]

  return (
    <SidebarCard
      title="Properties"
      action={
        <button className="text-muted-foreground hover:text-foreground">
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
        </button>
      }
    >
      <div className="space-y-3">
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

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Members</span>
          <button className="text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
            <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5" />
            Add members
          </button>
        </div>

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

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Teams</span>
          {team && (
            <Link
              to={TEAM_PAGES.PROJECTS(project.team.identifier)}
              className="hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors"
            >
              <HugeiconsIcon icon={CubeIcon} className="text-muted-foreground size-3.5" />
              {team.name}
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Labels</span>
          <button className="text-muted-foreground hover:bg-muted flex items-center gap-1.5 rounded px-2 py-0.5 text-sm transition-colors">
            <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
            Add label
          </button>
        </div>
      </div>
    </SidebarCard>
  )
}
