import { api } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getMembers = api.api.teams[':teamId'].members.$get
type MembersResponse = InferResponseType<typeof $getMembers, 200>
export type TeamMember = MembersResponse[number]

export function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const res = await api.api.teams[':teamId'].members.$get({
        param: { teamId: teamId! },
      })
      if (!res.ok) throw new Error('Failed to fetch members')
      return res.json()
    },
    enabled: !!teamId,
  })
}
