import { api } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getInvitation = api.api.invitations[':invitationId'].$get
export type InvitationDetails = InferResponseType<typeof $getInvitation, 200>

async function fetchInvitation(invitationId: string) {
  const res = await api.api.invitations[':invitationId'].$get({
    param: { invitationId },
  })
  if (!res.ok) {
    throw new Error('This invitation is no longer valid or has expired.')
  }
  return res.json()
}

export function useInvitation(invitationId: string | undefined) {
  return useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: () => fetchInvitation(invitationId!),
    enabled: !!invitationId,
  })
}
