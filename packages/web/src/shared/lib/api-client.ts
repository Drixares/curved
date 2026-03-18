import { hc } from 'hono/client'
import type { AppType } from '@curved/api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = hc<AppType>(API_URL, {
  init: {
    credentials: 'include',
  },
})
