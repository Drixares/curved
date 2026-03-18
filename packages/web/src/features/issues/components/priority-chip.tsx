import { priorities } from '@/features/issues/data/data'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function PriorityChip({
  priority,
  onSelect,
}: {
  priority: string
  onSelect: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = priorities.find((p) => p.value === priority)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            {current && <HugeiconsIcon icon={current.icon} size={14} strokeWidth={2} />}
            <span>{current?.label ?? 'Priority'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-44 p-1">
        {priorities.map((p) => (
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
