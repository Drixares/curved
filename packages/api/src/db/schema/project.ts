import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, real, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { team } from './team'

export const project = pgTable(
  'project',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('backlog').notNull(), // backlog | planned | in_progress | paused | completed | cancelled
    priority: text('priority').default('none').notNull(), // urgent | high | medium | low | none
    leadId: text('lead_id').references(() => user.id, { onDelete: 'set null' }),
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    startDate: timestamp('start_date'),
    targetDate: timestamp('target_date'),
    sortOrder: real('sort_order').default(0).notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('project_teamId_idx').on(table.teamId),
    index('project_leadId_idx').on(table.leadId),
    index('project_deletedAt_idx').on(table.deletedAt),
  ],
)

export const projectMember = pgTable(
  'project_member',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('projectMember_projectId_idx').on(table.projectId),
    index('projectMember_userId_idx').on(table.userId),
    uniqueIndex('projectMember_project_user_uidx').on(table.projectId, table.userId),
  ],
)

export const projectDependency = pgTable(
  'project_dependency',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    dependsOnProjectId: text('depends_on_project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('projectDep_projectId_idx').on(table.projectId),
    index('projectDep_dependsOn_idx').on(table.dependsOnProjectId),
    uniqueIndex('projectDep_pair_uidx').on(table.projectId, table.dependsOnProjectId),
  ],
)

export const projectRelations = relations(project, ({ one, many }) => ({
  team: one(team, {
    fields: [project.teamId],
    references: [team.id],
  }),
  lead: one(user, {
    fields: [project.leadId],
    references: [user.id],
  }),
  members: many(projectMember),
  dependencies: many(projectDependency, { relationName: 'project' }),
  dependents: many(projectDependency, { relationName: 'dependsOn' }),
}))

export const projectMemberRelations = relations(projectMember, ({ one }) => ({
  project: one(project, {
    fields: [projectMember.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectMember.userId],
    references: [user.id],
  }),
}))

export const projectDependencyRelations = relations(projectDependency, ({ one }) => ({
  project: one(project, {
    fields: [projectDependency.projectId],
    references: [project.id],
    relationName: 'project',
  }),
  dependsOn: one(project, {
    fields: [projectDependency.dependsOnProjectId],
    references: [project.id],
    relationName: 'dependsOn',
  }),
}))
