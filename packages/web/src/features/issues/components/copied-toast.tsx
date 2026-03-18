import { Cancel01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'

function CopiedToast({ toastId, message }: { toastId: string | number; message: string }) {
  return (
    <div className="bg-sidebar border-border w-90 rounded-lg border p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            strokeWidth={2}
            className="text-emerald-500"
          />
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export function copyWithToast(copy: (text: string) => void, text: string, message: string) {
  copy(text)
  toast.custom((id) => <CopiedToast toastId={id} message={message} />)
}
