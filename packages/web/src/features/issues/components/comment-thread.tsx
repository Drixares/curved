import { getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback, AvatarImage, cn } from '@curved/ui'
import type { Comment } from '../hooks/use-comments'
import CommentInput from './comment-input'

type CommentThreadProps = {
  comment: Comment
  onReply: (body: string, parentId: string) => void
  isReplying?: boolean
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function CommentItem({
  author,
  body,
  createdAt,
  className,
  isReply,
}: {
  author: { name: string; image: string | null }
  body: string
  createdAt: string
  className?: string
  isReply?: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-1.5 py-2.5', className)}>
      <div className="flex items-center gap-2.5">
        <Avatar className="size-6 shrink-0">
          {author.image && <AvatarImage src={author.image} />}
          <AvatarFallback className="text-[10px]">{getInitials(author.name)}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 text-sm">
          <span>{author.name}</span>
          <span className="text-muted-foreground">{formatRelativeTime(createdAt)}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-base whitespace-pre-wrap', isReply && 'pl-9')}>{body}</p>
      </div>
    </div>
  )
}

export default function CommentThread({ comment, onReply, isReplying }: CommentThreadProps) {
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="bg-sidebar rounded-md border">
      <CommentItem
        author={comment.author}
        body={comment.body}
        createdAt={comment.createdAt}
        className="border-b px-4"
      />

      {hasReplies && (
        <div className="border-border divide-y">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              author={reply.author}
              body={reply.body}
              createdAt={reply.createdAt}
              isReply
              className="px-4"
            />
          ))}
        </div>
      )}

      <div className="w-full border-t px-4">
        <CommentInput
          placeholder="Leave a reply..."
          onSubmit={(body) => onReply(body, comment.id)}
          isLoading={isReplying}
          variant="reply"
        />
      </div>
    </div>
  )
}
