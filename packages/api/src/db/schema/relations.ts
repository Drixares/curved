import { relations } from 'drizzle-orm'
import { user, session, account, organization, member, invitation } from './auth'
import { team, teamMember } from './team'
import { status } from './status'
import { label } from './label'
import { project, projectMember, projectDependency } from './project'
import { issue, issueLabel } from './issue'

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
  assignedIssues: many(issue, { relationName: 'assignedIssues' }),
  createdIssues: many(issue, { relationName: 'createdIssues' }),
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
  issues: many(issue),
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
  issues: many(issue),
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
  issueLabels: many(issueLabel),
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
  issues: many(issue),
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
// Issues
// ---------------------------------------------------------------------------

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
