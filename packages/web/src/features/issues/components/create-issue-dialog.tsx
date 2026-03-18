import { useCreateIssueMutation } from '@/features/issues/hooks/use-create-issue'
import { useTeamLabels } from '@/features/issues/hooks/use-team-labels'
import { useTeamMembers } from '@/features/issues/hooks/use-team-members'
import { useTeamStatuses } from '@/features/issues/hooks/use-team-statuses'
import { useCreateIssue } from '@/features/issues/stores/create-issue-store'
import { useTeams } from '@/features/teams/hooks/use-teams'
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcurts'
import { Button, Dialog, DialogContent, DialogTitle, Label, Switch } from '@curved/ui'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Attachment01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AssigneeChip } from './assignee-chip'
import { IssueCreatedToast } from './issue-created-toast'
import { LabelsChip } from './labels-chip'
import { PriorityChip } from './priority-chip'
import { StatusChip } from './status-chip'
import { TeamSelector } from './team-selector'

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  statusId: z.string().optional(),
  priority: z.string(),
  assigneeId: z.string().optional(),
  labelIds: z.array(z.string()),
})

type CreateIssueFormValues = z.infer<typeof createIssueSchema>

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="bg-accent gap-0 p-0 sm:max-w-2xl">
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
        <div className="px-4 py-3">
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
            rows={3}
            className="placeholder:text-muted-foreground/40 mt-2 w-full resize-none border-none bg-transparent text-base outline-none"
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
