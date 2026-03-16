import { createAuthClient } from 'better-auth/react'
import { lastLoginMethodClient, organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  plugins: [lastLoginMethodClient(), organizationClient()],
})
