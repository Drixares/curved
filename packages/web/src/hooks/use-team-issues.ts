import { api } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getTeamIssues = api.api.teams[':teamId'].issues.$get
type TeamIssuesResponse = InferResponseType<typeof $getTeamIssues, 200>
export type TeamIssue = TeamIssuesResponse extends Array<infer T> ? T : never

async function fetchTeamIssues(teamId: string) {
  const res = await api.api.teams[':teamId'].issues.$get({
    param: { teamId },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch team issues')
  }
  return res.json()
}

export function useTeamIssues(teamId: string | undefined) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['team-issues', teamId, activeOrg?.id],
    queryFn: () => fetchTeamIssues(teamId!),
    enabled: !!teamId && !!activeOrg?.id,
  })
}
