import { useQuery } from '@tanstack/react-query'

interface InvitationDetails {
  id: string
  email: string
  role: string | null
  status: string
  expiresAt: string
  organization: { id: string; name: string; slug: string; logo: string | null }
  inviter: { name: string; image: string | null }
}

async function fetchInvitation(invitationId: string): Promise<InvitationDetails> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/invitations/${invitationId}`,
  )
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
