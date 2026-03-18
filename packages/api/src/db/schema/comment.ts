import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { issue } from './issue'

export const comment = pgTable(
  'comment',
  {
    id: text('id').primaryKey(),
    body: text('body').notNull(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issue.id, { onDelete: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    parentId: text('parent_id').references((): any => comment.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('comment_issueId_idx').on(table.issueId),
    index('comment_parentId_idx').on(table.parentId),
  ],
)

export const commentRelations = relations(comment, ({ one, many }) => ({
  issue: one(issue, {
    fields: [comment.issueId],
    references: [issue.id],
  }),
  author: one(user, {
    fields: [comment.authorId],
    references: [user.id],
    relationName: 'authoredComments',
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: 'replies',
  }),
  replies: many(comment, { relationName: 'replies' }),
}))
