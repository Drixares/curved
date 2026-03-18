import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { authMiddleware, type AuthVariables } from './middleware/auth'
import { orgMemberMiddleware } from './middleware/org-member'
import { invitationRoutes } from './routes/invitations'
import { teamRoutes } from './routes/teams'
import { issueRoutes } from './routes/issues'
import { myIssueRoutes } from './routes/my-issues'
import { projectRoutes } from './routes/projects'
import { organizationRoutes } from './routes/organization'
import { adminRoutes } from './routes/admin'

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : DEFAULT_ORIGINS

const app = new Hono<{ Variables: AuthVariables }>()

app.use(
  '/*',
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
)

app.get('/', (c) => c.json({ message: 'Curved API' }))

// Better-auth routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

// Admin routes (separate auth system — no better-auth)
app.route('/api/admin', adminRoutes)

// Public routes (before auth middleware)
// Then auth middleware + protected routes
const routes = app
  .route('/api/invitations', invitationRoutes)
  .use('/api/*', authMiddleware)
  .use('/api/organizations/:orgId/*', orgMemberMiddleware)
  .route('/api/teams', teamRoutes)
  .route('/api/issues', issueRoutes)
  .route('/api/projects', projectRoutes)
  .route('/api/my-issues', myIssueRoutes)
  .route('/api/organization', organizationRoutes)

export { app }
export type AppType = typeof routes
