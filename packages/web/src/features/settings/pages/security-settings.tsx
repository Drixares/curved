import { CurrentSession } from '@/features/settings/components/current-session'
import { OtherSessions } from '@/features/settings/components/other-sessions'
import { authClient } from '@/shared/lib/auth-client'
import { Button, Card, CardContent } from '@curved/ui'
import { FingerPrintIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function SecuritySettings() {
  const { data: currentSession } = authClient.useSession()
  const queryClient = useQueryClient()

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions()
      if (error) throw error
      return data
    },
  })

  const { data: passkeys, isLoading: passkeysLoading } = useQuery({
    queryKey: ['passkeys'],
    queryFn: async () => {
      const { data, error } = await authClient.passkey.listUserPasskeys()
      if (error) throw error
      return data
    },
  })

  const addPasskey = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.passkey.addPasskey()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      toast.success('Passkey registered')
    },
    onError: () => toast.error('Failed to register passkey'),
  })

  const deletePasskey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await authClient.passkey.deletePasskey({ id })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      toast.success('Passkey deleted')
    },
    onError: () => toast.error('Failed to delete passkey'),
  })

  const currentToken = currentSession?.session?.token
  const currentSessionData = sessions?.find((s) => s.token === currentToken)
  const otherSessions = sessions?.filter((s) => s.token !== currentToken) ?? []

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Security & access</h1>

      {/* Sessions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <p className="text-muted-foreground text-sm">Devices logged into your account</p>

        <div className="mt-3">
          {sessionsLoading ? (
            <div className="py-4">
              <p className="text-muted-foreground text-sm">Loading sessions...</p>
            </div>
          ) : (
            <>
              {currentSessionData && <CurrentSession session={currentSessionData} />}

              {otherSessions.length > 0 && <OtherSessions otherSessions={otherSessions} />}

              {!currentSessionData && otherSessions.length === 0 && (
                <CardContent className="py-4">
                  <p className="text-muted-foreground text-sm">No sessions found</p>
                </CardContent>
              )}
            </>
          )}
        </div>
      </div>

      {/* Passkeys */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">Passkeys</h2>
        <p className="text-muted-foreground text-sm">
          Passkeys are a secure way to sign in to your account
        </p>

        <Card className="mt-3">
          {passkeysLoading ? (
            <CardContent className="py-4">
              <p className="text-muted-foreground text-sm">Loading passkeys...</p>
            </CardContent>
          ) : passkeys && passkeys.length > 0 ? (
            passkeys.map((pk) => (
              <div
                key={pk.id}
                className="group flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              >
                <HugeiconsIcon
                  icon={FingerPrintIcon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-muted-foreground shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{pk.name || 'Passkey'}</p>
                  <p className="text-muted-foreground text-sm">
                    Added {new Date(pk.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-auto px-0 text-sm opacity-0 group-hover:opacity-100"
                  onClick={() => deletePasskey.mutate(pk.id)}
                  disabled={deletePasskey.isPending}
                >
                  Delete
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between px-4">
              <p className="text-muted-foreground text-sm">No passkeys registered</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addPasskey.mutate()}
                disabled={addPasskey.isPending}
              >
                New passkey
              </Button>
            </div>
          )}
          {passkeys && passkeys.length > 0 && (
            <div className="border-t px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-auto px-0 text-sm"
                onClick={() => addPasskey.mutate()}
                disabled={addPasskey.isPending}
              >
                New passkey
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
