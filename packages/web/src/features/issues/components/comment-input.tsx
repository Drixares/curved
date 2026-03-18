import { authClient } from '@/shared/lib/auth-client'
import { getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback, AvatarImage, Button } from '@curved/ui'
import { Attachment01Icon, UploadSquare01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

type CommentInputProps = {
  placeholder: string
  onSubmit: (body: string) => void
  isLoading?: boolean
  variant?: 'default' | 'reply'
}

export default function CommentInput({
  placeholder,
  onSubmit,
  isLoading,
  variant = 'default',
}: CommentInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  if (variant === 'reply') {
    return (
      <ReplyInput
        placeholder={placeholder}
        value={value}
        setValue={setValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
      />
      {value.trim() && (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Comment'}
          </Button>
        </div>
      )}
    </div>
  )
}

function ReplyInput({
  placeholder,
  value,
  setValue,
  onSubmit,
  isLoading,
}: {
  placeholder: string
  value: string
  setValue: (v: string) => void
  onSubmit: () => void
  isLoading?: boolean
}) {
  const { data: session } = authClient.useSession()
  const user = session?.user

  return (
    <div className="flex items-center gap-2.5 py-2">
      <Avatar className="size-6 shrink-0">
        {user?.image && <AvatarImage src={user.image} />}
        <AvatarFallback className="text-[10px]">
          {user?.name ? getInitials(user.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onSubmit()
          }
        }}
        disabled={isLoading}
      />
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1 transition-colors"
        >
          <HugeiconsIcon icon={Attachment01Icon} size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors disabled:opacity-40"
        >
          <HugeiconsIcon icon={UploadSquare01Icon} size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
