import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './db'
import { invitation, organization, team, teamMember, user } from './db/schema'
import { auth } from './lib/auth'
import { adminMiddleware } from './middleware/admin'
import { authMiddleware, type AuthVariables } from './middleware/auth'
import { orgMemberMiddleware } from './middleware/org-member'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const app = new Hono<{ Variables: AuthVariables }>()

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }),
)

app.get('/', (c) => c.json({ message: 'Curved API' }))

// Better-auth routes (before auth middleware)
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

// Public: get invitation details by ID (before auth middleware)
app.get('/api/invitations/:invitationId', async (c) => {
  const { invitationId } = c.req.param()

  const inv = await db.query.invitation.findFirst({
    where: eq(invitation.id, invitationId),
    with: {
      organization: {
        columns: { id: true, name: true, slug: true, logo: true },
      },
      user: {
        columns: { name: true, image: true },
      },
    },
  })

  if (!inv || inv.status !== 'pending') {
    return c.json({ error: 'Invitation not found or no longer valid' }, 404)
  }

  return c.json({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expiresAt: inv.expiresAt,
    organization: inv.organization,
    inviter: inv.user,
  })
})

// Smart redirect: determines where to send the user based on auth state
app.get('/api/invitations/:invitationId/redirect', async (c) => {
  const { invitationId } = c.req.param()
  const acceptPath = `/invitations/accept/${invitationId}`

  const inv = await db.query.invitation.findFirst({
    where: eq(invitation.id, invitationId),
    columns: { email: true, status: true },
  })

  if (!inv || inv.status !== 'pending') {
    return c.redirect(`${FRONTEND_URL}${acceptPath}`)
  }

  // Check if user is authenticated
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (session) {
    return c.redirect(`${FRONTEND_URL}${acceptPath}`)
  }

  // Not authenticated — check if the invited email already has an account
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, inv.email),
    columns: { id: true },
  })

  if (existingUser) {
    // Existing user → sign in first
    return c.redirect(`${FRONTEND_URL}/sign-in?redirect=${encodeURIComponent(acceptPath)}`)
  }

  // New user → sign up with invitation context
  const params = new URLSearchParams({
    invitationId,
    signUpEmail: inv.email,
    redirect: acceptPath,
  })
  return c.redirect(`${FRONTEND_URL}/sign-up?${params.toString()}`)
})

// Auth middleware for all /api/* routes (except /api/auth/**)
app.use('/api/*', authMiddleware)

// Admin middleware
app.use('/api/admin/*', adminMiddleware)

// Org member middleware
app.use('/api/organizations/:orgId/*', orgMemberMiddleware)

// List teams for the active organization
app.get('/api/teams', async (c) => {
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

// Create a team
app.post('/api/teams', async (c) => {
  const session = c.get('session')
  const userId = c.get('user').id
  const orgId = session.activeOrganizationId

  if (!orgId) {
    return c.json({ error: 'No active organization' }, 400)
  }

  const { name, identifier, slug } = await c.req.json<{
    name: string
    identifier: string
    slug: string
  }>()

  if (!name || !identifier || !slug) {
    return c.json({ error: 'Name, identifier, and slug are required' }, 400)
  }

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
})

// Check slug availability
app.post('/api/organization/check-slug', async (c) => {
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
