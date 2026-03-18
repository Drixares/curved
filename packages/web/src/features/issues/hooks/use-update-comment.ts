import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateComment(issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, body }: { commentId: string; body: string }) => {
      const res = await api.api.comments[':commentId'].$patch({
        param: { commentId },
        json: { body },
      })
      if (!res.ok) throw new Error('Failed to update comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
  })
}
