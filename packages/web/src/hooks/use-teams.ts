import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export interface Team {
  id: string
  name: string
  slug: string
  identifier: string
  icon: string | null
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${API_URL}/api/teams`, {
    credentials: 'include',
  })
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
