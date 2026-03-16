import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const MIN_WIDTH = 200
const MAX_WIDTH = 300
const DEFAULT_WIDTH = 224

interface SidebarContextValue {
  effectiveWidth: number
  sidebarWidth: number
  minWidth: number
  isResizing: boolean
  handleMouseDown: (e: React.MouseEvent) => void
  handleClick: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [collapsed, setCollapsed] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      hasDragged.current = false
      startX.current = e.clientX
      startWidth.current = collapsed ? 0 : sidebarWidth
      setIsResizing(true)
    },
    [collapsed, sidebarWidth],
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = e.clientX - startX.current
      if (Math.abs(delta) > 3) hasDragged.current = true
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
      setCollapsed(false)
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!hasDragged.current) {
      setCollapsed((prev) => !prev)
    }
  }, [])

  const effectiveWidth = collapsed ? 0 : sidebarWidth

  return (
    <SidebarContext
      value={{
        effectiveWidth,
        sidebarWidth,
        minWidth: MIN_WIDTH,
        isResizing,
        handleMouseDown,
        handleClick,
      }}
    >
      {children}
    </SidebarContext>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
