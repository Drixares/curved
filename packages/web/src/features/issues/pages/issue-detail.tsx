import { useParams, Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, Link01Icon } from '@hugeicons/core-free-icons'
import { Button, Separator } from '@curved/ui'
import { useRef, useEffect, useState } from 'react'

import { useIssue } from '@/features/issues/hooks/use-issue'
import { useUpdateIssue } from '@/features/issues/hooks/use-update-issue'
import { useTeamMembers } from '@/features/issues/hooks/use-team-members'
import { useTeamStatuses } from '@/features/issues/hooks/use-team-statuses'
import { useTeamLabels } from '@/features/issues/hooks/use-team-labels'
import { StatusChip } from '@/features/issues/components/status-chip'
import { PriorityChip } from '@/features/issues/components/priority-chip'
import { AssigneeChip } from '@/features/issues/components/assignee-chip'
import { LabelsChip } from '@/features/issues/components/labels-chip'
import ActivitySection from '@/features/issues/components/activity-section'

export default function IssueDetail() {
  const { issueId } = useParams<{ issueId: string }>()
  const { data: issue, isLoading, error } = useIssue(issueId)
  const { mutate: updateIssue } = useUpdateIssue(issueId!)

  const { data: members = [] } = useTeamMembers(issue?.team.id ?? null)
  const { data: statuses = [] } = useTeamStatuses(issue?.team.id ?? null)
  const { data: labels = [] } = useTeamLabels(issue?.team.id ?? null)

  const [titleValue, setTitleValue] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  const [descriptionValue, setDescriptionValue] = useState('')
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (issue) {
      setTitleValue(issue.title)
      setDescriptionValue(issue.description ?? '')
    }
  }, [issue])

  // Auto-resize description textarea
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto'
      descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px'
    }
  }, [descriptionValue])

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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  function saveTitle() {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== issue!.title) {
      updateIssue({ title: trimmed })
    } else {
      setTitleValue(issue!.title)
    }
    setEditingTitle(false)
  }

  function saveDescription() {
    const trimmed = descriptionValue.trim()
    const current = issue!.description ?? ''
    if (trimmed !== current) {
      updateIssue({ description: trimmed || null })
    }
    setEditingDescription(false)
  }

  const currentStatus = statuses.find((s) => s.id === issue.status.id) ?? null
  const currentAssignee = issue.assignee
    ? (members.find((m) => m.id === issue.assignee!.id) ?? null)
    : null
  const selectedLabelIds = issue.labels.map((l) => l.id)

  return (
    <div className="flex h-full">
      {/* Left: main content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Title - inline editable */}
        <input
          ref={titleRef}
          value={titleValue}
          placeholder="Issue title"
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveTitle()
            if (e.key === 'Escape') {
              setTitleValue(issue.title)
              titleRef.current?.blur()
            }
          }}
          className="placeholder:text-muted-foreground/50 mb-4 w-full cursor-text border-none bg-transparent text-2xl font-semibold tracking-tight outline-none"
        />

        {/* Description - inline editable */}
        <textarea
          ref={descriptionRef}
          value={descriptionValue}
          placeholder="Add a description..."
          onChange={(e) => setDescriptionValue(e.target.value)}
          onBlur={saveDescription}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDescriptionValue(issue.description ?? '')
              descriptionRef.current?.blur()
            }
          }}
          className="text-muted-foreground placeholder:text-muted-foreground/50 mb-8 w-full cursor-text resize-none border-none bg-transparent outline-none placeholder:italic"
          rows={1}
        />

        <Separator className="mb-6" />

        {/* Activity + Comments */}
        <ActivitySection issueId={issue.id} creator={issue.creator} createdAt={issue.createdAt} />
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
            <StatusChip
              statuses={statuses}
              currentStatus={currentStatus}
              onSelect={(statusId) => updateIssue({ statusId })}
            />
          </div>

          {/* Priority */}
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Priority</p>
            <PriorityChip
              priority={issue.priority}
              onSelect={(priority) => updateIssue({ priority })}
            />
          </div>

          {/* Assignee */}
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Assignee</p>
            <AssigneeChip
              members={members}
              currentAssignee={currentAssignee}
              onSelect={(assigneeId) => updateIssue({ assigneeId })}
            />
          </div>

          {/* Labels */}
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Labels</p>
            <LabelsChip
              labels={labels}
              selectedIds={selectedLabelIds}
              onToggle={(labelId) => {
                const newIds = selectedLabelIds.includes(labelId)
                  ? selectedLabelIds.filter((id) => id !== labelId)
                  : [...selectedLabelIds, labelId]
                updateIssue({ labelIds: newIds })
              }}
            />
          </div>

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
