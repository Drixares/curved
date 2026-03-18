import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@curved/ui'
import { authClient } from '@/shared/lib/auth-client'
import { useInvitation } from '@/features/organizations/hooks/use-invitation'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function InvitationAccept() {
  const { invitationId } = useParams<{ invitationId: string }>()
  const navigate = useNavigate()
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const {
    data: invitation,
    isLoading: invitationLoading,
    error: invitationQueryError,
  } = useInvitation(invitationId)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const invitationError =
    invitationQueryError?.message ?? (!invitationId ? 'Invalid invitation link' : '')
  const loading = invitationLoading || sessionPending

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Error state
  if (invitationError || !invitation) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription>{invitationError || 'Invitation not found.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to dashboard
              </Button>
            ) : (
              <Button render={<Link to="/sign-in" />} className="w-full">
                Sign in
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAccept = async () => {
    setActionLoading(true)
    setActionError('')
    const { error } = await authClient.organization.acceptInvitation({
      invitationId: invitationId!,
    })
    if (error) {
      setActionError(error.message ?? 'Failed to accept invitation')
      setActionLoading(false)
    } else {
      await authClient.organization.setActive({ organizationId: invitation!.organization.id })
      navigate('/dashboard')
    }
  }

  const handleDecline = async () => {
    setActionLoading(true)
    setActionError('')
    const { error } = await authClient.organization.rejectInvitation({
      invitationId: invitationId!,
    })
    if (error) {
      setActionError(error.message ?? 'Failed to decline invitation')
      setActionLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  // Not logged in
  if (!session) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <Avatar className="mx-auto size-12 rounded-lg">
              {invitation.organization.logo ? (
                <AvatarImage
                  src={invitation.organization.logo}
                  alt={invitation.organization.name}
                />
              ) : null}
              <AvatarFallback className="rounded-lg text-lg">
                {getInitials(invitation.organization.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{invitation.organization.name}</CardTitle>
            <CardDescription>
              <strong>{invitation.inviter.name}</strong> invited you to join as{' '}
              {invitation.role ? <Badge variant="secondary">{invitation.role}</Badge> : 'a member'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-muted-foreground text-sm">
              Sign in or create an account to accept this invitation.
            </p>
            <Button
              render={<Link to={`/sign-in?redirect=/invitations/accept/${invitationId}`} />}
              className="w-full"
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              render={<Link to={`/sign-up?redirect=/invitations/accept/${invitationId}`} />}
              className="w-full"
            >
              Create account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Logged in
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <Avatar className="mx-auto size-12 rounded-lg">
            {invitation.organization.logo ? (
              <AvatarImage src={invitation.organization.logo} alt={invitation.organization.name} />
            ) : null}
            <AvatarFallback className="rounded-lg text-lg">
              {getInitials(invitation.organization.name)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{invitation.organization.name}</CardTitle>
          <CardDescription>
            <strong>{invitation.inviter.name}</strong> invited you to join as{' '}
            {invitation.role ? <Badge variant="secondary">{invitation.role}</Badge> : 'a member'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {actionError ? <p className="text-destructive text-sm">{actionError}</p> : null}
          <Button onClick={handleAccept} disabled={actionLoading} className="w-full">
            {actionLoading ? 'Processing...' : 'Accept invitation'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={actionLoading}
            className="w-full"
          >
            Decline
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
