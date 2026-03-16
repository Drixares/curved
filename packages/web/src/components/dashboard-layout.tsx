import { useResizableSidebar } from '@/hooks/use-resizable-sidebar'
import { authClient } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage, Button } from '@curved/ui'
import { Home09Icon, Logout03Icon, Settings01Icon, Task01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home09Icon },
  { to: '/tasks', label: 'Tasks', icon: Task01Icon },
  { to: '/settings', label: 'Settings', icon: Settings01Icon },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const { effectiveWidth, sidebarWidth, minWidth, isResizing, handleMouseDown, handleClick } =
    useResizableSidebar()

  if (!session) return null

  const user = session.user
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/sign-in')
  }

  return (
    <div className="bg-sidebar flex h-screen">
      <aside
        className="shrink-0 overflow-x-hidden overflow-y-auto"
        style={{
          width: effectiveWidth,
          transition: isResizing ? 'none' : 'width 200ms ease',
        }}
      >
        <div
          className="flex h-full flex-col justify-between p-3 px-2"
          style={{ width: sidebarWidth, minWidth }}
        >
          <div>
            <div className="px-3 py-4">
              <span className="text-sidebar-foreground text-lg font-semibold">Curved</span>
            </div>

            <nav className="mt-2 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }`
                  }
                >
                  <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-2 pb-1">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar className="size-8">
                {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sidebar-foreground truncate text-sm font-medium">{user.name}</p>
                <p className="text-sidebar-foreground/50 truncate text-xs">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground justify-start gap-3 px-3"
            >
              <HugeiconsIcon icon={Logout03Icon} size={18} strokeWidth={1.5} />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div
        className="group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-end"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className="group-hover:bg-primary/40 h-full max-h-[100%-2rem] w-0.5 rounded-full transition-colors" />
      </div>

      <main className="bg-background border-border m-2 ml-0 min-h-0 flex-1 overflow-auto rounded-lg border">
        <Outlet />
      </main>
    </div>
  )
}
