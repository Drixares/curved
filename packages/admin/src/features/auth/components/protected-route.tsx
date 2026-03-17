import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../use-auth'
import { Loading } from '@/components/loading'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Loading />
  if (!user) return <Navigate to="/sign-in" replace />

  return <Outlet />
}
