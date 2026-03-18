import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UpdateIssuePayload = {
  title?: string
  description?: string | null
  statusId?: string
  priority?: string
  assigneeId?: string | null
  projectId?: string | null
  labelIds?: string[]
}

export function useUpdateIssue(issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateIssuePayload) => {
      const res = await api.api.issues[':issueId'].$patch({
        param: { issueId },
        json: payload,
      })
      if (!res.ok) throw new Error('Failed to update issue')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] })
    },
  })
}
