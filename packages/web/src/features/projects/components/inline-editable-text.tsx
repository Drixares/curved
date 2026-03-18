import { useEffect, useRef, useState } from 'react'

export function InlineEditableText({
  value,
  placeholder,
  onSave,
  className,
}: {
  value: string
  placeholder: string
  onSave: (value: string) => void
  className?: string
}) {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  function handleBlur() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setDraft(value)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setDraft(value)
      inputRef.current?.blur()
    }
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`placeholder:text-muted-foreground/50 w-full cursor-text border-none bg-transparent outline-none ${className ?? ''}`}
    />
  )
}
