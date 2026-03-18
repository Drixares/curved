import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getTeamProjects = api.api.teams[':teamId'].projects.$get
type TeamProjectsResponse = InferResponseType<typeof $getTeamProjects, 200>
export type TeamProject = TeamProjectsResponse extends Array<infer T> ? T : never

async function fetchTeamProjects(teamId: string) {
  const res = await api.api.teams[':teamId'].projects.$get({
    param: { teamId },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch team projects')
  }
  return res.json()
}

export function useTeamProjects(teamId: string | undefined) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['team-projects', teamId, activeOrg?.id],
    queryFn: () => fetchTeamProjects(teamId!),
    enabled: !!teamId && !!activeOrg?.id,
  })
}
