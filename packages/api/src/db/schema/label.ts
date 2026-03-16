import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { organization } from './auth'
import { team } from './team'

export const label = pgTable(
  'label',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color').notNull(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    teamId: text('team_id').references(() => team.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('label_organizationId_idx').on(table.organizationId),
    index('label_teamId_idx').on(table.teamId),
  ],
)
