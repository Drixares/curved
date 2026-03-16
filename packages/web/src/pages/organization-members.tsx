import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@curved/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { authClient } from '@/lib/auth-client'
import { InviteMemberDialog } from '@/components/invite-member-dialog'
import { useOrganization, useInvalidateOrganization, type OrgData } from '@/hooks/use-organization'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function OrganizationMembers() {
  const { orgId } = useParams<{ orgId: string }>()
  const { data: session } = authClient.useSession()
  const { data: org, isLoading: loading } = useOrganization(orgId)
  const invalidateOrg = useInvalidateOrganization()
  const [removingMember, setRemovingMember] = useState<OrgData['members'][number] | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const handleRoleChange = async (memberId: string, role: string) => {
    await authClient.organization.updateMemberRole({ memberId, role })
    await invalidateOrg(orgId!)
  }

  const handleRemove = async () => {
    if (!removingMember) return
    await authClient.organization.removeMember({ memberIdOrEmail: removingMember.id })
    setRemovingMember(null)
    await invalidateOrg(orgId!)
  }

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
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-muted-foreground text-sm">Manage members of {org.name}</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
          Invite member
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {org.members.map((m: OrgData['members'][number]) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    {m.user.image ? <AvatarImage src={m.user.image} alt={m.user.name} /> : null}
                    <AvatarFallback className="text-[10px]">
                      {getInitials(m.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{m.user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{m.user.email}</TableCell>
              <TableCell>
                <Badge variant={m.role === 'owner' ? 'default' : 'secondary'}>{m.role}</Badge>
              </TableCell>
              <TableCell>
                {m.role !== 'owner' && m.userId !== session?.user.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.5} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {m.role === 'member' ? (
                        <DropdownMenuItem onClick={() => handleRoleChange(m.id, 'admin')}>
                          Make admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRoleChange(m.id, 'member')}>
                          Make member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setRemovingMember(m)}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!removingMember} onOpenChange={(open) => !open && setRemovingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removingMember?.user.name} from {org.name}? They will
              lose access to all organization resources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovingMember(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        orgId={orgId!}
        onSuccess={() => invalidateOrg(orgId!)}
      />
    </div>
  )
}
