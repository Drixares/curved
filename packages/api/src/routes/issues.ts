import { and, eq, isNull, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { db } from '../db'
import { issue, issueLabel, status, team } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

export const issueRoutes = new Hono<{ Variables: AuthVariables }>()
  .get('/:issueId', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const { issueId } = c.req.param()

    const found = await db.query.issue.findFirst({
      where: and(eq(issue.id, issueId), isNull(issue.deletedAt)),
      with: {
        status: {
          columns: { id: true, name: true, color: true, type: true },
        },
        team: {
          columns: { id: true, identifier: true, organizationId: true },
        },
        labels: {
          with: {
            label: {
              columns: { id: true, name: true, color: true },
            },
          },
        },
        assignee: {
          columns: { id: true, name: true, image: true },
        },
        creator: {
          columns: { id: true, name: true, image: true },
        },
        project: {
          columns: { id: true, name: true },
        },
      },
    })

    if (!found) {
      return c.json({ error: 'Issue not found' }, 404)
    }

    // Verify the issue belongs to a team in the user's active org
    if (found.team.organizationId !== orgId) {
      return c.json({ error: 'Issue not found' }, 404)
    }

    return c.json({
      id: found.id,
      number: found.number,
      title: found.title,
      description: found.description,
      priority: found.priority,
      status: found.status,
      team: { id: found.team.id, identifier: found.team.identifier },
      labels: found.labels.map((il) => il.label),
      assignee: found.assignee,
      creator: found.creator,
      project: found.project,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    })
  })
  .post(
    '/',
    validator('json', (value, c) => {
      const body = value as {
        title?: string
        teamId?: string
        description?: string
        statusId?: string
        priority?: string
        assigneeId?: string
        labelIds?: string[]
      }
      if (!body.title?.trim() || !body.teamId) {
        return c.json({ error: 'Title and teamId are required' }, 400)
      }
      return {
        title: body.title,
        teamId: body.teamId,
        description: body.description,
        statusId: body.statusId,
        priority: body.priority,
        assigneeId: body.assigneeId,
        labelIds: body.labelIds,
      }
    }),
    async (c) => {
      const session = c.get('session')
      const userId = c.get('user').id
      const orgId = session.activeOrganizationId

      if (!orgId) {
        return c.json({ error: 'No active organization' }, 400)
      }

      const body = c.req.valid('json')

      // Verify the team belongs to the active org
      const foundTeam = await db.query.team.findFirst({
        where: and(eq(team.id, body.teamId), eq(team.organizationId, orgId)),
        columns: { id: true, identifier: true },
      })

      if (!foundTeam) {
        return c.json({ error: 'Team not found' }, 404)
      }

      // Resolve statusId: use provided or fall back to team/org default
      let statusId = body.statusId
      if (!statusId) {
        const defaultStatus = await db.query.status.findFirst({
          where: and(eq(status.isDefault, true), eq(status.organizationId, orgId)),
          columns: { id: true },
        })
        if (!defaultStatus) {
          return c.json({ error: 'No default status found' }, 400)
        }
        statusId = defaultStatus.id
      }

      // Atomically increment the team's issue counter and get the new number
      const [updated] = await db
        .update(team)
        .set({ issueCounter: sql`${team.issueCounter} + 1` })
        .where(eq(team.id, body.teamId))
        .returning({ issueCounter: team.issueCounter })

      const issueNumber = updated.issueCounter

      const issueId = crypto.randomUUID()

      await db.insert(issue).values({
        id: issueId,
        number: issueNumber,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        statusId,
        priority: body.priority || 'none',
        teamId: body.teamId,
        assigneeId: body.assigneeId || null,
        creatorId: userId,
      })

      // Insert labels if provided
      if (body.labelIds && body.labelIds.length > 0) {
        await db.insert(issueLabel).values(
          body.labelIds.map((labelId) => ({
            id: crypto.randomUUID(),
            issueId,
            labelId,
          })),
        )
      }

      return c.json(
        {
          id: issueId,
          number: issueNumber,
          title: body.title.trim(),
          teamIdentifier: foundTeam.identifier,
        },
        201,
      )
    },
  )
