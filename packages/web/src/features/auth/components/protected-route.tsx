import { PAGES } from '@/shared/constants/pages'
import { authClient } from '@/shared/lib/auth-client'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

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
    return (
      <Navigate to={`${PAGES.SIGN_IN}?redirect=${encodeURIComponent(location.pathname)}`} replace />
    )
  }

  if ((!organizations || organizations.length === 0) && location.pathname !== PAGES.CREATE) {
    return <Navigate to={PAGES.CREATE} replace />
  }

  return <Outlet />
}
