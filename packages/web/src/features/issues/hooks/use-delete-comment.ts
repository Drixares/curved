import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteComment(issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await api.api.comments[':commentId'].$delete({
        param: { commentId },
      })
      if (!res.ok) throw new Error('Failed to delete comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] })
    },
  })
}
