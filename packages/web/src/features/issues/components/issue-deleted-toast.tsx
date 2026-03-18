import { CustomToast } from '@/shared/components/custom-toast'

interface IssueDeletedToastProps {
  toastId: string | number
  issueKey: string
  title: string
}

export function IssueDeletedToast({ toastId, issueKey, title }: IssueDeletedToastProps) {
  return (
    <CustomToast
      toastId={toastId}
      variant="destructive"
      message="Issue deleted"
      description={
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-sm">{issueKey}</span>
          <span className="text-muted-foreground text-sm">—</span>
          <span className="truncate text-sm">{title}</span>
        </div>
      }
    />
  )
}
