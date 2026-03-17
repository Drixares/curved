import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@curved/ui'
import { queryClient } from './lib/query-client'
import ProtectedRoute from './components/protected-route'
import GuestRoute from './components/guest-route'
import App from './App'
import { Toaster } from 'sonner'
import './index.css'

const SignIn = lazy(() => import('./pages/sign-in'))
const SignUp = lazy(() => import('./pages/sign-up'))
const DashboardLayout = lazy(() => import('./components/dashboard-layout'))
const SettingsLayout = lazy(() => import('./components/settings-layout'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Issues = lazy(() => import('./pages/issues'))
const CreateOrganization = lazy(() => import('./pages/create-organization'))
const CreateTeam = lazy(() => import('./pages/create-team'))
const OrganizationDetail = lazy(() => import('./pages/organization-detail'))
const OrganizationMembers = lazy(() => import('./pages/organization-members'))
const ProfileSettings = lazy(() => import('./pages/profile-settings'))
const SecuritySettings = lazy(() => import('./pages/security-settings'))
const InvitationAccept = lazy(() => import('./pages/invitation-accept'))
const IssueDetail = lazy(() => import('./pages/issue-detail'))
const TeamIssues = lazy(() => import('./pages/team-issues'))
const TeamProjects = lazy(() => import('./pages/team-projects'))
const TeamViews = lazy(() => import('./pages/team-views'))
const TeamSettings = lazy(() => import('./pages/team-settings'))

function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <Toaster position="bottom-right" />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route element={<GuestRoute />}>
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
              </Route>
              <Route path="/invitations/accept/:invitationId" element={<InvitationAccept />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/create-organization" element={<CreateOrganization />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-issues/assigned" element={<Issues />} />
                  <Route path="/issue/:issueId" element={<IssueDetail />} />
                  <Route path="/team/:teamIdentifier/issues" element={<TeamIssues />} />
                  <Route path="/team/:teamIdentifier/projects" element={<TeamProjects />} />
                  <Route path="/team/:teamIdentifier/views" element={<TeamViews />} />
                  <Route path="/team/:teamIdentifier/settings" element={<TeamSettings />} />
                </Route>
                <Route element={<SettingsLayout />}>
                  <Route path="/settings" element={<OrganizationDetail />} />
                  <Route path="/settings/members" element={<OrganizationMembers />} />
                  <Route path="/settings/teams/new" element={<CreateTeam />} />
                  <Route path="/settings/profile" element={<ProfileSettings />} />
                  <Route path="/settings/security" element={<SecuritySettings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
