import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@curved/ui'
import ProtectedRoute from './components/protected-route'
import GuestRoute from './components/guest-route'
import App from './App'
import './index.css'

const SignIn = lazy(() => import('./pages/sign-in'))
const SignUp = lazy(() => import('./pages/sign-up'))
const DashboardLayout = lazy(() => import('./components/dashboard-layout'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Tasks = lazy(() => import('./pages/tasks'))
const CreateOrganization = lazy(() => import('./pages/create-organization'))

function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route element={<GuestRoute />}>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/create-organization" element={<CreateOrganization />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
