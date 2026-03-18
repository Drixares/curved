import { PAGES } from '@/shared/constants/pages'
import { useSidebar } from '@/shared/contexts/sidebar-context'
import { Button, cn } from '@curved/ui'
import {
  ArrowLeft01Icon,
  SecurityLockIcon,
  Settings01Icon,
  UserGroupIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { NavLink, useNavigate } from 'react-router-dom'

const settingsNavItems = [
  { to: PAGES.ROOT, label: 'General', icon: Settings01Icon, end: true },
  { to: PAGES.PROFILE, label: 'Profile', icon: UserIcon },
  { to: PAGES.SECURITY, label: 'Security & access', icon: SecurityLockIcon },
  { to: PAGES.MEMBERS, label: 'Members', icon: UserGroupIcon },
]

export function SettingsSidebar() {
  const navigate = useNavigate()
  const { effectiveWidth, sidebarWidth, minWidth, isResizing } = useSidebar()

  return (
    <aside
      className="shrink-0 overflow-x-hidden overflow-y-auto pt-1.5"
      style={{
        width: effectiveWidth,
        transition: isResizing ? 'none' : 'width 200ms ease',
      }}
    >
      <div className="flex h-full flex-col p-3 px-2" style={{ width: sidebarWidth, minWidth }}>
        <div className="pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground gap-1.5"
            onClick={() => navigate(PAGES.MY_ASSIGNED)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
            Back to app
          </Button>
        </div>

        <nav className="flex flex-col gap-0.5">
          {settingsNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
