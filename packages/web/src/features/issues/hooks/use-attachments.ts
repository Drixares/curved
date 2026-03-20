import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getAttachments = api.api.issues[':issueId'].attachments.$get
export type Attachment = InferResponseType<typeof $getAttachments, 200>[number]

async function fetchAttachments(issueId: string) {
  const res = await api.api.issues[':issueId'].attachments.$get({
    param: { issueId },
  })
  if (!res.ok) throw new Error('Failed to fetch attachments')
  return res.json()
}

export function useAttachments(issueId: string | undefined) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['attachments', issueId],
    queryFn: () => fetchAttachments(issueId!),
    enabled: !!issueId && !!activeOrg?.id,
  })
}
