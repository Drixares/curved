import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@curved/ui'
import { AuthProvider } from './features/auth/auth-provider'
import { queryClient } from './lib/query-client'
import { Loading } from './components/loading'
import ProtectedRoute from './features/auth/components/protected-route'
import GuestRoute from './features/auth/components/guest-route'
import './index.css'

const SignIn = lazy(() => import('./features/auth/pages/sign-in'))
const AdminLayout = lazy(() => import('./layout/admin-layout'))
const Dashboard = lazy(() => import('./features/dashboard/pages/dashboard'))
const UsersPage = lazy(() => import('./features/users/pages/users'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route element={<GuestRoute />}>
                  <Route path="/sign-in" element={<SignIn />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UsersPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
