import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { useMyAssignedIssues } from '@/hooks/use-my-assigned-issues'

export function IssuesPage() {
  const { data: issues, isLoading } = useMyAssignedIssues()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">Loading issues...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <DataTable data={issues ?? []} columns={columns} />
    </div>
  )
}
