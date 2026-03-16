import { pgTable, text, timestamp, integer, real, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { team } from './team'
import { project } from './project'
import { status } from './status'
import { label } from './label'

export const task = pgTable(
  'task',
  {
    id: text('id').primaryKey(),
    number: integer('number').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    statusId: text('status_id')
      .notNull()
      .references(() => status.id, { onDelete: 'restrict' }),
    priority: text('priority').default('none').notNull(), // urgent | high | medium | low | none
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => project.id, { onDelete: 'set null' }),
    assigneeId: text('assignee_id').references(() => user.id, { onDelete: 'set null' }),
    creatorId: text('creator_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    estimate: integer('estimate'),
    sortOrder: real('sort_order').default(0).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('task_teamId_idx').on(table.teamId),
    index('task_projectId_idx').on(table.projectId),
    index('task_assigneeId_idx').on(table.assigneeId),
    index('task_statusId_idx').on(table.statusId),
    index('task_deletedAt_idx').on(table.deletedAt),
    uniqueIndex('task_team_number_uidx').on(table.teamId, table.number),
  ],
)

export const taskLabel = pgTable(
  'task_label',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => task.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('taskLabel_taskId_idx').on(table.taskId),
    index('taskLabel_labelId_idx').on(table.labelId),
    uniqueIndex('taskLabel_task_label_uidx').on(table.taskId, table.labelId),
  ],
)
