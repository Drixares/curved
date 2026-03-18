import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import type { TeamMember } from '@/features/issues/hooks/use-team-members'

export function LeadSelect({
  members,
  currentLeadId,
  onSelect,
  children,
}: {
  members: TeamMember[]
  currentLeadId: string | null
  onSelect: (id: string | null) => void
  children: React.ReactElement
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children} />
      <PopoverContent align="start" className="w-52 p-1">
        <button
          onClick={() => {
            onSelect(null)
            setOpen(false)
          }}
          className="hover:bg-muted text-muted-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          No lead
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              onSelect(m.id)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <span className="flex-1 text-left">{m.name}</span>
            {currentLeadId === m.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
