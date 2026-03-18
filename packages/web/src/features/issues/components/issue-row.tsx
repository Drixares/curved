import { statusTypeIcons } from '@/features/issues/data/data'
import { getInitials } from '@/shared/lib/format'
import { formatDate } from '@/shared/lib/format'
import { Avatar, AvatarFallback, AvatarImage, Badge, Checkbox, cn } from '@curved/ui'
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export interface IssueRowItem {
  id: string
  number: number
  title: string
  status: { type: string }
  team: { identifier: string }
  assignee: { name: string; image: string | null } | null
  labels: { id: string; name: string; color: string | null }[]
  createdAt: string
}

interface IssueRowProps {
  issue: IssueRowItem
  selected: boolean
  onToggleSelected: () => void
  onClick: () => void
}

export function IssueRow({ issue, selected, onToggleSelected, onClick }: IssueRowProps) {
  const icon = statusTypeIcons[issue.status.type]

  return (
    <div
      tabIndex={0}
      className={cn(
        'border-border group flex cursor-pointer items-center gap-2.5 border-b px-6 py-1.5 transition-colors outline-none',
        selected ? 'bg-muted/50' : 'hover:bg-muted/50 focus-visible:bg-muted/50',
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('input, button, [role="checkbox"]')) return
        onClick()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick()
        if (e.key === ' ') {
          e.preventDefault()
          onToggleSelected()
        }
      }}
    >
      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggleSelected()}
        tabIndex={-1}
        className={cn(
          'shrink-0 transition-opacity',
          selected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
        aria-label={`Select ${issue.title}`}
      />

      {/* More actions */}
      <button
        tabIndex={-1}
        className={cn(
          'text-muted-foreground hover:text-foreground shrink-0 transition-opacity',
          selected
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={2} />
      </button>

      {/* Identifier */}
      <span className="text-muted-foreground shrink-0 text-xs">
        {issue.team.identifier}-{issue.number}
      </span>

      {/* Status icon */}
      {icon && (
        <HugeiconsIcon
          icon={icon}
          size={16}
          strokeWidth={2}
          className="text-muted-foreground shrink-0"
        />
      )}

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm">{issue.title}</span>

      {/* Right side: labels, assignee, date */}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {issue.labels.length > 0 && (
          <div className="flex items-center gap-1">
            {issue.labels.map((label) => (
              <Badge key={label.id} variant="outline" className="text-xs">
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {issue.assignee && (
          <Avatar size="sm">
            {issue.assignee.image && <AvatarImage src={issue.assignee.image} />}
            <AvatarFallback className="text-[10px]">
              {getInitials(issue.assignee.name)}
            </AvatarFallback>
          </Avatar>
        )}

        <span className="text-muted-foreground text-xs">{formatDate(issue.createdAt)}</span>
      </div>
    </div>
  )
}
