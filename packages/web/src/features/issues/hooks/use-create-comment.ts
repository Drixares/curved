import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type CreateCommentPayload = {
  body: string
  parentId?: string | null
}

export function useCreateComment(issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCommentPayload) => {
      const res = await api.api.issues[':issueId'].comments.$post({
        param: { issueId },
        json: { body: payload.body, parentId: payload.parentId ?? null },
      })
      if (!res.ok) throw new Error('Failed to create comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
  })
}
