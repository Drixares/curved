import { and, eq, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { db } from '../db'
import { project, team } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

export const projectRoutes = new Hono<{ Variables: AuthVariables }>()
  .get('/:projectId', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const { projectId } = c.req.param()

    const found = await db.query.project.findFirst({
      where: and(eq(project.id, projectId), isNull(project.deletedAt)),
      with: {
        team: {
          columns: { id: true, identifier: true, organizationId: true },
        },
        lead: {
          columns: { id: true, name: true, image: true },
        },
      },
    })

    if (!found) {
      return c.json({ error: 'Project not found' }, 404)
    }

    if (found.team.organizationId !== orgId) {
      return c.json({ error: 'Project not found' }, 404)
    }

    return c.json({
      id: found.id,
      name: found.name,
      description: found.description,
      status: found.status,
      priority: found.priority,
      team: { id: found.team.id, identifier: found.team.identifier },
      lead: found.lead,
      startDate: found.startDate,
      targetDate: found.targetDate,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    })
  })
  .post(
    '/',
    validator('json', (value, c) => {
      const body = value as {
        name?: string
        teamId?: string
        description?: string
        status?: string
        priority?: string
        leadId?: string
      }
      if (!body.name?.trim() || !body.teamId) {
        return c.json({ error: 'Name and teamId are required' }, 400)
      }
      return {
        name: body.name,
        teamId: body.teamId,
        description: body.description,
        status: body.status,
        priority: body.priority,
        leadId: body.leadId,
      }
    }),
    async (c) => {
      const session = c.get('session')
      const orgId = session.activeOrganizationId

      if (!orgId) {
        return c.json({ error: 'No active organization' }, 400)
      }

      const body = c.req.valid('json')

      const foundTeam = await db.query.team.findFirst({
        where: and(eq(team.id, body.teamId), eq(team.organizationId, orgId)),
        columns: { id: true, identifier: true },
      })

      if (!foundTeam) {
        return c.json({ error: 'Team not found' }, 404)
      }

      const projectId = crypto.randomUUID()

      await db.insert(project).values({
        id: projectId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        status: body.status || 'backlog',
        priority: body.priority || 'none',
        teamId: body.teamId,
        leadId: body.leadId || null,
      })

      return c.json(
        {
          id: projectId,
          name: body.name.trim(),
          teamIdentifier: foundTeam.identifier,
        },
        201,
      )
    },
  )
