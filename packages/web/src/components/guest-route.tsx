import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { authClient } from '@/lib/auth-client'

export default function GuestRoute() {
  const { data: session, isPending } = authClient.useSession()
  const [searchParams] = useSearchParams()

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (session) {
    const redirect = searchParams.get('redirect') || '/dashboard'
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}
