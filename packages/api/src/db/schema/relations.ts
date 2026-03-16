import { relations } from 'drizzle-orm'
import { user, session, account, organization, member, invitation } from './auth'
import { team, teamMember } from './team'
import { status } from './status'
import { label } from './label'
import { project, projectMember, projectDependency } from './project'
import { task, taskLabel } from './task'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  teamMembers: many(teamMember),
  projectMembers: many(projectMember),
  ledProjects: many(project),
  assignedTasks: many(task, { relationName: 'assignedTasks' }),
  createdTasks: many(task, { relationName: 'createdTasks' }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  teams: many(team),
  statuses: many(status),
  labels: many(label),
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}))

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export const teamRelations = relations(team, ({ one, many }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id],
  }),
  members: many(teamMember),
  projects: many(project),
  tasks: many(task),
  statuses: many(status),
  labels: many(label),
}))

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
}))

// ---------------------------------------------------------------------------
// Statuses
// ---------------------------------------------------------------------------

export const statusRelations = relations(status, ({ one, many }) => ({
  organization: one(organization, {
    fields: [status.organizationId],
    references: [organization.id],
  }),
  team: one(team, {
    fields: [status.teamId],
    references: [team.id],
  }),
  tasks: many(task),
}))

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const labelRelations = relations(label, ({ one, many }) => ({
  organization: one(organization, {
    fields: [label.organizationId],
    references: [organization.id],
  }),
  team: one(team, {
    fields: [label.teamId],
    references: [team.id],
  }),
  taskLabels: many(taskLabel),
}))

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

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
  tasks: many(task),
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

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const taskRelations = relations(task, ({ one, many }) => ({
  team: one(team, {
    fields: [task.teamId],
    references: [team.id],
  }),
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  status: one(status, {
    fields: [task.statusId],
    references: [status.id],
  }),
  assignee: one(user, {
    fields: [task.assigneeId],
    references: [user.id],
    relationName: 'assignedTasks',
  }),
  creator: one(user, {
    fields: [task.creatorId],
    references: [user.id],
    relationName: 'createdTasks',
  }),
  labels: many(taskLabel),
}))

export const taskLabelRelations = relations(taskLabel, ({ one }) => ({
  task: one(task, {
    fields: [taskLabel.taskId],
    references: [task.id],
  }),
  label: one(label, {
    fields: [taskLabel.labelId],
    references: [label.id],
  }),
}))
