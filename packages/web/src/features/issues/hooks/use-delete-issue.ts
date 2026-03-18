import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (issueId: string) => {
      const res = await api.api.issues[':issueId'].$delete({
        param: { issueId },
      })
      if (!res.ok) throw new Error('Failed to delete issue')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-issues'] })
      queryClient.invalidateQueries({ queryKey: ['team-issues'] })
    },
  })
}
