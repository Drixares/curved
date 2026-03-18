import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

type TeamsResponse = InferResponseType<typeof api.api.teams.$get, 200>
export type Team = TeamsResponse[number]

async function fetchTeams() {
  const res = await api.api.teams.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch teams')
  }
  return res.json()
}

export function useTeams() {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['teams', activeOrg?.id],
    queryFn: fetchTeams,
    enabled: !!activeOrg?.id,
  })
}
