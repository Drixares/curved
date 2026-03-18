import { cn, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@curved/ui'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, type ReactNode } from 'react'

interface SidebarCardProps {
  title: string
  defaultOpen?: boolean
  action?: ReactNode
  children: ReactNode
}

export default function SidebarCard({
  title,
  defaultOpen = true,
  action,
  children,
}: SidebarCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="bg-sidebar border-border rounded-lg border">
        <div className={cn('flex items-center justify-between p-4', open && 'pb-0')}>
          <CollapsibleTrigger className="flex items-center gap-1 outline-none">
            <h3 className="text-sm font-medium">{title}</h3>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              strokeWidth={2}
              className={cn(
                'text-muted-foreground transition-transform duration-200',
                !open && '-rotate-90',
              )}
            />
          </CollapsibleTrigger>
          {action}
        </div>
        <CollapsibleContent>
          <div className="p-4 pt-3">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
