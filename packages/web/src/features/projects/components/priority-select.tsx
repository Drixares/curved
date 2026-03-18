import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import { projectPriorities } from '@/features/projects/data/data'

export function PrioritySelect({
  priority,
  onSelect,
  children,
}: {
  priority: string
  onSelect: (val: string) => void
  children: React.ReactElement
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children} />
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
