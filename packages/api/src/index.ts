import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }),
)

app.get('/', (c) => c.json({ message: 'Curved API' }))

export default {
  port: 3000,
  fetch: app.fetch,
}
