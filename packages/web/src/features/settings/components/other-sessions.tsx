import { authClient } from '@/shared/lib/auth-client'
import { Button, Card, CardContent } from '@curved/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Session } from 'better-auth'
import { toast } from 'sonner'
import { SessionItem } from './session-item'

interface OtherSessionsProps {
  otherSessions: Session[]
}

export function OtherSessions({ otherSessions }: OtherSessionsProps) {
  const queryClient = useQueryClient()

  const revokeOtherSessions = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.revokeOtherSessions()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('All other sessions revoked')
    },
    onError: () => toast.error('Failed to revoke sessions'),
  })

  return (
    <Card className="mt-3.5">
      <CardContent className="space-x-2.5 px-4">
        <div className="flex items-center justify-between border-b px-4 pb-3">
          <p className="text-muted-foreground text-sm font-medium">
            {otherSessions.length} other session{otherSessions.length > 1 ? 's' : ''}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={() => revokeOtherSessions.mutate()}
            disabled={revokeOtherSessions.isPending}
          >
            Revoke all
          </Button>
        </div>
        <div className="flex flex-col gap-2.5 pt-3">
          {otherSessions.map((session) => (
            <SessionItem session={session} key={session.token} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
