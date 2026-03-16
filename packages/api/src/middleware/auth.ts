import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth'

type AuthSession = typeof auth.$Infer.Session

export type AuthVariables = {
  user: AuthSession['user']
  session: AuthSession['session']
}

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})
