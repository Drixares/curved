import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { authMiddleware, type AuthVariables } from './middleware/auth'
import { adminMiddleware } from './middleware/admin'
import { orgMemberMiddleware } from './middleware/org-member'
import { invitationRoutes } from './routes/invitations'
import { teamRoutes } from './routes/teams'
import { issueRoutes } from './routes/issues'
import { myIssueRoutes } from './routes/my-issues'
import { organizationRoutes } from './routes/organization'

const app = new Hono<{ Variables: AuthVariables }>()

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }),
)

app.get('/', (c) => c.json({ message: 'Curved API' }))

// Better-auth routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

// Public routes (before auth middleware)
// Then auth middleware + protected routes
const routes = app
  .route('/api/invitations', invitationRoutes)
  .use('/api/*', authMiddleware)
  .use('/api/admin/*', adminMiddleware)
  .use('/api/organizations/:orgId/*', orgMemberMiddleware)
  .route('/api/teams', teamRoutes)
  .route('/api/issues', issueRoutes)
  .route('/api/my-issues', myIssueRoutes)
  .route('/api/organization', organizationRoutes)

export type AppType = typeof routes

export default {
  port: 3000,
  fetch: app.fetch,
}
