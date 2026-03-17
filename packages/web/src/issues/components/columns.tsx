import { HugeiconsIcon } from '@hugeicons/react'
import { type ColumnDef } from '@tanstack/react-table'

import { Badge, Checkbox } from '@curved/ui'

import { priorities, statusTypeIcons } from '../data/data'
import { type Issue } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Issue>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'identifier',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Issue" />,
    cell: ({ row }) => (
      <div className="text-muted-foreground w-[80px]">
        {row.original.team.identifier}-{row.original.number}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          {row.original.labels.map((label) => (
            <Badge key={label.id} variant="outline">
              {label.name}
            </Badge>
          ))}
          <span className="max-w-[500px] truncate font-medium">{row.getValue('title')}</span>
        </div>
      )
    },
  },
  {
    id: 'status',
    accessorFn: (row) => row.status.type,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status
      const icon = statusTypeIcons[status.type]

      return (
        <div className="flex w-[120px] items-center gap-2">
          {icon && (
            <HugeiconsIcon icon={icon} strokeWidth={2} className="text-muted-foreground size-4" />
          )}
          <span>{status.name}</span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      return value.includes(row.original.status.type)
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => {
      const priority = priorities.find((p) => p.value === row.getValue('priority'))

      if (!priority) {
        return null
      }

      return (
        <div className="flex items-center gap-2">
          {priority.icon && (
            <HugeiconsIcon
              icon={priority.icon}
              strokeWidth={2}
              className="text-muted-foreground size-4"
            />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
