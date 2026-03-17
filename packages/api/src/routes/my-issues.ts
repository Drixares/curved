import { and, eq, inArray, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db'
import { issue, team } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

export const myIssueRoutes = new Hono<{ Variables: AuthVariables }>().get(
  '/assigned',
  async (c) => {
    const session = c.get('session')
    const userId = c.get('user').id
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    // Get all team IDs for the active org
    const orgTeams = await db.query.team.findMany({
      where: eq(team.organizationId, orgId),
      columns: { id: true },
    })
    const teamIds = orgTeams.map((t) => t.id)

    if (teamIds.length === 0) {
      return c.json([])
    }

    const issues = await db.query.issue.findMany({
      where: and(
        eq(issue.assigneeId, userId),
        inArray(issue.teamId, teamIds),
        isNull(issue.deletedAt),
      ),
      with: {
        status: {
          columns: { id: true, name: true, color: true, type: true },
        },
        team: {
          columns: { id: true, identifier: true },
        },
        labels: {
          with: {
            label: {
              columns: { id: true, name: true, color: true },
            },
          },
        },
      },
      orderBy: (issue, { desc }) => [desc(issue.createdAt)],
    })

    // Flatten the issueLabel join
    const result = issues.map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      priority: i.priority,
      status: i.status,
      team: i.team,
      labels: i.labels.map((il) => il.label),
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }))

    return c.json(result)
  },
)
