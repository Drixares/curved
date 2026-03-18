import type { Team } from '@/features/teams/hooks/use-teams'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { ArrowDown01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function TeamSelector({
  teams,
  currentTeam,
  onSelect,
}: {
  teams: Team[]
  currentTeam: Team | null
  onSelect: (teamId: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="hover:bg-muted flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors">
            {currentTeam?.icon && <span className="text-xs">{currentTeam.icon}</span>}
            <span className="font-medium">{currentTeam?.identifier ?? 'Team'}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={12}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          </button>
        }
      />
      <PopoverContent align="start" className="w-48 gap-0 p-1">
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onSelect(t.id)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            {t.icon ? (
              <span className="text-xs">{t.icon}</span>
            ) : (
              <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium">
                {t.name.charAt(0)}
              </span>
            )}
            <span className="flex-1 text-left">{t.name}</span>
            {currentTeam?.id === t.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
