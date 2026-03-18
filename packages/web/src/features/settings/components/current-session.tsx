import { Card, CardContent } from '@curved/ui'
import { BrowserIcon, LaptopIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Session } from 'better-auth'

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

export function CurrentSession({ session }: { session: Session }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 px-4">
        <HugeiconsIcon
          icon={parseUserAgent(session.userAgent).icon}
          size={20}
          strokeWidth={1.5}
          className="text-muted-foreground shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{parseUserAgent(session.userAgent).device}</p>
          <p className="text-sm">
            <span className="font-medium text-green-600">Current session</span>
            {session.ipAddress && (
              <span className="text-muted-foreground"> · {session.ipAddress}</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
