import { api } from '@/shared/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UploadAttachmentInput = {
  file: File
}

export function useUploadAttachment(issueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file }: UploadAttachmentInput) => {
      // 1. Request presigned URL + register metadata
      const res = await api.api.issues[':issueId'].attachments.$post({
        param: { issueId },
        json: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
        },
      })
      if (!res.ok) throw new Error('Failed to create attachment')
      const { id, uploadUrl } = await res.json()

      // 2. Upload file directly to S3 via presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })
      if (!uploadRes.ok) throw new Error('Failed to upload file to S3')

      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', issueId] })
    },
  })
}
