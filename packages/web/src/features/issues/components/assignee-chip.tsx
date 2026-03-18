import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function AssigneeChip({
  members,
  currentAssignee,
  onSelect,
}: {
  members: TeamMember[]
  currentAssignee: TeamMember | null
  onSelect: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} />
            <span>{currentAssignee?.name ?? 'Assignee'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-52 p-1">
        <button
          onClick={() => {
            onSelect(null)
            setOpen(false)
          }}
          className="hover:bg-muted text-muted-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          No assignee
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
            {currentAssignee?.id === m.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
