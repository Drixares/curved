import { useLocation } from 'react-router-dom'
import { useTeams } from '@/features/teams/hooks/use-teams'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/my-issues/assigned': 'My Issues',
}

export function ContentHeader() {
  const { pathname } = useLocation()
  const { data: teams } = useTeams()

  // Team pages: /team/:identifier/*
  const teamMatch = pathname.match(/^\/team\/([^/]+)/)
  if (teamMatch) {
    const identifier = teamMatch[1]
    const team = teams?.find((t) => t.identifier === identifier)
    if (team) {
      return (
        <header className="border-border flex shrink-0 items-center gap-2 border-b px-5 pt-3.5 pb-2.5">
          {team.icon ? (
            <span className="text-base">{team.icon}</span>
          ) : (
            <span className="bg-muted flex size-5 items-center justify-center rounded text-[10px] font-medium">
              {getInitials(team.name)}
            </span>
          )}
          <h1 className="text-sm font-medium">{team.name}</h1>
        </header>
      )
    }
  }

  // Regular pages
  const title = pageTitles[pathname]
  if (!title) return null

  return (
    <header className="border-border shrink-0 border-b px-5 pt-3.5 pb-2.5">
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  )
}
