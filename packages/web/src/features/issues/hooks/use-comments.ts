import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getComments = api.api.issues[':issueId'].comments.$get
export type Comment = InferResponseType<typeof $getComments, 200>[number]

async function fetchComments(issueId: string) {
  const res = await api.api.issues[':issueId'].comments.$get({
    param: { issueId },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch comments')
  }
  return res.json()
}

export function useComments(issueId: string | undefined) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => fetchComments(issueId!),
    enabled: !!issueId && !!activeOrg?.id,
  })
}
