import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'

export default function ProtectedRoute() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: organizations, isPending: orgsPending } = authClient.useListOrganizations()
  const location = useLocation()

  if (sessionPending || orgsPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to={`/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (
    (!organizations || organizations.length === 0) &&
    location.pathname !== '/create-organization'
  ) {
    return <Navigate to="/create-organization" replace />
  }

  return <Outlet />
}
