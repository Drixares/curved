import { ArrowUp01Icon, Attachment01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { ReplyInput } from './reply-input'

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
    <div className="border-input bg-sidebar rounded-md border">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm focus:outline-none"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault()
            handleSubmit()
          }
        }}
      />
      <div className="flex items-center justify-end gap-1 px-3 pb-3">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground rounded-full p-1.5 transition-colors"
        >
          <HugeiconsIcon icon={Attachment01Icon} size={18} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !value.trim()}
          className="bg-muted text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-full transition-colors disabled:opacity-40"
        >
          <HugeiconsIcon icon={ArrowUp01Icon} size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
