import { useSidebar } from '@/contexts/sidebar-context'
import { authClient } from '@/lib/auth-client'
import { useCommandMenu } from '@/stores/command-menu-store'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@curved/ui'
import {
  ArrowDown01Icon,
  Home09Icon,
  Logout03Icon,
  PencilEdit02Icon,
  Search01Icon,
  Task01Icon,
  Tick01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home09Icon },
  { to: '/tasks', label: 'Tasks', icon: Task01Icon },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function DashboardSidebar() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const { data: organizations } = authClient.useListOrganizations()
  const { data: activeOrg } = authClient.useActiveOrganization()

  const { effectiveWidth, sidebarWidth, minWidth, isResizing } = useSidebar()
  const openCommandMenu = useCommandMenu((s) => s.open)

  if (!session) return null

  const user = session.user
  const initials = getInitials(user.name)

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/sign-in')
  }

  return (
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
          <div className="flex items-center justify-between pb-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:bg-sidebar-accent flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 transition-colors outline-none">
                <Avatar className="size-6 shrink-0">
                  {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sidebar-foreground truncate text-sm">{user.name}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  strokeWidth={2}
                  className="text-sidebar-foreground/50"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" sideOffset={6} className="w-56">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                  <DropdownMenuShortcut>G then S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (activeOrg?.id) navigate(`/organizations/${activeOrg.id}/members`)
                  }}
                >
                  <HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={1.5} />
                  Invite and manage members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Switch workspace</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent sideOffset={6} className="min-w-52">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                        {user.email}
                      </DropdownMenuLabel>
                      {organizations?.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() =>
                            authClient.organization.setActive({
                              organizationId: org.id,
                            })
                          }
                          className="flex items-center gap-2"
                        >
                          <Avatar className="size-5 rounded-md">
                            {org.logo ? <AvatarImage src={org.logo} alt={org.name} /> : null}
                            <AvatarFallback className="rounded-md text-[9px]">
                              {getInitials(org.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1">{org.name}</span>
                          {activeOrg?.id === org.id && (
                            <HugeiconsIcon
                              icon={Tick01Icon}
                              size={14}
                              strokeWidth={2}
                              className="text-primary"
                            />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={handleSignOut}>
                  <HugeiconsIcon icon={Logout03Icon} size={16} strokeWidth={1.5} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground size-7"
                onClick={() => openCommandMenu()}
              >
                <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground size-7"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
              </Button>
            </div>
          </div>

          <nav className="mt-1 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
      </div>
    </aside>
  )
}
