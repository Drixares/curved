import { useEffect, useRef, useState } from 'react'

export function InlineEditableTextarea({
  value,
  placeholder,
  onSave,
}: {
  value: string
  placeholder: string
  onSave: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [draft])

  function handleBlur() {
    const trimmed = draft.trim()
    if (trimmed !== value) {
      onSave(trimmed)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setDraft(value)
      textareaRef.current?.blur()
    }
  }

  return (
    <textarea
      ref={textareaRef}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="placeholder:text-muted-foreground/50 w-full cursor-text resize-none border-none bg-transparent text-sm leading-relaxed outline-none placeholder:italic"
      rows={1}
    />
  )
}
