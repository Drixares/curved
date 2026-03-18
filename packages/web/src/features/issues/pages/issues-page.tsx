import { IssueGroup } from '@/features/issues/components/issue-group'
import { useGroupedIssues } from '@/features/issues/hooks/use-grouped-issues'
import { useMyAssignedIssues } from '@/features/issues/hooks/use-my-assigned-issues'
import { useMyCreatedIssues } from '@/features/issues/hooks/use-my-created-issues'
import { ISSUES_PAGES } from '@/shared/constants/pages'
import { cn } from '@curved/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type ViewTab = 'assigned' | 'created'

const VIEW_TABS: { value: ViewTab; label: string }[] = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'created', label: 'Created' },
]

export function IssuesPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('assigned')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const { data: assignedIssues, isLoading: assignedLoading } = useMyAssignedIssues()
  const { data: createdIssues, isLoading: createdLoading } = useMyCreatedIssues()

  const issues = activeTab === 'assigned' ? assignedIssues : createdIssues
  const isLoading = activeTab === 'assigned' ? assignedLoading : createdLoading

  const groups = useGroupedIssues(issues ?? [])

  function toggleSelected(issueId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(issueId)) next.delete(issueId)
      else next.add(issueId)
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Loading issues...</p>
      </div>
    )
  }

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
            onAddIssue={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
