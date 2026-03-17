import { app } from './app'

export type { AppType } from './app'

export default {
  port: 3000,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
