import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  CancelCircleIcon,
  HelpCircleIcon,
  Timer02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

function Icon({ icon, className }: { icon: typeof CircleIcon; className?: string }) {
  return <HugeiconsIcon icon={icon} strokeWidth={2} className={className} />
}

export const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'documentation', label: 'Documentation' },
]

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: HelpCircleIcon,
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: CircleIcon,
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: Timer02Icon,
  },
  {
    value: 'done',
    label: 'Done',
    icon: CheckmarkCircle02Icon,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CancelCircleIcon,
  },
]

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: ArrowDown01Icon,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: ArrowRight01Icon,
  },
  {
    label: 'High',
    value: 'high',
    icon: ArrowUp01Icon,
  },
]

export { Icon }
