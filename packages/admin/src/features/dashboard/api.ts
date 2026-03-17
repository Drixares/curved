import { request } from '@/lib/http-client'

export type Stats = {
  users: number
  organizations: number
  teams: number
  projects: number
  issues: number
}

export const dashboardApi = {
  stats: () => request<Stats>('/api/admin/stats'),
}
