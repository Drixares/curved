import { ConstructionIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface ConstructionStateProps {
  title: string
}

export function ConstructionState({ title }: ConstructionStateProps) {
  return (
    <div className="flex justify-center py-24">
      <div className="flex flex-col items-start">
        <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-xl">
          <HugeiconsIcon
            icon={ConstructionIcon}
            size={24}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </div>
        <h3 className="text-foreground mb-1 text-sm font-medium">{title}</h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          This page is under construction. Check back soon.
        </p>
      </div>
    </div>
  )
}
