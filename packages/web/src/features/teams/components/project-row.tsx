import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import { projectStatusIcons } from '@/features/projects/data/data'
import type { TeamProject } from '@/features/projects/hooks/use-team-projects'
import { formatDateWithYear } from '@/shared/lib/format'
import { HugeiconsIcon } from '@hugeicons/react'
import { LeadCell } from './lead-cell'
import { PriorityCell } from './priority-cell'
import { StatusCell } from './status-cell'

interface ProjectRowProps {
  project: TeamProject
  teamName: string
  members: TeamMember[]
  onClick: () => void
  onUpdate: (field: string, value: string | null) => void
}

export function ProjectRow({ project, teamName, members, onClick, onUpdate }: ProjectRowProps) {
  const statusIcon = projectStatusIcons[project.status]

  return (
    <div className="hover:bg-muted/50 group [&:not(:last-child)]:border-b-border/40 flex h-11 items-center border-b border-transparent transition-colors last:border-b-0">
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 px-4 text-left">
        <span className="text-muted-foreground shrink-0">
          {statusIcon && <HugeiconsIcon icon={statusIcon} size={16} strokeWidth={2} />}
        </span>
        <span className="truncate text-sm font-medium">{project.name}</span>
      </button>

      <div className="flex w-20 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <PriorityCell priority={project.priority} onSelect={(val) => onUpdate('priority', val)} />
      </div>

      <div className="flex w-20 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <LeadCell
          lead={project.lead}
          teamName={teamName}
          members={members}
          onSelect={(id) => onUpdate('leadId', id)}
        />
      </div>

      <div className="text-muted-foreground flex w-32 items-center px-2 text-sm">
        {project.targetDate ? (
          <span className="truncate">{formatDateWithYear(project.targetDate)}</span>
        ) : (
          <span className="opacity-0 group-hover:opacity-50">No date</span>
        )}
      </div>

      <div className="flex w-28 items-center justify-end pr-4" onClick={(e) => e.stopPropagation()}>
        <StatusCell status={project.status} onSelect={(val) => onUpdate('status', val)} />
      </div>
    </div>
  )
}
