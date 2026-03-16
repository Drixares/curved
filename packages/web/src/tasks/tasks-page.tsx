import { z } from 'zod'

import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { taskSchema } from './data/schema'
import tasksData from './data/tasks.json'

const tasks = z.array(taskSchema).parse(tasksData)

export function TasksPage() {
  return (
    <div className="flex flex-col gap-8">
      <DataTable data={tasks} columns={columns} />
    </div>
  )
}
