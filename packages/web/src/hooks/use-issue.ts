import { api } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getIssue = api.api.issues[':issueId'].$get
export type IssueDetail = InferResponseType<typeof $getIssue, 200>

async function fetchIssue(issueId: string) {
  const res = await api.api.issues[':issueId'].$get({ param: { issueId } })
  if (!res.ok) {
    throw new Error('Failed to fetch issue')
  }

  return res.json()
}

export function useIssue(issueId: string | undefined) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => fetchIssue(issueId!),
    enabled: !!issueId && !!activeOrg?.id,
  })
}
