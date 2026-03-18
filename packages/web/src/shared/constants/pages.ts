export const AUTH_PAGES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
} as const

export const ISSUES_PAGES = {
  MY_ASSIGNED: '/my-issues/assigned',
  DETAIL: (issueId: string) => `/issue/${issueId}`,
} as const

export const TEAM_PAGES = {
  ISSUES: (identifier: string) => `/team/${identifier}/issues`,
  PROJECTS: (identifier: string) => `/team/${identifier}/projects`,
  VIEWS: (identifier: string) => `/team/${identifier}/views`,
  SETTINGS: (identifier: string) => `/team/${identifier}/settings`,
} as const

export const PROJECT_PAGES = {
  DETAIL: (projectId: string) => `/project/${projectId}`,
} as const

export const ORGANIZATION_PAGES = {
  CREATE: '/create-organization',
  INVITATION_ACCEPT: (invitationId: string) => `/invitations/accept/${invitationId}`,
} as const

export const SETTINGS_PAGES = {
  ROOT: '/settings',
  PROFILE: '/settings/profile',
  SECURITY: '/settings/security',
  MEMBERS: '/settings/members',
  NEW_TEAM: '/settings/teams/new',
} as const

export const PAGES = {
  ...AUTH_PAGES,
  ...ISSUES_PAGES,
  ...TEAM_PAGES,
  ...PROJECT_PAGES,
  ...ORGANIZATION_PAGES,
  ...SETTINGS_PAGES,
}
