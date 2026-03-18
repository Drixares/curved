import { Cancel01Icon, CheckmarkCircle02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

const variants = {
  success: {
    icon: CheckmarkCircle02Icon,
    iconClassName: 'text-emerald-500',
  },
  destructive: {
    icon: Delete02Icon,
    iconClassName: 'text-destructive',
  },
} satisfies Record<string, { icon: IconSvgElement; iconClassName: string }>

type Variant = keyof typeof variants

interface CustomToastProps {
  toastId: string | number
  variant: Variant
  message: string
  description?: ReactNode
  actions?: ReactNode
  icon?: IconSvgElement
  iconClassName?: string
}

export function CustomToast({
  toastId,
  variant,
  message,
  description,
  actions,
  icon,
  iconClassName,
}: CustomToastProps) {
  const config = variants[variant]

  return (
    <div className="bg-sidebar border-border w-90 rounded-lg border p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={icon ?? config.icon}
            size={16}
            strokeWidth={2}
            className={iconClassName ?? config.iconClassName}
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

      {description && <div className="mt-2">{description}</div>}

      {actions && <div className="mt-2">{actions}</div>}
    </div>
  )
}

interface ShowToastOptions {
  variant: Variant
  message: string
  description?: ReactNode
  actions?: ReactNode
  icon?: IconSvgElement
  iconClassName?: string
  duration?: number
}

export function showToast({ duration, ...props }: ShowToastOptions) {
  toast.custom((id) => <CustomToast toastId={id} {...props} />, { duration })
}

export function copyWithToast(copy: (text: string) => void, text: string, message: string) {
  copy(text)
  showToast({ variant: 'success', message })
}
