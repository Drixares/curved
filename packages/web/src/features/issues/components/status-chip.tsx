import type { Status } from '@/features/issues/hooks/use-team-statuses'
import { statusTypeIcons } from '@/features/issues/data/data'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function StatusChip({
  statuses,
  currentStatus,
  onSelect,
}: {
  statuses: Status[]
  currentStatus: Status | null
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const icon = currentStatus ? statusTypeIcons[currentStatus.type] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            {icon && <HugeiconsIcon icon={icon} size={14} strokeWidth={2} />}
            <span>{currentStatus?.name ?? 'Status'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-48 p-1">
        {statuses.map((s) => {
          const sIcon = statusTypeIcons[s.type]
          return (
            <button
              key={s.id}
              onClick={() => {
                onSelect(s.id)
                setOpen(false)
              }}
              className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
            >
              {sIcon && <HugeiconsIcon icon={sIcon} size={14} strokeWidth={2} />}
              <span className="flex-1 text-left">{s.name}</span>
              {currentStatus?.id === s.id && (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  size={14}
                  strokeWidth={2}
                  className="text-primary"
                />
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
