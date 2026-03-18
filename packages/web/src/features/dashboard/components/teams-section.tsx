import { Button, cn, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@curved/ui'
import { Add01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TeamItem from '@/features/dashboard/components/team-item'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { SETTINGS_PAGES } from '@/shared/constants/pages'

export default function TeamsSection() {
  const navigate = useNavigate()
  const [teamsOpen, setTeamsOpen] = useState(true)
  const { data: teams } = useTeams()

  return (
    <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
      <div className="flex items-center justify-between pl-2">
        <CollapsibleTrigger className="hover:text-sidebar-foreground text-sidebar-foreground/50 flex items-center gap-1 py-1 text-xs font-medium transition-colors outline-none">
          Your teams
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={12}
            strokeWidth={2}
            className={cn('transition-transform duration-200', !teamsOpen && '-rotate-90')}
          />
        </CollapsibleTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground/40 hover:text-sidebar-foreground size-5"
          onClick={() => navigate(SETTINGS_PAGES.NEW_TEAM)}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
        </Button>
      </div>
      <CollapsibleContent>
        <div className="mt-1 flex flex-col gap-2">
          {teams?.map((team) => (
            <TeamItem key={team.id} team={team} />
          ))}
          {teams?.length === 0 && (
            <p className="text-sidebar-foreground/40 px-3 py-1 text-xs">No teams yet</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
