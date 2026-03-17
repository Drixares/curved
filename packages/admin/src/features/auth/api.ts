import { request } from '@/lib/http-client'

export type AdminUser = { id: string; email: string; name: string }

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<AdminUser>('/api/admin/me'),
}
