import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getAssigned = api.api['my-issues'].assigned.$get
type AssignedIssuesResponse = InferResponseType<typeof $getAssigned, 200>
export type AssignedIssue = AssignedIssuesResponse extends Array<infer T> ? T : never

async function fetchMyAssignedIssues() {
  const res = await api.api['my-issues'].assigned.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch assigned issues')
  }
  return res.json()
}

export function useMyAssignedIssues() {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['my-issues', 'assigned', activeOrg?.id],
    queryFn: fetchMyAssignedIssues,
    enabled: !!activeOrg?.id,
  })
}
