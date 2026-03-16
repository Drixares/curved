import { z } from 'zod'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { issueSchema } from './data/schema'
import issuesData from './data/issues.json'

const issues = z.array(issueSchema).parse(issuesData)

export function IssuesPage() {
  return (
    <div className="flex flex-col gap-8">
      <DataTable data={issues} columns={columns} />
    </div>
  )
}
