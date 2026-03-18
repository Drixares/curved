import { TeamSelector } from '@/features/issues/components/team-selector'
import { useTeamMembers } from '@/features/issues/hooks/use-team-members'
import { useCreateProjectMutation } from '@/features/projects/hooks/use-create-project'
import { useCreateProject } from '@/features/projects/stores/create-project-store'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcurts'
import { Button, Dialog, DialogContent, DialogTitle, Label, Switch } from '@curved/ui'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { LeadChip } from './lead-chip'
import { ProjectPriorityChip } from './project-priority-chip'
import { ProjectStatusChip } from './project-status-chip'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  status: z.string(),
  priority: z.string(),
  leadId: z.string().optional(),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

export function CreateProjectDialog() {
  const { isOpen, open, close, defaultTeamId, onCreated } = useCreateProject()
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
            Date.now() - lastKeyRef.current.time < 2000
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
          onCreated?.(data.id)

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
          <ProjectStatusChip status={status} onSelect={(val) => form.setValue('status', val)} />
          <ProjectPriorityChip
            priority={priority}
            onSelect={(val) => form.setValue('priority', val)}
          />
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
