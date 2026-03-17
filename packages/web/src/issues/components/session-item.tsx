import { authClient } from '@/lib/auth-client'
import { Button } from '@curved/ui'
import { BrowserIcon, LaptopIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Session } from 'better-auth'
import { toast } from 'sonner'

function parseUserAgent(ua: string | null | undefined) {
  if (!ua) return { device: 'Unknown device', icon: LaptopIcon }

  const isAndroid = /android/i.test(ua)
  const isiOS = /iphone|ipad|ipod/i.test(ua)
  const isMac = /macintosh|mac os/i.test(ua)
  const isWindows = /windows/i.test(ua)
  const isLinux = /linux/i.test(ua) && !isAndroid

  let os = 'Unknown OS'
  if (isMac) os = 'macOS'
  else if (isWindows) os = 'Windows'
  else if (isLinux) os = 'Linux'
  else if (isAndroid) os = 'Android'
  else if (isiOS) os = 'iOS'

  let browser = ''
  if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/edg/i.test(ua)) browser = 'Edge'
  else if (/chrome/i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua)) browser = 'Safari'

  const isMobile = isAndroid || isiOS
  const icon = isMobile ? SmartPhone01Icon : browser ? BrowserIcon : LaptopIcon
  const device = browser ? `${browser} on ${os}` : os

  return { device, icon }
}

function formatRelativeTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60)
    return `Last seen about ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `Last seen about ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

interface SessionItemProps {
  session: Session
}

export function SessionItem({ session }: SessionItemProps) {
  const { device, icon } = parseUserAgent(session.userAgent)
  const queryClient = useQueryClient()

  const revokeSession = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({ token })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session revoked')
    },
    onError: () => toast.error('Failed to revoke session'),
  })

  return (
    <div
      key={session.token}
      className="group flex items-center gap-3 border-b px-4 last:border-b-0"
    >
      <HugeiconsIcon
        icon={icon}
        size={20}
        strokeWidth={1.5}
        className="text-muted-foreground shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{device}</p>
        <p className="text-muted-foreground text-sm">
          {session.ipAddress && <>{session.ipAddress} · </>}
          {formatRelativeTime(new Date(session.updatedAt))}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100"
        onClick={() => revokeSession.mutate(session.token)}
        disabled={revokeSession.isPending}
      >
        Revoke
      </Button>
    </div>
  )
}
