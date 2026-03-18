import { projectStatuses } from '@/features/projects/data/data'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function ProjectStatusChip({
  status,
  onSelect,
}: {
  status: string
  onSelect: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = projectStatuses.find((s) => s.value === status)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            {current && <HugeiconsIcon icon={current.icon} size={14} strokeWidth={2} />}
            <span>{current?.label ?? 'Status'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-48 p-1">
        {projectStatuses.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              onSelect(s.value)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <HugeiconsIcon icon={s.icon} size={14} strokeWidth={2} />
            <span className="flex-1 text-left">{s.label}</span>
            {status === s.value && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
