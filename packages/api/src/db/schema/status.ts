import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core'
import { organization } from './auth'
import { team } from './team'

export const status = pgTable(
  'status',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color').notNull(),
    position: integer('position').default(0).notNull(),
    type: text('type').notNull(), // backlog | unstarted | started | completed | cancelled
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    teamId: text('team_id').references(() => team.id, { onDelete: 'cascade' }),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('status_organizationId_idx').on(table.organizationId),
    index('status_teamId_idx').on(table.teamId),
  ],
)

export const statusRelations = relations(status, ({ one }) => ({
  organization: one(organization, {
    fields: [status.organizationId],
    references: [organization.id],
  }),
  team: one(team, {
    fields: [status.teamId],
    references: [team.id],
  }),
}))
