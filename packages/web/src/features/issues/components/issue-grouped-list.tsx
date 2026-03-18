import { STATUS_TYPE_ORDER } from '@/features/issues/data/data'
import type { Status } from '@/features/issues/hooks/use-team-statuses'
import { useCreateIssue } from '@/features/issues/stores/create-issue-store'
import { ISSUES_PAGES } from '@/shared/constants/pages'
import { cn } from '@curved/ui'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TeamIssue } from '../hooks/use-team-issues'
import { IssueGroup } from './issue-group'

type ViewTab = 'all' | 'active' | 'backlog'

const VIEW_TABS: { value: ViewTab; label: string }[] = [
  { value: 'all', label: 'All issues' },
  { value: 'active', label: 'Active' },
  { value: 'backlog', label: 'Backlog' },
]

interface IssueGroupedListProps {
  issues: TeamIssue[]
  statuses: Status[]
  teamId: string
}

export function IssueGroupedList({ issues, statuses, teamId }: IssueGroupedListProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const openCreateIssue = useCreateIssue((s) => s.open)

  function toggleSelected(issueId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(issueId)) next.delete(issueId)
      else next.add(issueId)
      return next
    })
  }

  const filteredIssues = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return issues.filter((i) => i.status.type === 'started' || i.status.type === 'unstarted')
      case 'backlog':
        return issues.filter((i) => i.status.type === 'backlog')
      default:
        return issues
    }
  }, [issues, activeTab])

  const groups = useMemo(() => {
    const grouped = new Map<string, TeamIssue[]>()
    for (const issue of filteredIssues) {
      const key = issue.status.id
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(issue)
    }

    const statusOrder = statuses
      .filter((s) => grouped.has(s.id))
      .sort(
        (a, b) =>
          (STATUS_TYPE_ORDER[a.type] ?? 99) - (STATUS_TYPE_ORDER[b.type] ?? 99) ||
          a.position - b.position,
      )

    return statusOrder.map((s) => ({
      status: s,
      issues: grouped.get(s.id)!,
    }))
  }, [filteredIssues, statuses])

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 py-3">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'focus-visible:ring-ring rounded-md px-2.5 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-1',
              activeTab === tab.value
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
        <button className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-2 py-1 text-sm transition-colors outline-none focus-visible:ring-1">
          +
        </button>
      </div>

      {/* Grouped issue list */}
      <div className="flex flex-col">
        {groups.map((group) => (
          <IssueGroup
            key={group.status.id}
            status={group.status}
            issues={group.issues}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            onIssueClick={(issue) => navigate(ISSUES_PAGES.DETAIL(issue.id))}
            onAddIssue={() => openCreateIssue(teamId)}
          />
        ))}
      </div>
    </div>
  )
}
