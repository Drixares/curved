import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db'
import { invitation, user } from '../db/schema'
import { auth } from '../lib/auth'
import type { AuthVariables } from '../middleware/auth'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const invitationRoutes = new Hono<{ Variables: AuthVariables }>()
  .get('/:invitationId', async (c) => {
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
  .get('/:invitationId/redirect', async (c) => {
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
