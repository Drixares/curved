import { Calendar, Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { useState } from 'react'

export function DateSelect({
  value,
  onSelect,
  children,
}: {
  value: Date | undefined
  onSelect: (date: Date | undefined) => void
  children: React.ReactElement
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children} />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onSelect(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
