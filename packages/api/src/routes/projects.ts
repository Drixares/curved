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
  .patch(
    '/:projectId',
    validator('json', (value, c) => {
      const body = value as {
        name?: string
        description?: string | null
        status?: string
        priority?: string
        leadId?: string | null
        startDate?: string | null
        targetDate?: string | null
      }
      // At least one field must be provided
      if (
        body.name === undefined &&
        body.description === undefined &&
        body.status === undefined &&
        body.priority === undefined &&
        body.leadId === undefined &&
        body.startDate === undefined &&
        body.targetDate === undefined
      ) {
        return c.json({ error: 'No fields to update' }, 400)
      }
      return body
    }),
    async (c) => {
      const session = c.get('session')
      const orgId = session.activeOrganizationId

      if (!orgId) {
        return c.json({ error: 'No active organization' }, 400)
      }

      const { projectId } = c.req.param()
      const body = c.req.valid('json')

      // Verify project exists and belongs to org
      const found = await db.query.project.findFirst({
        where: and(eq(project.id, projectId), isNull(project.deletedAt)),
        with: {
          team: { columns: { id: true, organizationId: true } },
        },
      })

      if (!found || found.team.organizationId !== orgId) {
        return c.json({ error: 'Project not found' }, 404)
      }

      // Build update object
      const updates: Record<string, unknown> = {}
      if (body.name !== undefined) updates.name = body.name.trim()
      if (body.description !== undefined) updates.description = body.description?.trim() || null
      if (body.status !== undefined) updates.status = body.status
      if (body.priority !== undefined) updates.priority = body.priority
      if (body.leadId !== undefined) updates.leadId = body.leadId || null
      if (body.startDate !== undefined)
        updates.startDate = body.startDate ? new Date(body.startDate) : null
      if (body.targetDate !== undefined)
        updates.targetDate = body.targetDate ? new Date(body.targetDate) : null

      await db.update(project).set(updates).where(eq(project.id, projectId))

      // Return updated project
      const updated = await db.query.project.findFirst({
        where: eq(project.id, projectId),
        with: {
          team: { columns: { id: true, identifier: true, organizationId: true } },
          lead: { columns: { id: true, name: true, image: true } },
        },
      })

      return c.json({
        id: updated!.id,
        name: updated!.name,
        description: updated!.description,
        status: updated!.status,
        priority: updated!.priority,
        team: { id: updated!.team.id, identifier: updated!.team.identifier },
        lead: updated!.lead,
        startDate: updated!.startDate,
        targetDate: updated!.targetDate,
        createdAt: updated!.createdAt,
        updatedAt: updated!.updatedAt,
      })
    },
  )
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
