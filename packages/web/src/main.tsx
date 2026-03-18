import { ThemeProvider } from '@curved/ui'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import GuestRoute from './features/auth/components/guest-route'
import ProtectedRoute from './features/auth/components/protected-route'
import './index.css'
import { PAGES } from './shared/constants/pages'
import { queryClient } from './shared/lib/query-client'

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
                <Route path={PAGES.SIGN_IN} element={<SignIn />} />
                <Route path={PAGES.SIGN_UP} element={<SignUp />} />
              </Route>
              <Route path="/invitations/accept/:invitationId" element={<InvitationAccept />} />
              <Route element={<ProtectedRoute />}>
                <Route path={PAGES.CREATE} element={<CreateOrganization />} />
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Navigate to={PAGES.MY_ASSIGNED} replace />} />
                  <Route path={PAGES.MY_ASSIGNED} element={<Issues />} />
                  <Route path="/issue/:issueId" element={<IssueDetail />} />
                  <Route path="/project/:projectId" element={<ProjectDetail />} />
                  <Route path="/team/:teamIdentifier/issues" element={<TeamIssues />} />
                  <Route path="/team/:teamIdentifier/projects" element={<TeamProjects />} />
                  <Route path="/team/:teamIdentifier/views" element={<TeamViews />} />
                  <Route path="/team/:teamIdentifier/settings" element={<TeamSettings />} />
                </Route>
                <Route element={<SettingsLayout />}>
                  <Route path={PAGES.ROOT} element={<OrganizationDetail />} />
                  <Route path={PAGES.MEMBERS} element={<OrganizationMembers />} />
                  <Route path={PAGES.NEW_TEAM} element={<CreateTeam />} />
                  <Route path={PAGES.PROFILE} element={<ProfileSettings />} />
                  <Route path={PAGES.SECURITY} element={<SecuritySettings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
