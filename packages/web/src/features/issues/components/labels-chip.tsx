import type { TeamLabel } from '@/features/issues/hooks/use-team-labels'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { TagsIcon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function LabelsChip({
  labels,
  selectedIds,
  onToggle,
}: {
  labels: TeamLabel[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const count = selectedIds.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            <HugeiconsIcon icon={TagsIcon} size={14} strokeWidth={2} />
            <span>{count > 0 ? `${count} label${count > 1 ? 's' : ''}` : 'Labels'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-52 p-1">
        {labels.length === 0 && (
          <p className="text-muted-foreground px-2 py-1.5 text-sm">No labels</p>
        )}
        {labels.map((l) => (
          <button
            key={l.id}
            onClick={() => onToggle(l.id)}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="flex-1 text-left">{l.name}</span>
            {selectedIds.includes(l.id) && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
