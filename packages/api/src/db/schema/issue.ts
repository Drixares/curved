import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, integer, real, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { team } from './team'
import { project } from './project'
import { status } from './status'
import { label } from './label'
import { comment } from './comment'
import { attachment } from './attachment'

export const issue = pgTable(
  'issue',
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
    index('issue_teamId_idx').on(table.teamId),
    index('issue_projectId_idx').on(table.projectId),
    index('issue_assigneeId_idx').on(table.assigneeId),
    index('issue_statusId_idx').on(table.statusId),
    index('issue_deletedAt_idx').on(table.deletedAt),
    uniqueIndex('issue_team_number_uidx').on(table.teamId, table.number),
  ],
)

export const issueLabel = pgTable(
  'issue_label',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issue.id, { onDelete: 'cascade' }),
    labelId: text('label_id')
      .notNull()
      .references(() => label.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('issueLabel_issueId_idx').on(table.issueId),
    index('issueLabel_labelId_idx').on(table.labelId),
    uniqueIndex('issueLabel_issue_label_uidx').on(table.issueId, table.labelId),
  ],
)

export const issueRelations = relations(issue, ({ one, many }) => ({
  team: one(team, {
    fields: [issue.teamId],
    references: [team.id],
  }),
  project: one(project, {
    fields: [issue.projectId],
    references: [project.id],
  }),
  status: one(status, {
    fields: [issue.statusId],
    references: [status.id],
  }),
  assignee: one(user, {
    fields: [issue.assigneeId],
    references: [user.id],
    relationName: 'assignedIssues',
  }),
  creator: one(user, {
    fields: [issue.creatorId],
    references: [user.id],
    relationName: 'createdIssues',
  }),
  labels: many(issueLabel),
  comments: many(comment),
  attachments: many(attachment),
}))

export const issueLabelRelations = relations(issueLabel, ({ one }) => ({
  issue: one(issue, {
    fields: [issueLabel.issueId],
    references: [issue.id],
  }),
  label: one(label, {
    fields: [issueLabel.labelId],
    references: [label.id],
  }),
}))
