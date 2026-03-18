import { formatRelativeTime, getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback, AvatarImage, cn } from '@curved/ui'

export function CommentItem({
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
