import { Button, Kbd } from '@curved/ui'
import { CircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface EmptyStateProps {
  icon: typeof CircleIcon
  title: string
  description: string
  action?: {
    label: string
    shortcut?: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex justify-center py-24">
      <div className="flex flex-col items-start">
        <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-xl">
          <HugeiconsIcon
            icon={icon}
            size={24}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </div>
        <h3 className="text-foreground mb-1 text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-sm text-sm">{description}</p>
        {action && (
          <Button size="sm" onClick={action.onClick}>
            {action.label}
            {action.shortcut && <Kbd>{action.shortcut}</Kbd>}
          </Button>
        )}
      </div>
    </div>
  )
}
