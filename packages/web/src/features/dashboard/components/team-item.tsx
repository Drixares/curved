import { cn, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@curved/ui'
import { ArrowDown01Icon, CheckListIcon, CubeIcon, FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import TeamActionsDropdown from '@/features/dashboard/components/team-actions-dropdown'
import type { Team } from '@/features/teams/hooks/use-teams'
import { TEAM_PAGES } from '@/shared/constants/pages'
import { getInitials } from '@/shared/lib/format'

const teamNavItems = [
  {
    getTo: (identifier: string) => TEAM_PAGES.ISSUES(identifier),
    label: 'Issues',
    icon: CheckListIcon,
  },
  {
    getTo: (identifier: string) => TEAM_PAGES.PROJECTS(identifier),
    label: 'Projects',
    icon: CubeIcon,
  },
  { getTo: (identifier: string) => TEAM_PAGES.VIEWS(identifier), label: 'Views', icon: FilterIcon },
]

interface TeamItemProps {
  team: Team
}

export default function TeamItem({ team }: TeamItemProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="group/team flex items-center gap-0.5">
        <CollapsibleTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pl-2 transition-colors outline-none">
          {team.icon ? (
            <span className="shrink-0 text-sm">{team.icon}</span>
          ) : (
            <span className="bg-sidebar-accent flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium">
              {getInitials(team.name)}
            </span>
          )}
          <span className="truncate text-sm">{team.name}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={12}
            strokeWidth={1.5}
            className={cn(
              'text-sidebar-foreground/40 shrink-0 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
        </CollapsibleTrigger>
        <TeamActionsDropdown team={team} />
      </div>
      <CollapsibleContent>
        <nav className="mt-0.5 flex flex-col gap-0.5 pl-3">
          {teamNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.getTo(team.identifier)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-1 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </CollapsibleContent>
    </Collapsible>
  )
}
