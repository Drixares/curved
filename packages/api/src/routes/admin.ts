import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import { validator } from 'hono/validator'
import { count, eq } from 'drizzle-orm'
import { db } from '../db'
import { adminUser, user, organization, team, project, issue } from '../db/schema'

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET ?? 'curved-admin-secret-dev'
const JWT_ALG = 'HS256' as const

type AdminVariables = {
  adminUser: { id: string; email: string; name: string }
}

const adminAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, ADMIN_JWT_SECRET, JWT_ALG)
    c.set('adminUser', { id: payload.sub, email: payload.email, name: payload.name })
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export const adminRoutes = new Hono<{ Variables: AdminVariables }>()
  .post(
    '/login',
    validator('json', (value, c) => {
      const body = value as { email?: string; password?: string }
      if (!body.email || !body.password) {
        return c.json({ error: 'Email and password are required' }, 400)
      }
      return { email: body.email, password: body.password }
    }),
    async (c) => {
      const { email, password } = c.req.valid('json')

      const admin = await db.query.adminUser.findFirst({
        where: eq(adminUser.email, email),
      })

      if (!admin) {
        return c.json({ error: 'Invalid credentials' }, 401)
      }

      const valid = await Bun.password.verify(password, admin.passwordHash)
      if (!valid) {
        return c.json({ error: 'Invalid credentials' }, 401)
      }

      const token = await sign(
        {
          sub: admin.id,
          email: admin.email,
          name: admin.name,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
        },
        ADMIN_JWT_SECRET,
        JWT_ALG,
      )

      return c.json({
        token,
        user: { id: admin.id, email: admin.email, name: admin.name },
      })
    },
  )
  .use('/*', adminAuthMiddleware)
  .get('/me', async (c) => {
    const admin = c.get('adminUser')
    return c.json(admin)
  })
  .get('/stats', async (c) => {
    const [usersCount] = await db.select({ count: count() }).from(user)
    const [orgsCount] = await db.select({ count: count() }).from(organization)
    const [teamsCount] = await db.select({ count: count() }).from(team)
    const [projectsCount] = await db.select({ count: count() }).from(project)
    const [issuesCount] = await db.select({ count: count() }).from(issue)

    return c.json({
      users: usersCount.count,
      organizations: orgsCount.count,
      teams: teamsCount.count,
      projects: projectsCount.count,
      issues: issuesCount.count,
    })
  })
  .get('/users', async (c) => {
    const page = parseInt(c.req.query('page') ?? '1')
    const limit = parseInt(c.req.query('limit') ?? '20')
    const offset = (page - 1) * limit

    const [totalResult] = await db.select({ count: count() }).from(user)

    const users = await db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
      },
      limit,
      offset,
      orderBy: (user, { desc }) => [desc(user.createdAt)],
    })

    return c.json({
      data: users,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    })
  })
