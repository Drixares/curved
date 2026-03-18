import { HugeiconsIcon } from '@hugeicons/react'
import { CubeIcon } from '@hugeicons/core-free-icons'

import { formatActivityDate } from '@/shared/lib/format'
import SidebarCard from '@/shared/components/sidebar-card'

interface ProjectActivityCardProps {
  lead: { name: string } | null
  createdAt: string
}

export default function ProjectActivityCard({ lead, createdAt }: ProjectActivityCardProps) {
  return (
    <SidebarCard
      title="Activity"
      action={
        <button className="text-muted-foreground hover:text-foreground text-xs">See all</button>
      }
    >
      <div className="flex items-start gap-2">
        <div className="bg-muted mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
          <HugeiconsIcon icon={CubeIcon} className="text-muted-foreground size-3" />
        </div>
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-medium">{lead?.name ?? 'Someone'}</span> created the
          project &middot; {formatActivityDate(createdAt)}
        </p>
      </div>
    </SidebarCard>
  )
}
