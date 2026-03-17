import { useParams, Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, Link01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { Avatar, AvatarImage, AvatarFallback, Badge, Button, Separator } from '@curved/ui'

import { useIssue } from '@/hooks/use-issue'
import { statusTypeIcons, priorities } from '@/issues/data/data'

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function IssueDetail() {
  const { issueId } = useParams<{ issueId: string }>()
  const { data: issue, isLoading, error } = useIssue(issueId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading issue...</p>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Issue not found</p>
        <Link to="/my-issues/assigned" className="text-sm underline">
          Back to issues
        </Link>
      </div>
    )
  }

  const identifier = `${issue.team.identifier}-${issue.number}`
  const statusIcon = statusTypeIcons[issue.status.type]
  const priority = priorities.find((p) => p.value === issue.priority)

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex h-full">
      {/* Left: main content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            to="/my-issues/assigned"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            My Issues
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{identifier}</span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">{issue.title}</h1>

        {/* Description */}
        {issue.description ? (
          <p className="text-muted-foreground mb-8 whitespace-pre-wrap">{issue.description}</p>
        ) : (
          <p className="text-muted-foreground/50 mb-8 italic">No description</p>
        )}

        <Separator className="mb-6" />

        {/* Activity */}
        <div className="mb-6">
          <h2 className="mb-4 text-sm font-medium">Activity</h2>
          <div className="flex items-start gap-3">
            {issue.creator && (
              <Avatar className="size-6">
                {issue.creator.image && <AvatarImage src={issue.creator.image} />}
                <AvatarFallback className="text-[10px]">
                  {getInitials(issue.creator.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">{issue.creator.name}</span> created this
              issue {formatRelativeTime(issue.createdAt)}
            </p>
          </div>
        </div>

        {/* Comment box placeholder */}
        <div className="mt-6">
          <textarea
            placeholder="Leave a comment..."
            className="border-input bg-background placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
            disabled
          />
        </div>
      </div>

      {/* Right: properties sidebar */}
      <div className="w-[300px] overflow-y-auto border-l">
        {/* Action buttons */}
        <div className="flex items-center gap-1 border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(identifier)}
            title="Copy issue ID"
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-4" />
            <span className="ml-1 text-xs">Copy ID</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(window.location.href)}
            title="Copy link"
          >
            <HugeiconsIcon icon={Link01Icon} className="size-4" />
            <span className="ml-1 text-xs">Copy link</span>
          </Button>
        </div>

        {/* Properties */}
        <div className="space-y-4 p-4">
          {/* Status */}
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Status</p>
            <div className="flex items-center gap-2 text-sm">
              {statusIcon && (
                <HugeiconsIcon
                  icon={statusIcon}
                  strokeWidth={2}
                  className="text-muted-foreground size-4"
                />
              )}
              <span>{issue.status.name}</span>
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Priority</p>
            <div className="flex items-center gap-2 text-sm">
              {priority?.icon && (
                <HugeiconsIcon
                  icon={priority.icon}
                  strokeWidth={2}
                  className="text-muted-foreground size-4"
                />
              )}
              <span>{priority?.label ?? issue.priority}</span>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Assignee</p>
            {issue.assignee ? (
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="size-5">
                  {issue.assignee.image && <AvatarImage src={issue.assignee.image} />}
                  <AvatarFallback className="text-[10px]">
                    {getInitials(issue.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{issue.assignee.name}</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Unassigned</p>
            )}
          </div>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Labels</p>
              <div className="flex flex-wrap gap-1">
                {issue.labels.map((label) => (
                  <Badge key={label.id} variant="outline">
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Project */}
          {issue.project && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Project</p>
              <p className="text-sm">{issue.project.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
