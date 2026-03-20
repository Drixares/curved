import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useDeleteAttachment(issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await api.api.attachments[':attachmentId'].$delete({
        param: { attachmentId },
      })
      if (!res.ok) throw new Error('Failed to delete attachment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', issueId] })
    },
  })
}
