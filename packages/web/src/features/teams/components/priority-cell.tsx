import { projectPriorities } from '@/features/projects/data/data'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

interface PriorityCellProps {
  priority: string
  onSelect: (val: string) => void
}

export function PriorityCell({ priority, onSelect }: PriorityCellProps) {
  const [open, setOpen] = useState(false)
  const current = projectPriorities.find((p) => p.value === priority)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
            {current && <HugeiconsIcon icon={current.icon} size={16} strokeWidth={2} />}
          </button>
        }
      />
      <PopoverContent align="start" className="w-44 p-1">
        {projectPriorities.map((p) => (
          <button
            key={p.value}
            onClick={() => {
              onSelect(p.value)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <HugeiconsIcon icon={p.icon} size={14} strokeWidth={2} />
            <span className="flex-1 text-left">{p.label}</span>
            {priority === p.value && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
