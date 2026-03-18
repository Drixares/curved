import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@curved/ui'
import { queryClient } from './shared/lib/query-client'
import ProtectedRoute from './features/auth/components/protected-route'
import GuestRoute from './features/auth/components/guest-route'
import App from './App'
import { Toaster } from 'sonner'
import './index.css'

const SignIn = lazy(() => import('./features/auth/pages/sign-in'))
const SignUp = lazy(() => import('./features/auth/pages/sign-up'))
const DashboardLayout = lazy(() => import('./features/dashboard/components/dashboard-layout'))
const SettingsLayout = lazy(() => import('./features/settings/components/settings-layout'))
const Issues = lazy(() => import('./features/issues/pages/issues'))
const CreateOrganization = lazy(() => import('./features/organizations/pages/create-organization'))
const CreateTeam = lazy(() => import('./features/teams/pages/create-team'))
const OrganizationDetail = lazy(() => import('./features/organizations/pages/organization-detail'))
const OrganizationMembers = lazy(
  () => import('./features/organizations/pages/organization-members'),
)
const ProfileSettings = lazy(() => import('./features/settings/pages/profile-settings'))
const SecuritySettings = lazy(() => import('./features/settings/pages/security-settings'))
const InvitationAccept = lazy(() => import('./features/organizations/pages/invitation-accept'))
const IssueDetail = lazy(() => import('./features/issues/pages/issue-detail'))
const TeamIssues = lazy(() => import('./features/issues/pages/team-issues'))
const TeamProjects = lazy(() => import('./features/teams/pages/team-projects'))
const TeamViews = lazy(() => import('./features/teams/pages/team-views'))
const TeamSettings = lazy(() => import('./features/teams/pages/team-settings'))
const ProjectDetail = lazy(() => import('./features/projects/pages/project-detail'))

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
                  <Route
                    path="/dashboard"
                    element={<Navigate to="/my-issues/assigned" replace />}
                  />
                  <Route path="/my-issues/assigned" element={<Issues />} />
                  <Route path="/issue/:issueId" element={<IssueDetail />} />
                  <Route path="/project/:projectId" element={<ProjectDetail />} />
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
