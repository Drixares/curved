import { and, eq, isNull } from 'drizzle-orm'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { db } from '../db'
import { issue, label, project, status, team, teamMember } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

export const teamRoutes = new Hono<{ Variables: AuthVariables }>()
  .get('/', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const teams = await db.query.team.findMany({
      where: eq(team.organizationId, orgId),
      columns: {
        id: true,
        name: true,
        slug: true,
        identifier: true,
        icon: true,
      },
      orderBy: (team, { asc }) => [asc(team.name)],
    })

    return c.json(teams)
  })
  .post(
    '/',
    validator('json', (value, c) => {
      const body = value as { name?: string; identifier?: string; slug?: string }
      if (!body.name || !body.identifier || !body.slug) {
        return c.json({ error: 'Name, identifier, and slug are required' }, 400)
      }
      return { name: body.name, identifier: body.identifier, slug: body.slug }
    }),
    async (c) => {
      const session = c.get('session')
      const userId = c.get('user').id
      const orgId = session.activeOrganizationId

      if (!orgId) {
        return c.json({ error: 'No active organization' }, 400)
      }

      const { name, identifier, slug } = c.req.valid('json')

      // Check identifier uniqueness within the org
      const existing = await db.query.team.findFirst({
        where: and(eq(team.organizationId, orgId), eq(team.identifier, identifier)),
        columns: { id: true },
      })

      if (existing) {
        return c.json({ error: 'A team with this identifier already exists' }, 409)
      }

      const id = crypto.randomUUID()

      await db.insert(team).values({
        id,
        name: name.trim(),
        identifier: identifier.toUpperCase(),
        slug,
        organizationId: orgId,
      })

      // Add creator as team owner
      await db.insert(teamMember).values({
        id: crypto.randomUUID(),
        teamId: id,
        userId,
        role: 'owner',
      })

      return c.json({ id, name, identifier, slug }, 201)
    },
  )
  .get('/:teamId/statuses', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const statuses = await db.query.status.findMany({
      where: and(eq(status.organizationId, orgId)),
      columns: {
        id: true,
        name: true,
        color: true,
        type: true,
        position: true,
        isDefault: true,
      },
      orderBy: (status, { asc }) => [asc(status.position)],
    })

    return c.json(statuses)
  })
  .get('/:teamId/labels', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const labels = await db.query.label.findMany({
      where: eq(label.organizationId, orgId),
      columns: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: (label, { asc }) => [asc(label.name)],
    })

    return c.json(labels)
  })
  .get('/:teamId/members', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId
    const { teamId } = c.req.param()

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const members = await db.query.teamMember.findMany({
      where: eq(teamMember.teamId, teamId),
      with: {
        user: {
          columns: { id: true, name: true, image: true },
        },
      },
    })

    return c.json(members.map((m) => m.user))
  })
  .get('/:teamId/issues', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId
    const { teamId } = c.req.param()

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    // Verify the team belongs to the active org
    const foundTeam = await db.query.team.findFirst({
      where: and(eq(team.id, teamId), eq(team.organizationId, orgId)),
      columns: { id: true, identifier: true },
    })

    if (!foundTeam) {
      return c.json({ error: 'Team not found' }, 404)
    }

    const issues = await db.query.issue.findMany({
      where: and(eq(issue.teamId, teamId), isNull(issue.deletedAt)),
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
  })
  .get('/:teamId/projects', async (c) => {
    const session = c.get('session')
    const orgId = session.activeOrganizationId
    const { teamId } = c.req.param()

    if (!orgId) {
      return c.json({ error: 'No active organization' }, 400)
    }

    const foundTeam = await db.query.team.findFirst({
      where: and(eq(team.id, teamId), eq(team.organizationId, orgId)),
      columns: { id: true, identifier: true },
    })

    if (!foundTeam) {
      return c.json({ error: 'Team not found' }, 404)
    }

    const projects = await db.query.project.findMany({
      where: and(eq(project.teamId, teamId), isNull(project.deletedAt)),
      with: {
        lead: {
          columns: { id: true, name: true, image: true },
        },
      },
      orderBy: (project, { desc }) => [desc(project.createdAt)],
    })

    const result = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      lead: p.lead,
      startDate: p.startDate,
      targetDate: p.targetDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    return c.json(result)
  })
