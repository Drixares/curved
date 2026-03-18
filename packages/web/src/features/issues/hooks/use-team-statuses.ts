import { api } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getStatuses = api.api.teams[':teamId'].statuses.$get
type StatusesResponse = InferResponseType<typeof $getStatuses, 200>
export type Status = StatusesResponse[number]

export function useTeamStatuses(teamId: string | null) {
  return useQuery({
    queryKey: ['team-statuses', teamId],
    queryFn: async () => {
      const res = await api.api.teams[':teamId'].statuses.$get({
        param: { teamId: teamId! },
      })
      if (!res.ok) throw new Error('Failed to fetch statuses')
      return res.json()
    },
    enabled: !!teamId,
  })
}
