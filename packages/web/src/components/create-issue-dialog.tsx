import { useCreateIssueMutation } from '@/hooks/use-create-issue'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcurts'
import { useTeams, type Team } from '@/hooks/use-teams'
import { api } from '@/lib/api-client'
import { priorities, statusTypeIcons } from '@/issues/data/data'
import { useCreateIssue } from '@/stores/create-issue-store'
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
import {
  ArrowDown01Icon,
  Attachment01Icon,
  Cancel01Icon,
  TagsIcon,
  Tick01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { IssueCreatedToast } from './issue-created-toast'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  statusId: z.string().optional(),
  priority: z.string().default('none'),
  assigneeId: z.string().optional(),
  labelIds: z.array(z.string()).default([]),
})

type CreateIssueFormValues = z.infer<typeof createIssueSchema>

// ---------------------------------------------------------------------------
// Types inferred from API
// ---------------------------------------------------------------------------

const $getStatuses = api.api.teams[':teamId'].statuses.$get
type StatusesResponse = InferResponseType<typeof $getStatuses, 200>
type Status = StatusesResponse[number]

const $getLabels = api.api.teams[':teamId'].labels.$get
type LabelsResponse = InferResponseType<typeof $getLabels, 200>
type TeamLabel = LabelsResponse[number]

const $getMembers = api.api.teams[':teamId'].members.$get
type MembersResponse = InferResponseType<typeof $getMembers, 200>
type TeamMember = MembersResponse[number]

// ---------------------------------------------------------------------------
// Hooks for fetching team-specific data
// ---------------------------------------------------------------------------

function useTeamStatuses(teamId: string | null) {
  return useQuery({
    queryKey: ['team-statuses', teamId],
    queryFn: async () => {
      const res = await api.api.teams[':teamId'].statuses.$get({
        param: { teamId: teamId! },
      })
      if (!res.ok) throw new Error('Failed to fetch statuses')
      return res.json()
    },
    enabled: !!teamId,
  })
}

function useTeamLabels(teamId: string | null) {
  return useQuery({
    queryKey: ['team-labels', teamId],
    queryFn: async () => {
      const res = await api.api.teams[':teamId'].labels.$get({
        param: { teamId: teamId! },
      })
      if (!res.ok) throw new Error('Failed to fetch labels')
      return res.json()
    },
    enabled: !!teamId,
  })
}

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

export function CreateIssueDialog() {
  const { isOpen, open, close, defaultTeamId } = useCreateIssue()
  const { data: teams } = useTeams()
  const mutation = useCreateIssueMutation()

  const form = useForm<CreateIssueFormValues>({
    resolver: standardSchemaResolver(createIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      teamId: '',
      statusId: undefined,
      priority: 'none',
      assigneeId: undefined,
      labelIds: [],
    },
  })

  const teamId = form.watch('teamId')
  const statusId = form.watch('statusId')
  const priority = form.watch('priority')
  const assigneeId = form.watch('assigneeId')
  const labelIds = form.watch('labelIds')
  const [createMore, setCreateMore] = useState(false)

  const titleRef = useRef<HTMLInputElement | null>(null)
  const { ref: titleFormRef, ...titleRegister } = form.register('title')

  // Current team object
  const currentTeam = teams?.find((t) => t.id === teamId) ?? null

  // Fetch dynamic data for selected team
  const { data: statuses } = useTeamStatuses(teamId || null)
  const { data: labels } = useTeamLabels(teamId || null)
  const { data: members } = useTeamMembers(teamId || null)

  // Current status / assignee objects
  const currentStatus = statuses?.find((s) => s.id === statusId) ?? null
  const currentAssignee = members?.find((m) => m.id === assigneeId) ?? null

  // Global shortcut: C to open create issue dialog
  useKeyboardShortcuts([{ key: 'c', action: () => open() }], { enabled: !isOpen })

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

  // Set default status when statuses load
  useEffect(() => {
    if (statuses && statuses.length > 0 && !statusId) {
      const def = statuses.find((s) => s.isDefault)
      form.setValue('statusId', def?.id ?? statuses[0].id)
    }
  }, [statuses])

  function handleClose() {
    close()
    form.reset()
  }

  function onSubmit(values: CreateIssueFormValues) {
    mutation.mutate(
      {
        title: values.title.trim(),
        teamId: values.teamId,
        description: values.description?.trim() || undefined,
        statusId: values.statusId ?? undefined,
        priority: values.priority,
        assigneeId: values.assigneeId ?? undefined,
        labelIds: values.labelIds.length > 0 ? values.labelIds : undefined,
      },
      {
        onSuccess: (data) => {
          if (createMore) {
            form.reset({
              ...form.getValues(),
              title: '',
              description: '',
              statusId: undefined,
              priority: 'none',
              assigneeId: undefined,
              labelIds: [],
            })
            titleRef.current?.focus()
          } else {
            handleClose()
          }

          toast.custom(
            (t) => (
              <IssueCreatedToast
                toastId={t}
                identifier={data.teamIdentifier}
                number={data.number}
                title={data.title}
                issueId={data.id}
              />
            ),
            { duration: 6000 },
          )
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Create issue</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-sm">
            <TeamSelector
              teams={teams ?? []}
              currentTeam={currentTeam}
              onSelect={(id) => {
                form.setValue('teamId', id)
                form.setValue('statusId', undefined)
                form.setValue('assigneeId', undefined)
                form.setValue('labelIds', [])
              }}
            />
            <span className="text-muted-foreground">&gt;</span>
            <span className="text-muted-foreground">New issue</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={handleClose}>
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-2">
          <input
            ref={(el) => {
              titleFormRef(el)
              titleRef.current = el
            }}
            {...titleRegister}
            placeholder="Issue title"
            autoFocus
            className="placeholder:text-muted-foreground/60 w-full border-none bg-transparent text-base font-medium outline-none"
          />
          {form.formState.errors.title && (
            <p className="text-destructive mt-1 text-xs">{form.formState.errors.title.message}</p>
          )}
          <textarea
            value={form.watch('description') ?? ''}
            onChange={handleDescriptionChange}
            placeholder="Add description..."
            rows={1}
            className="placeholder:text-muted-foreground/40 mt-2 w-full resize-none border-none bg-transparent text-sm outline-none"
          />
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-1.5 border-t px-4 py-2.5">
          <StatusChip
            statuses={statuses ?? []}
            currentStatus={currentStatus}
            onSelect={(id) => form.setValue('statusId', id)}
          />
          <PriorityChip priority={priority} onSelect={(val) => form.setValue('priority', val)} />
          <AssigneeChip
            members={members ?? []}
            currentAssignee={currentAssignee}
            onSelect={(id) => form.setValue('assigneeId', id ?? undefined)}
          />
          <LabelsChip
            labels={labels ?? []}
            selectedIds={labelIds}
            onToggle={(id) => {
              const current = form.getValues('labelIds')
              form.setValue(
                'labelIds',
                current.includes(id) ? current.filter((l) => l !== id) : [...current, id],
              )
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <Button variant="ghost" size="icon-sm" disabled title="Attachments">
            <HugeiconsIcon icon={Attachment01Icon} size={16} strokeWidth={1.5} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="create-more" className="text-muted-foreground text-xs">
                Create more
              </Label>
              <Switch
                id="create-more"
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
              {mutation.isPending ? 'Creating...' : 'Create issue'}
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

function StatusChip({
  statuses,
  currentStatus,
  onSelect,
}: {
  statuses: Status[]
  currentStatus: Status | null
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const icon = currentStatus ? statusTypeIcons[currentStatus.type] : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            {icon && <HugeiconsIcon icon={icon} size={14} strokeWidth={2} />}
            <span>{currentStatus?.name ?? 'Status'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-48 p-1">
        {statuses.map((s) => {
          const sIcon = statusTypeIcons[s.type]
          return (
            <button
              key={s.id}
              onClick={() => {
                onSelect(s.id)
                setOpen(false)
              }}
              className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
            >
              {sIcon && <HugeiconsIcon icon={sIcon} size={14} strokeWidth={2} />}
              <span className="flex-1 text-left">{s.name}</span>
              {currentStatus?.id === s.id && (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  size={14}
                  strokeWidth={2}
                  className="text-primary"
                />
              )}
            </button>
          )
        })}
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
  const current = priorities.find((p) => p.value === priority)

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
        {priorities.map((p) => (
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
// Assignee Chip
// ---------------------------------------------------------------------------

function AssigneeChip({
  members,
  currentAssignee,
  onSelect,
}: {
  members: TeamMember[]
  currentAssignee: TeamMember | null
  onSelect: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={2} />
            <span>{currentAssignee?.name ?? 'Assignee'}</span>
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
          No assignee
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
            {currentAssignee?.id === m.id && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Labels Chip
// ---------------------------------------------------------------------------

function LabelsChip({
  labels,
  selectedIds,
  onToggle,
}: {
  labels: TeamLabel[]
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const count = selectedIds.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors">
            <HugeiconsIcon icon={TagsIcon} size={14} strokeWidth={2} />
            <span>{count > 0 ? `${count} label${count > 1 ? 's' : ''}` : 'Labels'}</span>
          </button>
        }
      />
      <PopoverContent align="start" className="w-52 p-1">
        {labels.length === 0 && (
          <p className="text-muted-foreground px-2 py-1.5 text-sm">No labels</p>
        )}
        {labels.map((l) => (
          <button
            key={l.id}
            onClick={() => onToggle(l.id)}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="flex-1 text-left">{l.name}</span>
            {selectedIds.includes(l.id) && (
              <HugeiconsIcon icon={Tick01Icon} size={14} strokeWidth={2} className="text-primary" />
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
