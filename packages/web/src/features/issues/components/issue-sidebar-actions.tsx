import { Button, Kbd, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@curved/ui'
import { Copy01Icon, Link01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { copyWithToast } from '@/shared/components/custom-toast'
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard'
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcurts'

interface IssueSidebarActionsProps {
  identifier: string
}

export default function IssueSidebarActions({ identifier }: IssueSidebarActionsProps) {
  const { copy } = useCopyToClipboard()

  useKeyboardShortcuts([
    { key: 'cmd+shift+c', action: () => copyWithToast(copy, identifier, 'Issue ID copied') },
    { key: 'cmd+shift+l', action: () => copyWithToast(copy, window.location.href, 'Link copied') },
  ])

  return (
    <TooltipProvider>
      <div className="mb-3 flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyWithToast(copy, identifier, 'Issue ID copied')}
              />
            }
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            Copy issue ID
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>C</Kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyWithToast(copy, window.location.href, 'Link copied')}
              />
            }
          >
            <HugeiconsIcon icon={Link01Icon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>
            Copy link
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>L</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
