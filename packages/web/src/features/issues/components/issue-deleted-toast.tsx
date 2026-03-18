import { Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

interface IssueDeletedToastProps {
  toastId: string | number
  issueKey: string
  title: string
}

export function IssueDeletedToast({ toastId, issueKey, title }: IssueDeletedToastProps) {
  return (
    <div className="bg-sidebar border-border w-90 rounded-lg border p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Delete02Icon}
            size={16}
            strokeWidth={2}
            className="text-destructive"
          />
          <span className="text-sm font-medium">Issue deleted</span>
        </div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">{issueKey}</span>
        <span className="text-muted-foreground text-sm">—</span>
        <span className="truncate text-sm">{title}</span>
      </div>
    </div>
  )
}
