import { formatRelativeTime, getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '@curved/ui'
import { useComments } from '../hooks/use-comments'
import { useCreateComment } from '../hooks/use-create-comment'
import CommentInput from './comment-input'
import CommentThread from './comment-thread'

type ActivitySectionProps = {
  issueId: string
  creator: { name: string; image: string | null }
  createdAt: string
}

export default function ActivitySection({ issueId, creator, createdAt }: ActivitySectionProps) {
  const { data: comments = [] } = useComments(issueId)
  const { mutate: createComment, isPending } = useCreateComment(issueId)

  function handleComment(body: string) {
    createComment({ body })
  }

  function handleReply(body: string, parentId: string) {
    createComment({ body, parentId })
  }

  return (
    <div>
      <h2 className="mb-4 text-sm font-medium">Activity</h2>

      <div className="mb-4 flex items-start gap-3">
        <Avatar className="size-5">
          {creator.image && <AvatarImage src={creator.image} />}
          <AvatarFallback className="text-[10px]">{getInitials(creator.name)}</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground text-xs">
          <span>{creator.name}</span> created this issue - {formatRelativeTime(createdAt)}
        </p>
      </div>

      <div className="mb-4 space-y-3">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            isReplying={isPending}
          />
        ))}
      </div>

      <CommentInput
        placeholder="Leave a comment..."
        onSubmit={handleComment}
        isLoading={isPending}
      />
    </div>
  )
}
