import { InviteMemberDialog } from '@/features/organizations/components/invite-member-dialog'
import { useOrganization, type OrgData } from '@/features/organizations/hooks/use-organization'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@curved/ui'
import { Add01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function OrganizationDetail() {
  const { data: org, isLoading: loading } = useOrganization()
  const [inviteOpen, setInviteOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-muted-foreground">Organization not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 rounded-lg">
            {org.logo ? <AvatarImage src={org.logo} alt={org.name} /> : null}
            <AvatarFallback className="rounded-lg text-lg">{getInitials(org.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{org.name}</h1>
            <p className="text-muted-foreground text-sm">{org.slug}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={1.5} />
            Members
            <Badge variant="secondary">{org.members.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link to="/organization/members" />}>
              Manage
            </Button>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AvatarGroup>
            {org.members.slice(0, 5).map((m: OrgData['members'][number]) => (
              <Avatar key={m.id} className="size-8">
                {m.user.image ? <AvatarImage src={m.user.image} alt={m.user.name} /> : null}
                <AvatarFallback className="text-[10px]">{getInitials(m.user.name)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No projects yet.</p>
        </CardContent>
      </Card>

      {org ? (
        <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} orgId={org.id} />
      ) : null}
    </div>
  )
}
