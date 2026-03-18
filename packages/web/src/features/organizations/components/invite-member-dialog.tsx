import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@curved/ui'
import { authClient } from '@/shared/lib/auth-client'

const inviteSchema = z.object({
  email: z.email('Please enter a valid email'),
  role: z.enum(['member', 'admin']),
})

type InviteValues = z.infer<typeof inviteSchema>

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: string
  onSuccess?: () => void
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  orgId,
  onSuccess,
}: InviteMemberDialogProps) {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({
    resolver: standardSchemaResolver(inviteSchema),
    defaultValues: { email: '', role: 'member' },
  })

  useEffect(() => {
    if (!open) {
      reset()
      setServerError('')
      setSuccess(false)
    }
  }, [open, reset])

  const onSubmit = async (values: InviteValues) => {
    setServerError('')

    const { error } = await authClient.organization.inviteMember({
      email: values.email,
      role: values.role,
      organizationId: orgId,
    })

    if (error) {
      setServerError(error.message ?? 'Failed to send invitation')
      return
    }

    setSuccess(true)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>Send an invitation to join your organization</DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="grid gap-4 py-4 text-center">
            <p className="text-sm text-green-600 dark:text-green-400">
              Invitation sent successfully!
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false)
                  reset()
                }}
              >
                Invite another
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                defaultValue="member"
                onValueChange={(value) => setValue('role', value as 'member' | 'admin')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-destructive text-sm">{errors.role.message}</p>}
            </div>

            {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send invitation'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
