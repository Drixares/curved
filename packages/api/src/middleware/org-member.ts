import { createMiddleware } from 'hono/factory'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { member } from '../db/schema'
import type { AuthVariables } from './auth'

export const orgMemberMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const user = c.get('user')
    const orgId = c.req.param('orgId')

    if (!orgId) {
      return c.json({ error: 'Organization ID is required' }, 400)
    }

    const membership = await db.query.member.findFirst({
      where: and(eq(member.organizationId, orgId), eq(member.userId, user.id)),
    })

    if (!membership) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  },
)
