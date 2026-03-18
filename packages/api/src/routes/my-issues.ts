import { and, eq, inArray, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db'
import { issue, team } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

const issueWith = {
  status: {
    columns: { id: true, name: true, color: true, type: true, position: true },
  },
  team: {
    columns: { id: true, identifier: true },
  },
  assignee: {
    columns: { id: true, name: true, image: true },
  },
  labels: {
    with: {
      label: {
        columns: { id: true, name: true, color: true },
      },
    },
  },
} as const

function mapIssues(issues: Awaited<ReturnType<typeof queryIssues>>) {
  return issues.map((i) => ({
    id: i.id,
    number: i.number,
    title: i.title,
    priority: i.priority,
    status: i.status,
    team: i.team,
    assignee: i.assignee,
    labels: i.labels.map((il) => il.label),
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  }))
}

async function queryIssues(filter: Parameters<typeof and>[0], teamIds: string[]) {
  return db.query.issue.findMany({
    where: and(filter, inArray(issue.teamId, teamIds), isNull(issue.deletedAt)),
    with: issueWith,
    orderBy: (issue, { desc }) => [desc(issue.createdAt)],
  })
}

async function getOrgTeamIds(orgId: string) {
  const orgTeams = await db.query.team.findMany({
    where: eq(team.organizationId, orgId),
    columns: { id: true },
  })
  return orgTeams.map((t) => t.id)
}

export const myIssueRoutes = new Hono<{ Variables: AuthVariables }>()
  .get('/assigned', async (c) => {
    const session = c.get('session')
    const userId = c.get('user').id
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const teamIds = await getOrgTeamIds(orgId)
    if (teamIds.length === 0) return c.json([])

    const issues = await queryIssues(eq(issue.assigneeId, userId), teamIds)
    return c.json(mapIssues(issues))
  })
  .get('/created', async (c) => {
    const session = c.get('session')
    const userId = c.get('user').id
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const teamIds = await getOrgTeamIds(orgId)
    if (teamIds.length === 0) return c.json([])

    const issues = await queryIssues(eq(issue.creatorId, userId), teamIds)
    return c.json(mapIssues(issues))
  })
