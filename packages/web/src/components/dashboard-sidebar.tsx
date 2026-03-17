import { useSidebar } from '@/contexts/sidebar-context'
import { useTeams, type Team } from '@/hooks/use-teams'
import { authClient } from '@/lib/auth-client'
import { useCommandMenu } from '@/stores/command-menu-store'
import { useCreateIssue } from '@/stores/create-issue-store'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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
  Add01Icon,
  ArrowDown01Icon,
  CheckListIcon,
  CopyLinkIcon,
  CubeIcon,
  FilterIcon,
  Home09Icon,
  Logout03Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Search01Icon,
  Settings01Icon,
  Task01Icon,
  Tick01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home09Icon },
  { to: '/my-issues/assigned', label: 'My issues', icon: Task01Icon },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const teamNavItems = [
  { suffix: '/issues', label: 'Issues', icon: CheckListIcon },
  { suffix: '/projects', label: 'Projects', icon: CubeIcon },
  { suffix: '/views', label: 'Views', icon: FilterIcon },
]

function TeamItem({ team }: { team: Team }) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="group/team flex items-center gap-0.5">
        <CollapsibleTrigger className="text-sidebar-foreground/70 hover:text-sidebar-foreground flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 pl-2 transition-colors outline-none">
          {team.icon ? (
            <span className="shrink-0 text-sm">{team.icon}</span>
          ) : (
            <span className="bg-sidebar-accent flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium">
              {getInitials(team.name)}
            </span>
          )}
          <span className="truncate text-sm">{team.name}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={12}
            strokeWidth={1.5}
            className={cn(
              'text-sidebar-foreground/40 shrink-0 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
        </CollapsibleTrigger>
        <TeamActionsDropdown team={team} />
      </div>
      <CollapsibleContent>
        <nav className="mt-0.5 flex flex-col gap-0.5 pl-3">
          {teamNavItems.map((item) => (
            <NavLink
              key={item.suffix}
              to={`/team/${team.identifier}${item.suffix}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-1 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </CollapsibleContent>
    </Collapsible>
  )
}

function TeamActionsDropdown({ team }: { team: Team }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground size-6 shrink-0 opacity-0 transition-opacity group-hover/team:opacity-100 data-[popup-open]:opacity-100"
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={4} className="w-48">
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/team/${team.identifier}`)
          }}
        >
          <HugeiconsIcon icon={CopyLinkIcon} size={16} strokeWidth={1.5} />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/team/${team.identifier}/settings`)}>
          <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
          Team settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TeamsSection() {
  const navigate = useNavigate()
  const [teamsOpen, setTeamsOpen] = useState(true)
  const { data: teams } = useTeams()

  return (
    <Collapsible open={teamsOpen} onOpenChange={setTeamsOpen}>
      <div className="flex items-center justify-between pl-2">
        <CollapsibleTrigger className="hover:text-sidebar-foreground text-sidebar-foreground/50 flex items-center gap-1 py-1 text-xs font-medium transition-colors outline-none">
          Your teams
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={12}
            strokeWidth={2}
            className={cn('transition-transform duration-200', !teamsOpen && '-rotate-90')}
          />
        </CollapsibleTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground size-5"
              />
            }
          >
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={4} className="w-48">
            <DropdownMenuItem onClick={() => navigate('/teams/create')}>
              Create team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CollapsibleContent>
        <div className="mt-1 flex flex-col gap-2">
          {teams?.map((team) => (
            <TeamItem key={team.id} team={team} />
          ))}
          {teams?.length === 0 && (
            <p className="text-sidebar-foreground/40 px-3 py-1 text-xs">No teams yet</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function DashboardSidebar() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const { data: organizations } = authClient.useListOrganizations()
  const { data: activeOrg } = authClient.useActiveOrganization()

  const { effectiveWidth, sidebarWidth, minWidth, isResizing } = useSidebar()
  const openCommandMenu = useCommandMenu((s) => s.open)
  const openCreateIssue = useCreateIssue((s) => s.open)

  if (!session) return null

  const user = session.user
  const initials = getInitials(user.name)

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/sign-in')
  }

  return (
    <aside
      className="shrink-0 overflow-x-hidden overflow-y-auto pt-1.5"
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
                <DropdownMenuItem onClick={() => navigate('/settings/members')}>
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
                onClick={() => openCreateIssue()}
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

          <div className="mt-4">
            <TeamsSection />
          </div>
        </div>
      </div>
    </aside>
  )
}
