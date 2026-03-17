import { request } from '@/lib/http-client'

export type User = {
  id: string
  name: string
  email: string
  image: string | null
  emailVerified: boolean
  createdAt: string
}

export type PaginatedUsers = {
  data: User[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const usersApi = {
  list: (page = 1, limit = 20) =>
    request<PaginatedUsers>(`/api/admin/users?page=${page}&limit=${limit}`),
}
