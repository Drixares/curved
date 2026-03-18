import type { TeamMember } from '@/features/issues/hooks/use-team-members'
import type { TeamProject } from '@/features/projects/hooks/use-team-projects'
import { getInitials } from '@/shared/lib/format'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@curved/ui'
import { Tick01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

interface LeadCellProps {
  lead: TeamProject['lead']
  teamName: string
  members: TeamMember[]
  onSelect: (id: string | null) => void
}

export function LeadCell({ lead, teamName, members, onSelect }: LeadCellProps) {
  const [selectOpen, setSelectOpen] = useState(false)

  if (!lead) {
    return (
      <Popover open={selectOpen} onOpenChange={setSelectOpen}>
        <PopoverTrigger
          render={
            <button className="text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
              <Avatar size="sm">
                <AvatarFallback>
                  <HugeiconsIcon icon={UserIcon} size={12} strokeWidth={2} />
                </AvatarFallback>
              </Avatar>
            </button>
          }
        />
        <PopoverContent align="start" className="w-52 p-1">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m.id)
                setSelectOpen(false)
              }}
              className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
            >
              <Avatar size="sm">
                {m.image && <AvatarImage src={m.image} alt={m.name} />}
                <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-left">{m.name}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={selectOpen} onOpenChange={setSelectOpen}>
      <TooltipProvider delay={2000}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <button className="flex items-center justify-center">
                    <Avatar size="sm">
                      {lead.image && <AvatarImage src={lead.image} alt={lead.name} />}
                      <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
            }
          />
          {!selectOpen && (
            <TooltipContent side="bottom" className="flex flex-col gap-1.5 px-3 py-2">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  {lead.image && <AvatarImage src={lead.image} alt={lead.name} />}
                  <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{lead.name}</span>
                  <span className="text-[10px] opacity-70">{teamName}</span>
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="start" className="w-52 p-1">
        <button
          onClick={() => {
            onSelect(null)
            setSelectOpen(false)
          }}
          className="hover:bg-muted text-muted-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          No lead
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              onSelect(m.id)
              setSelectOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <Avatar size="sm">
              {m.image && <AvatarImage src={m.image} alt={m.name} />}
              <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-left">{m.name}</span>
            {lead.id === m.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
