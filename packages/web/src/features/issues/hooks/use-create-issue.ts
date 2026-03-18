import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/lib/api-client'
import type { InferRequestType, InferResponseType } from 'hono/client'

type CreateIssueInput = InferRequestType<typeof api.api.issues.$post>['json']
type CreateIssueResponse = InferResponseType<typeof api.api.issues.$post, 201>

async function createIssue(input: CreateIssueInput): Promise<CreateIssueResponse> {
  const res = await api.api.issues.$post({ json: input })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(('error' in err && err.error) || 'Failed to create issue')
  }
  return res.json() as Promise<CreateIssueResponse>
}

export function useCreateIssueMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-issues'] })
    },
  })
}
