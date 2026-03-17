import { Button } from '@curved/ui'
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  GitBranchIcon,
  Link01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface IssueCreatedToastProps {
  toastId: string | number
  identifier: string
  number: number
  title: string
  issueId: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function IssueCreatedToast({
  toastId,
  identifier,
  number: issueNumber,
  title,
  issueId,
}: IssueCreatedToastProps) {
  const navigate = useNavigate()

  const issueKey = `${identifier}-${issueNumber}`
  const branchName = `${identifier.toLowerCase()}-${issueNumber}-${slugify(title)}`

  function handleViewIssue() {
    navigate(`/issue/${issueId}`)
    toast.dismiss(toastId)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/issue/${issueId}`)
  }

  function handleCopyId() {
    navigator.clipboard.writeText(issueKey)
  }

  function handleCopyBranch() {
    navigator.clipboard.writeText(branchName)
  }

  return (
    <div className="bg-background border-border w-[360px] rounded-lg border p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            strokeWidth={2}
            className="text-emerald-500"
          />
          <span className="text-sm font-medium">Issue created</span>
        </div>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-muted-foreground text-sm">{issueKey}</span>
        <span className="text-muted-foreground text-sm">—</span>
        <span className="truncate text-sm">{title}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button onClick={handleViewIssue} className="text-primary text-sm hover:underline">
          View issue
        </button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={handleCopyLink} title="Copy link">
            <HugeiconsIcon icon={Link01Icon} size={14} strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleCopyId} title="Copy ID">
            <HugeiconsIcon icon={Copy01Icon} size={14} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopyBranch}
            title="Copy branch name"
          >
            <HugeiconsIcon icon={GitBranchIcon} size={14} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  )
}
