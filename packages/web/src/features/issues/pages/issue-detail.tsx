import { Separator } from '@curved/ui'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import ActivitySection from '@/features/issues/components/activity-section'
import AttachmentsSection from '@/features/issues/components/attachments-section'
import IssueSidebar from '@/features/issues/components/issue-sidebar'
import { useIssue } from '@/features/issues/hooks/use-issue'
import { useTeamLabels } from '@/features/issues/hooks/use-team-labels'
import { useTeamMembers } from '@/features/issues/hooks/use-team-members'
import { useTeamStatuses } from '@/features/issues/hooks/use-team-statuses'
import { useUpdateIssue } from '@/features/issues/hooks/use-update-issue'
import { useTeamProjects } from '@/features/projects/hooks/use-team-projects'
import { PAGES } from '@/shared/constants/pages'

export default function IssueDetail() {
  const { issueId } = useParams<{ issueId: string }>()
  const { data: issue, isLoading, error } = useIssue(issueId)
  const { mutate: updateIssue } = useUpdateIssue(issueId!)

  const { data: members = [] } = useTeamMembers(issue?.team.id ?? null)
  const { data: statuses = [] } = useTeamStatuses(issue?.team.id ?? null)
  const { data: labels = [] } = useTeamLabels(issue?.team.id ?? null)
  const { data: projects = [] } = useTeamProjects(issue?.team.id ?? undefined)

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
        <Link to={PAGES.MY_ASSIGNED} className="text-sm underline">
          Back to issues
        </Link>
      </div>
    )
  }

  const identifier = `${issue.team.identifier}-${issue.number}`

  function saveTitle() {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== issue!.title) {
      updateIssue({ title: trimmed })
    } else {
      setTitleValue(issue!.title)
    }
  }

  function saveDescription() {
    const trimmed = descriptionValue.trim()
    const current = issue!.description ?? ''
    if (trimmed !== current) {
      updateIssue({ description: trimmed || null })
    }
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

        {/* Attachments */}
        <AttachmentsSection issueId={issue.id} />

        <Separator className="my-6" />

        {/* Activity + Comments */}
        <ActivitySection issueId={issue.id} creator={issue.creator} createdAt={issue.createdAt} />
      </div>

      <IssueSidebar
        identifier={identifier}
        statuses={statuses}
        currentStatus={currentStatus}
        priority={issue.priority}
        members={members}
        currentAssignee={currentAssignee}
        labels={labels}
        selectedLabelIds={selectedLabelIds}
        projects={projects}
        currentProject={
          issue.project ? (projects.find((p) => p.id === issue.project!.id) ?? null) : null
        }
        teamId={issue.team.id}
        onUpdate={(fields) => updateIssue(fields)}
      />
    </div>
  )
}
