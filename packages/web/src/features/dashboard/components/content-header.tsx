import { useIssue } from '@/features/issues/hooks/use-issue'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { PAGES } from '@/shared/constants/pages'
import { getInitials } from '@/shared/lib/format'
import { Link, useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  [PAGES.MY_ASSIGNED]: 'My Issues',
}

export function ContentHeader() {
  const { pathname } = useLocation()
  const { data: teams } = useTeams()

  // Issue detail: /issue/:issueId
  const issueMatch = pathname.match(/^\/issue\/([^/]+)/)
  const issueId = issueMatch?.[1]
  const { data: issue } = useIssue(issueId)

  if (issueMatch && issue) {
    const team = teams?.find((t) => t.identifier === issue.team.identifier)
    const identifier = `${issue.team.identifier}-${issue.number}`
    return (
      <header className="border-border flex shrink-0 items-center gap-2 border-b px-5 pt-3.5 pb-2.5">
        {team && (
          <>
            <Link
              to={PAGES.ISSUES(team.identifier)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
            >
              {team.icon ? (
                <span className="text-sm">{team.icon}</span>
              ) : (
                <span className="bg-muted flex size-4 items-center justify-center rounded text-[8px] font-medium">
                  {getInitials(team.name)}
                </span>
              )}
              {team.name}
            </Link>
            <span className="text-muted-foreground text-xs">›</span>
          </>
        )}
        <span className="text-sm font-medium">
          {identifier} {issue.title}
        </span>
      </header>
    )
  }

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
