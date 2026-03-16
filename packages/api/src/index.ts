import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { eq } from 'drizzle-orm'
import { auth } from './lib/auth'
import { db } from './db'
import { organization } from './db/schema'

const app = new Hono()

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }),
)

app.get('/', (c) => c.json({ message: 'Curved API' }))

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

app.post('/api/organization/check-slug', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { slug } = await c.req.json<{ slug: string }>()
  if (!slug) {
    return c.json({ error: 'Slug is required' }, 400)
  }

  const existing = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
    columns: { id: true },
  })

  return c.json({ status: existing ? 'taken' : 'available' })
})

export default {
  port: 3000,
  fetch: app.fetch,
}
