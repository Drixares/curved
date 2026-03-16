import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { user as userTable } from '../db/schema'
import type { AuthVariables } from './auth'

export const adminMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get('user')

  const dbUser = await db.query.user.findFirst({
    where: eq(userTable.id, user.id),
    columns: { role: true },
  })

  if (!dbUser || dbUser.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await next()
})
