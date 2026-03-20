import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { issue } from './issue'

export const attachment = pgTable(
  'attachment',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issue.id, { onDelete: 'cascade' }),
    uploaderId: text('uploader_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(), // bytes
    mimeType: text('mime_type').notNull(),
    s3Key: text('s3_key').notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('attachment_issueId_idx').on(table.issueId),
    index('attachment_uploaderId_idx').on(table.uploaderId),
  ],
)

export const attachmentRelations = relations(attachment, ({ one }) => ({
  issue: one(issue, {
    fields: [attachment.issueId],
    references: [issue.id],
  }),
  uploader: one(user, {
    fields: [attachment.uploaderId],
    references: [user.id],
    relationName: 'uploadedAttachments',
  }),
}))
