import { useCreateProjectMutation } from '@/features/projects/hooks/use-create-project'
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcurts'
import { useTeams, type Team } from '@/features/teams/hooks/use-teams'
import { projectStatuses, projectPriorities } from '@/features/projects/data/data'
import { useCreateProject } from '@/features/projects/stores/create-project-store'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from '@curved/ui'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ArrowDown01Icon, Cancel01Icon, Tick01Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '@/shared/lib/api-client'
import type { InferResponseType } from 'hono/client'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  status: z.string(),
  priority: z.string(),
  leadId: z.string().optional(),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

// ---------------------------------------------------------------------------
// Types inferred from API
// ---------------------------------------------------------------------------

const $getMembers = api.api.teams[':teamId'].members.$get
type MembersResponse = InferResponseType<typeof $getMembers, 200>
type TeamMember = MembersResponse[number]

// ---------------------------------------------------------------------------
// Hooks for fetching team-specific data
// ---------------------------------------------------------------------------

function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const res = await api.api.teams[':teamId'].members.$get({
        param: { teamId: teamId! },
      })
      if (!res.ok) throw new Error('Failed to fetch members')
      return res.json()
    },
    enabled: !!teamId,
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateProjectDialog() {
  const { isOpen, open, close, defaultTeamId } = useCreateProject()
  const { data: teams } = useTeams()
  const mutation = useCreateProjectMutation()

  const form = useForm<CreateProjectFormValues>({
    resolver: standardSchemaResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      teamId: '',
      status: 'backlog',
      priority: 'none',
      leadId: undefined,
    },
  })

  const teamId = form.watch('teamId')
  const status = form.watch('status')
  const priority = form.watch('priority')
  const leadId = form.watch('leadId')
  const [createMore, setCreateMore] = useState(false)

  const nameRef = useRef<HTMLInputElement | null>(null)
  const { ref: nameFormRef, ...nameRegister } = form.register('name')

  const currentTeam = teams?.find((t) => t.id === teamId) ?? null

  const { data: members } = useTeamMembers(teamId || null)

  const currentLead = members?.find((m) => m.id === leadId) ?? null

  // Global shortcut: N then P to open create project dialog
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null)

  useKeyboardShortcuts(
    [
      {
        key: 'n',
        action: () => {
          lastKeyRef.current = { key: 'n', time: Date.now() }
        },
      },
      {
        key: 'p',
        action: () => {
          if (
            lastKeyRef.current &&
            lastKeyRef.current.key === 'n' &&
            Date.now() - lastKeyRef.current.time < 500
          ) {
            lastKeyRef.current = null
            open()
          }
        },
      },
    ],
    { enabled: !isOpen },
  )

  // Initialize team when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (defaultTeamId) {
        form.setValue('teamId', defaultTeamId)
      } else if (teams && teams.length > 0 && !teamId) {
        form.setValue('teamId', teams[0].id)
      }
    }
  }, [isOpen, defaultTeamId, teams])

  function handleClose() {
    close()
    form.reset()
  }

  function onSubmit(values: CreateProjectFormValues) {
    mutation.mutate(
      {
        name: values.name.trim(),
        teamId: values.teamId,
        description: values.description?.trim() || undefined,
        status: values.status,
        priority: values.priority,
        leadId: values.leadId ?? undefined,
      },
      {
        onSuccess: (data) => {
          if (createMore) {
            form.reset({
              ...form.getValues(),
              name: '',
              description: '',
              status: 'backlog',
              priority: 'none',
              leadId: undefined,
            })
            nameRef.current?.focus()
          } else {
            handleClose()
          }

          toast.success(`Project "${data.name}" created`)
        },
      },
    )
  }

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useKeyboardShortcuts(
    [
      { key: 'cmd+enter', action: () => form.handleSubmit(onSubmit)() },
      { key: 'ctrl+enter', action: () => form.handleSubmit(onSubmit)() },
    ],
    { enabled: isOpen, ignoreInputs: false },
  )

  // Auto-resize textarea
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      form.setValue('description', e.target.value)
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    },
    [form],
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="bg-accent gap-0 p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Create project</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-sm">
            <TeamSelector
              teams={teams ?? []}
              currentTeam={currentTeam}
              onSelect={(id) => {
                form.setValue('teamId', id)
                form.setValue('leadId', undefined)
              }}
            />
            <span className="text-muted-foreground">&gt;</span>
            <span className="text-muted-foreground">New project</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={handleClose}>
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <input
            ref={(el) => {
              nameFormRef(el)
              nameRef.current = el
            }}
            {...nameRegister}
            placeholder="Project name"
            autoFocus
            className="placeholder:text-muted-foreground/60 w-full border-none bg-transparent text-base font-medium outline-none"
          />
          {form.formState.errors.name && (
            <p className="text-destructive mt-1 text-xs">{form.formState.errors.name.message}</p>
          )}
          <textarea
            value={form.watch('description') ?? ''}
            onChange={handleDescriptionChange}
            placeholder="Add description..."
            rows={3}
            className="placeholder:text-muted-foreground/40 mt-2 w-full resize-none border-none bg-transparent text-base outline-none"
          />
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-2.5">
          <StatusChip status={status} onSelect={(val) => form.setValue('status', val)} />
          <PriorityChip priority={priority} onSelect={(val) => form.setValue('priority', val)} />
          <LeadChip
            members={members ?? []}
            currentLead={currentLead}
            onSelect={(id) => form.setValue('leadId', id ?? undefined)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="create-more-project" className="text-muted-foreground text-xs">
                Create more
              </Label>
              <Switch
                id="create-more-project"
                size="sm"
                checked={createMore}
                onCheckedChange={setCreateMore}
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              {mutation.isPending ? 'Creating...' : 'Create project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TeamSelector({
  teams,
  currentTeam,
  onSelect,
}: {
  teams: Team[]
  currentTeam: Team | null
  onSelect: (teamId: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="hover:bg-muted flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors">
            {currentTeam?.icon && <span className="text-xs">{currentTeam.icon}</span>}
            <span className="font-medium">{currentTeam?.identifier ?? 'Team'}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={12}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          </button>
        }
      />
      <PopoverContent align="start" className="w-48 gap-0 p-1">
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onSelect(t.id)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            {t.icon ? (
              <span className="text-xs">{t.icon}</span>
            ) : (
              <span className="bg-muted flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium">
                {t.name.charAt(0)}
              </span>
            )}
            <span className="flex-1 text-left">{t.name}</span>
            {currentTeam?.id === t.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Status Chip
// ---------------------------------------------------------------------------

function StatusChip({ status, onSelect }: { status: string; onSelect: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const current = projectStatuses.find((s) => s.value === status)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            {current && <HugeiconsIcon icon={current.icon} size={14} strokeWidth={2} />}
            <span>{current?.label ?? 'Status'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-48 p-1">
        {projectStatuses.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              onSelect(s.value)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <HugeiconsIcon icon={s.icon} size={14} strokeWidth={2} />
            <span className="flex-1 text-left">{s.label}</span>
            {status === s.value && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Priority Chip
// ---------------------------------------------------------------------------

function PriorityChip({
  priority,
  onSelect,
}: {
  priority: string
  onSelect: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = projectPriorities.find((p) => p.value === priority)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            {current && <HugeiconsIcon icon={current.icon} size={14} strokeWidth={2} />}
            <span>{current?.label ?? 'Priority'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-44 p-1">
        {projectPriorities.map((p) => (
          <button
            key={p.value}
            onClick={() => {
              onSelect(p.value)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <HugeiconsIcon icon={p.icon} size={14} strokeWidth={2} />
            <span className="flex-1 text-left">{p.label}</span>
            {priority === p.value && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Lead Chip
// ---------------------------------------------------------------------------

function LeadChip({
  members,
  currentLead,
  onSelect,
}: {
  members: TeamMember[]
  currentLead: TeamMember | null
  onSelect: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} />
            <span>{currentLead?.name ?? 'Lead'}</span>
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
          No lead
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              onSelect(m.id)
              setOpen(false)
            }}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <span className="flex-1 text-left">{m.name}</span>
            {currentLead?.id === m.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
