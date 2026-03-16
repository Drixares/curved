import { Navigate, Outlet } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'

export default function GuestRoute() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
