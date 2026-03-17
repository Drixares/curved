import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { db } from '../db'
import { organization } from '../db/schema'
import type { AuthVariables } from '../middleware/auth'

export const organizationRoutes = new Hono<{ Variables: AuthVariables }>().post(
  '/check-slug',
  validator('json', (value, c) => {
    const body = value as { slug?: string }
    if (!body.slug) {
      return c.json({ error: 'Slug is required' }, 400)
    }
    return { slug: body.slug }
  }),
  async (c) => {
    const { slug } = c.req.valid('json')

    const existing = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      columns: { id: true },
    })

    return c.json({ status: existing ? ('taken' as const) : ('available' as const) })
  },
)
