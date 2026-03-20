import { authClient } from '@/shared/lib/auth-client'
import { getInitials } from '@/shared/lib/format'
import { Avatar, AvatarFallback, AvatarImage } from '@curved/ui'
import { Attachment01Icon, UploadSquare01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRef } from 'react'

type ReplyInputProps = {
  placeholder: string
  value: string
  setValue: (v: string) => void
  onSubmit: () => void
  onAttach?: (file: File) => void
  isLoading?: boolean
}

export function ReplyInput({
  placeholder,
  value,
  setValue,
  onSubmit,
  onAttach,
  isLoading,
}: ReplyInputProps) {
  const { data: session } = authClient.useSession()
  const user = session?.user
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || !onAttach) return
    for (const file of files) {
      onAttach(file)
    }
    e.target.value = ''
  }

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
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
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
