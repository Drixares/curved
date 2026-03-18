import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@curved/ui'
import { authClient } from '@/shared/lib/auth-client'

const changeEmailSchema = z.object({
  newEmail: z.email('Please enter a valid email address'),
})

type ChangeEmailValues = z.infer<typeof changeEmailSchema>

interface ChangeEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangeEmailDialog({ open, onOpenChange }: ChangeEmailDialogProps) {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailValues>({
    resolver: standardSchemaResolver(changeEmailSchema),
    defaultValues: { newEmail: '' },
  })

  useEffect(() => {
    if (!open) {
      reset()
      setServerError('')
      setSuccess(false)
    }
  }, [open, reset])

  const onSubmit = async (values: ChangeEmailValues) => {
    setServerError('')

    const { error } = await authClient.changeEmail({
      newEmail: values.newEmail,
      callbackURL: `${window.location.origin}/settings/profile`,
    })

    if (error) {
      setServerError(error.message ?? 'Failed to send verification email')
      return
    }

    setSuccess(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="grid gap-4 py-4">
            <p className="text-sm text-green-600 dark:text-green-400">
              A verification link has been sent to your new email address. Please check your inbox
              and click the link to confirm the change.
            </p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <p className="text-muted-foreground text-sm">
              If you'd like to change the email address for your account, we'll send a verification
              link to your new email address. This change will apply across all workspaces that you
              are a member of.
            </p>
            <p className="text-muted-foreground text-sm">
              Please check if the new email address is tied to an existing account before proceeding
              with the change.
            </p>

            <div className="grid gap-1.5">
              <Label htmlFor="new-email">Enter the new email address you'd like to use.</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="New email address"
                {...register('newEmail')}
              />
              {errors.newEmail && (
                <p className="text-destructive text-sm">{errors.newEmail.message}</p>
              )}
            </div>

            {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Checking...' : 'Check for existing account'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
