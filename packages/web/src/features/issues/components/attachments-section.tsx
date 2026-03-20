import { formatFileSize, formatRelativeTime, isImageMimeType } from '@/shared/lib/format'
import { Cancel01Icon, File01Icon, Image01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRef } from 'react'
import { useAttachments } from '../hooks/use-attachments'
import { useDeleteAttachment } from '../hooks/use-delete-attachment'
import { useUploadAttachment } from '../hooks/use-upload-attachment'

type AttachmentsSectionProps = {
  issueId: string
}

export default function AttachmentsSection({ issueId }: AttachmentsSectionProps) {
  const { data: attachments = [] } = useAttachments(issueId)
  const { mutate: uploadAttachment, isPending: isUploading } = useUploadAttachment(issueId)
  const { mutate: deleteAttachment } = useDeleteAttachment(issueId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of files) {
      uploadAttachment({ file })
    }
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Attachments{attachments.length > 0 && ` (${attachments.length})`}
        </h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-muted-foreground hover:text-foreground text-xs transition-colors disabled:opacity-40"
        >
          {isUploading ? 'Uploading...' : 'Add file'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {attachments.length === 0 && !isUploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border-input text-muted-foreground hover:border-foreground/20 hover:text-foreground w-full rounded-md border border-dashed px-4 py-6 text-center text-sm transition-colors"
        >
          Drop files here or click to upload
        </button>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="border-input bg-sidebar group flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <div className="text-muted-foreground shrink-0">
                <HugeiconsIcon
                  icon={isImageMimeType(attachment.mimeType) ? Image01Icon : File01Icon}
                  size={18}
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={attachment.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground block truncate text-sm font-medium"
                >
                  {attachment.fileName}
                </a>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(attachment.fileSize)} · {formatRelativeTime(attachment.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteAttachment(attachment.id)}
                className="text-muted-foreground hover:text-destructive shrink-0 p-1 opacity-0 transition-all group-hover:opacity-100"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
