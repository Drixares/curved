import { PAGES } from '@/shared/constants/pages'
import { getInitials } from '@/shared/lib/format'
import { Tabs, TabsList, TabsTrigger } from '@curved/ui'
import { Add01Icon, CubeIcon, MoreHorizontalIcon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from 'react-router-dom'

interface ProjectDetailHeaderProps {
  projectName: string
  teamIdentifier: string
  team?: {
    name: string
    icon: string | null
  }
}

export function ProjectDetailHeader({
  projectName,
  teamIdentifier,
  team,
}: ProjectDetailHeaderProps) {
  return (
    <header className="border-border shrink-0 border-b">
      <div className="flex items-center gap-1.5 px-5 pt-3 pb-0 text-sm">
        {team && (
          <>
            <Link
              to={PAGES.PROJECTS(teamIdentifier)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              {team.icon ? (
                <span className="text-sm">{team.icon}</span>
              ) : (
                <span className="bg-muted flex size-4 items-center justify-center rounded text-[8px] font-medium">
                  {getInitials(team.name)}
                </span>
              )}
              {team.name}
            </Link>
            <span className="text-muted-foreground">&gt;</span>
          </>
        )}
        <span className="text-muted-foreground flex items-center gap-1.5">
          <HugeiconsIcon icon={CubeIcon} className="size-4" />
          {projectName}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors">
            <HugeiconsIcon icon={StarIcon} className="size-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors">
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
          </button>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="px-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="add" disabled>
            <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </header>
  )
}
