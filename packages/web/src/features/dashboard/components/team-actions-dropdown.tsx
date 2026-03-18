import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@curved/ui'
import { CopyLinkIcon, MoreHorizontalIcon, Settings01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useNavigate } from 'react-router-dom'

import type { Team } from '@/features/teams/hooks/use-teams'
import { TEAM_PAGES } from '@/shared/constants/pages'
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard'

interface TeamActionsDropdownProps {
  team: Team
}

export default function TeamActionsDropdown({ team }: TeamActionsDropdownProps) {
  const navigate = useNavigate()
  const { copy } = useCopyToClipboard()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground size-6 shrink-0 opacity-0 transition-opacity group-hover/team:opacity-100 data-[popup-open]:opacity-100"
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={4} className="w-48">
        <DropdownMenuItem onClick={() => copy(`${window.location.origin}/team/${team.identifier}`)}>
          <HugeiconsIcon icon={CopyLinkIcon} size={16} strokeWidth={1.5} />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(TEAM_PAGES.SETTINGS(team.identifier))}>
          <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} />
          Team settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
