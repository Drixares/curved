import { useCreateIssue } from '@/features/issues/stores/create-issue-store'
import { useCreateProject } from '@/features/projects/stores/create-project-store'
import { PAGES } from '@/shared/constants/pages'
import { useCommandMenu } from '@/shared/stores/command-menu-store'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@curved/ui'
import {
  Add01Icon,
  ArrowMoveRightDownIcon,
  Settings01Icon,
  Task01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcurts'
import { useNavigate } from 'react-router-dom'

const pages = [
  { to: PAGES.MY_ASSIGNED, label: 'My Issues', icon: Task01Icon },
  { to: PAGES.ROOT, label: 'Settings', icon: Settings01Icon },
]

const actions = [
  { id: 'create-issue', label: 'Create issue', icon: Add01Icon },
  { id: 'create-project', label: 'Create project', icon: Add01Icon },
  { id: 'move-project', label: 'Move project to team', icon: ArrowMoveRightDownIcon },
]

export function CommandMenu() {
  const navigate = useNavigate()
  const { isOpen, close, toggle } = useCommandMenu()
  const openCreateIssue = useCreateIssue((s) => s.open)
  const openCreateProject = useCreateProject((s) => s.open)

  useKeyboardShortcuts([{ key: 'cmd+k', action: toggle }], { ignoreInputs: false })

  function handleSelect(to: string) {
    navigate(to)
    close()
  }

  function handleAction(id: string) {
    if (id === 'create-issue') {
      openCreateIssue()
    } else if (id === 'create-project') {
      openCreateProject()
    }
    close()
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <Command>
        <CommandInput placeholder="Search pages, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page.to} onSelect={() => handleSelect(page.to)}>
                <HugeiconsIcon icon={page.icon} size={16} strokeWidth={1.5} />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            {actions.map((action) => (
              <CommandItem key={action.id} onSelect={() => handleAction(action.id)}>
                <HugeiconsIcon icon={action.icon} size={16} strokeWidth={1.5} />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
