import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Home09Icon,
  Task01Icon,
  Settings01Icon,
  Add01Icon,
  ArrowMoveRightDownIcon,
} from '@hugeicons/core-free-icons'
import { useCommandMenu } from '@/stores/command-menu-store'

const pages = [
  { to: '/dashboard', label: 'Dashboard', icon: Home09Icon },
  { to: '/tasks', label: 'Tasks', icon: Task01Icon },
  { to: '/settings', label: 'Settings', icon: Settings01Icon },
]

const actions = [
  { id: 'create-issue', label: 'Create issue', icon: Add01Icon },
  { id: 'create-project', label: 'Create project', icon: Add01Icon },
  { id: 'move-project', label: 'Move project to team', icon: ArrowMoveRightDownIcon },
]

export function CommandMenu() {
  const navigate = useNavigate()
  const { isOpen, close, toggle } = useCommandMenu()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  function handleSelect(to: string) {
    navigate(to)
    close()
  }

  function handleAction(_id: string) {
    // TODO: implement actions
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
