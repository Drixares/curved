import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'

import SidebarCard from '@/shared/components/sidebar-card'

export default function ProjectMilestonesCard() {
  return (
    <SidebarCard
      title="Milestones"
      action={
        <button className="text-muted-foreground hover:text-foreground">
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
        </button>
      }
    >
      <p className="text-muted-foreground text-xs leading-relaxed">
        Add milestones to organize work within your project and break it into more granular stages.
      </p>
    </SidebarCard>
  )
}
