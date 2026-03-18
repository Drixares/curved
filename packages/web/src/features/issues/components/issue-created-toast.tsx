import { Button } from '@curved/ui'
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  GitBranchIcon,
  Link01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ISSUES_PAGES } from '@/shared/constants/pages'
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard'
import { slugify } from '@/shared/lib/slugify'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface IssueCreatedToastProps {
  toastId: string | number
  identifier: string
  number: number
  title: string
  issueId: string
}

export function IssueCreatedToast({
  toastId,
  identifier,
  number: issueNumber,
  title,
  issueId,
}: IssueCreatedToastProps) {
  const navigate = useNavigate()
  const { copy } = useCopyToClipboard()

  const issueKey = `${identifier}-${issueNumber}`
  const branchName = `${identifier.toLowerCase()}-${issueNumber}-${slugify(title)}`

  function handleViewIssue() {
    navigate(ISSUES_PAGES.DETAIL(issueId))
    toast.dismiss(toastId)
  }

  return (
    <div className="bg-sidebar border-border w-90 rounded-lg border p-3 shadow-lg">
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => copy(`${window.location.origin}${ISSUES_PAGES.DETAIL(issueId)}`)}
            title="Copy link"
          >
            <HugeiconsIcon icon={Link01Icon} size={14} strokeWidth={2} />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => copy(issueKey)} title="Copy ID">
            <HugeiconsIcon icon={Copy01Icon} size={14} strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => copy(branchName)}
            title="Copy branch name"
          >
            <HugeiconsIcon icon={GitBranchIcon} size={14} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  )
}
