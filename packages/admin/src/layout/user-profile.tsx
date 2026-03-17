import { Avatar, AvatarFallback, Button } from '@curved/ui'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/features/auth/use-auth'
import { getInitials } from '@/lib/utils'

export function UserProfile() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-2 px-1">
      <Avatar size="sm">
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">{user.email}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={logout}>
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
