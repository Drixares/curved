import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'

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

export default {
  port: 3000,
  fetch: app.fetch,
}
