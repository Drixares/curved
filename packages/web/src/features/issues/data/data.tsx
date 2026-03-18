import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  AlertDiamondIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
  CancelCircleIcon,
  HelpCircleIcon,
  MinusSignIcon,
  Timer02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

function Icon({ icon, className }: { icon: typeof CircleIcon; className?: string }) {
  return <HugeiconsIcon icon={icon} strokeWidth={2} className={className} />
}

// Maps status.type from DB to icon
export const statusTypeIcons: Record<string, typeof CircleIcon> = {
  backlog: HelpCircleIcon,
  unstarted: CircleIcon,
  started: Timer02Icon,
  completed: CheckmarkCircle02Icon,
  cancelled: CancelCircleIcon,
}

export const priorities = [
  {
    label: 'None',
    value: 'none',
    icon: MinusSignIcon,
  },
  {
    label: 'Urgent',
    value: 'urgent',
    icon: AlertDiamondIcon,
  },
  {
    label: 'High',
    value: 'high',
    icon: ArrowUp01Icon,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: ArrowRight01Icon,
  },
  {
    label: 'Low',
    value: 'low',
    icon: ArrowDown01Icon,
  },
]

export { Icon }
