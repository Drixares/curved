import { authClient } from '@/shared/lib/auth-client'
import { ChangeEmailDialog } from '@/features/settings/components/change-email-dialog'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Label } from '@curved/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileSettings() {
  const { data: session } = authClient.useSession()

  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const initialized = useRef(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (session?.user && !initialized.current) {
      setName(session.user.name)
      setImage(session.user.image ?? '')
      initialized.current = true
    }
  }, [session])

  const save = useCallback(async (fields: { name?: string; image?: string }) => {
    const { error } = await authClient.updateUser(fields)
    if (error) {
      toast.error('Failed to save profile')
    } else {
      toast.success('Profile saved')
    }
  }, [])

  const debouncedSave = useCallback(
    (fields: { name?: string; image?: string }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => save(fields), 400)
    },
    [save],
  )

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  if (!session) return null

  const user = session.user

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-full">
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback className="text-lg">{getInitials(name || user.name)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              const val = e.target.value
              setName(val)
              if (val.trim()) debouncedSave({ name: val })
            }}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2">
            <Input id="email" type="email" value={user.email} disabled className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEmailDialogOpen(true)}
              aria-label="Change email"
            >
              <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ChangeEmailDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
    </div>
  )
}
