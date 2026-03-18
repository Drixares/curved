import { statusTypeIcons } from '@/features/issues/data/data'
import { Collapsible, CollapsibleContent, CollapsibleTrigger, cn } from '@curved/ui'
import { Add01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { IssueRow, type IssueRowItem } from './issue-row'

export interface IssueGroupStatus {
  name: string
  type: string
}

interface IssueGroupProps {
  status: IssueGroupStatus
  issues: IssueRowItem[]
  selectedIds: Set<string>
  onToggleSelected: (issueId: string) => void
  onIssueClick: (issue: IssueRowItem) => void
  onAddIssue: () => void
}

export function IssueGroup({
  status,
  issues,
  selectedIds,
  onToggleSelected,
  onIssueClick,
  onAddIssue,
}: IssueGroupProps) {
  const [open, setOpen] = useState(true)
  const icon = statusTypeIcons[status.type]

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      {/* Group header */}
      <div className="border-border hover:bg-muted/50 flex items-center gap-2 border-b px-6 py-1.5 transition-colors">
        <CollapsibleTrigger className="focus-visible:ring-ring flex flex-1 items-center gap-2 rounded-sm outline-none focus-visible:ring-1">
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={2}
            className={cn(
              'text-muted-foreground shrink-0 transition-transform duration-200',
              !open && '-rotate-90',
            )}
          />
          {icon && (
            <HugeiconsIcon
              icon={icon}
              size={16}
              strokeWidth={2}
              className="text-muted-foreground shrink-0"
            />
          )}
          <span className="text-sm font-medium">{status.name}</span>
          <span className="text-muted-foreground text-xs">{issues.length}</span>
        </CollapsibleTrigger>
        <button
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-sm transition-colors outline-none focus-visible:ring-1"
          onClick={onAddIssue}
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
        </button>
      </div>

      <CollapsibleContent>
        {issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            selected={selectedIds.has(issue.id)}
            onToggleSelected={() => onToggleSelected(issue.id)}
            onClick={() => onIssueClick(issue)}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
