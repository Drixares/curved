import { api } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getLabels = api.api.teams[':teamId'].labels.$get
type LabelsResponse = InferResponseType<typeof $getLabels, 200>
export type TeamLabel = LabelsResponse[number]

export function useTeamLabels(teamId: string | null) {
  return useQuery({
    queryKey: ['team-labels', teamId],
    queryFn: async () => {
      const res = await api.api.teams[':teamId'].labels.$get({
        param: { teamId: teamId! },
      })
      if (!res.ok) throw new Error('Failed to fetch labels')
      return res.json()
    },
    enabled: !!teamId,
  })
}
