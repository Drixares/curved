import type { TeamProject } from '@/features/projects/hooks/use-team-projects'
import { useCreateProject } from '@/features/projects/stores/create-project-store'
import { Popover, PopoverContent, PopoverTrigger } from '@curved/ui'
import { Add01Icon, Folder01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

export function ProjectChip({
  projects,
  currentProject,
  teamId,
  onSelect,
}: {
  projects: TeamProject[]
  currentProject: TeamProject | null
  teamId?: string
  onSelect: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const openCreateProject = useCreateProject((s) => s.open)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            <HugeiconsIcon icon={Folder01Icon} size={14} strokeWidth={2} />
            <span>{currentProject?.name ?? 'Project'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-52 p-1">
        <button
          onClick={() => {
            onSelect(null)
            setOpen(false)
          }}
          className="hover:bg-muted text-muted-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
        >
          No project
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              onSelect(p.id)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <span className="flex-1 text-left">{p.name}</span>
            {currentProject?.id === p.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
        <div className="border-border mt-1 border-t pt-1">
          <button
            onClick={() => {
              setOpen(false)
              openCreateProject(teamId, (projectId) => onSelect(projectId))
            }}
            className="hover:bg-muted text-muted-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
            <span>Create project</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
