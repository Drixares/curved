import type { Comment } from '../hooks/use-comments'
import { CommentItem } from './comment-item'
import CommentInput from './comment-input'

type CommentThreadProps = {
  comment: Comment
  onReply: (body: string, parentId: string) => void
  isReplying?: boolean
}

export default function CommentThread({ comment, onReply, isReplying }: CommentThreadProps) {
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="bg-sidebar rounded-md border">
      <div className="border-border divide-y">
        <CommentItem
          author={comment.author}
          body={comment.body}
          createdAt={comment.createdAt}
          className="px-4"
        />
        {hasReplies &&
          comment.replies.map((reply) => (
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
