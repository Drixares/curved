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
  PauseIcon,
  Timer02Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons'

export const projectStatuses = [
  { label: 'Backlog', value: 'backlog', icon: HelpCircleIcon },
  { label: 'Planned', value: 'planned', icon: Calendar03Icon },
  { label: 'In Progress', value: 'in_progress', icon: Timer02Icon },
  { label: 'Paused', value: 'paused', icon: PauseIcon },
  { label: 'Completed', value: 'completed', icon: CheckmarkCircle02Icon },
  { label: 'Cancelled', value: 'cancelled', icon: CancelCircleIcon },
]

export const projectStatusIcons: Record<string, typeof CircleIcon> = {
  backlog: HelpCircleIcon,
  planned: Calendar03Icon,
  in_progress: Timer02Icon,
  paused: PauseIcon,
  completed: CheckmarkCircle02Icon,
  cancelled: CancelCircleIcon,
}

export const projectPriorities = [
  { label: 'None', value: 'none', icon: MinusSignIcon },
  { label: 'Urgent', value: 'urgent', icon: AlertDiamondIcon },
  { label: 'High', value: 'high', icon: ArrowUp01Icon },
  { label: 'Medium', value: 'medium', icon: ArrowRight01Icon },
  { label: 'Low', value: 'low', icon: ArrowDown01Icon },
]
