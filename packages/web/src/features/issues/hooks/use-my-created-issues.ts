import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'

async function fetchMyCreatedIssues() {
  const res = await api.api['my-issues'].created.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch created issues')
  }
  return res.json()
}

export function useMyCreatedIssues() {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['my-issues', 'created', activeOrg?.id],
    queryFn: fetchMyCreatedIssues,
    enabled: !!activeOrg?.id,
  })
}
