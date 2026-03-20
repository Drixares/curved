import { passkey } from '@better-auth/passkey'
import { render } from '@react-email/components'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { lastLoginMethod, organization } from 'better-auth/plugins'
import { db } from '../db'
import { status } from '../db/schema'
import { ChangeEmailEmail } from '../emails/change-email'
import { InvitationEmail } from '../emails/invitation-email'
import { getUserOrganizations } from './auth-utils'
import { sendEmail } from './ses'

const DEFAULT_STATUSES = [
  { name: 'Backlog', color: '#94a3b8', position: 0, type: 'backlog', isDefault: true },
  { name: 'Todo', color: '#64748b', position: 1, type: 'unstarted', isDefault: false },
  { name: 'In Progress', color: '#f59e0b', position: 2, type: 'started', isDefault: false },
  { name: 'In Review', color: '#8b5cf6', position: 3, type: 'started', isDefault: false },
  { name: 'Done', color: '#22c55e', position: 4, type: 'completed', isDefault: false },
  { name: 'Cancelled', color: '#ef4444', position: 5, type: 'cancelled', isDefault: false },
] as const

export const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  baseURL: BASE_URL,
  trustedOrigins: ['*'],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const html = await render(ChangeEmailEmail({ url }))

      await sendEmail({
        to: user.email,
        subject: 'Verify your new email address',
        html,
      })
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    lastLoginMethod(),
    passkey(),
    organization({
      async sendInvitationEmail(data) {
        const acceptUrl = `${BASE_URL}/api/invitations/${data.id}/redirect`
        const html = await render(
          InvitationEmail({
            inviterName: data.inviter.user.name,
            organizationName: data.organization.name,
            acceptUrl,
          }),
        )

        sendEmail({
          to: data.email,
          subject: `Join ${data.organization.name} on Curved`,
          html,
        }).catch(console.error)
      },
      organizationHooks: {
        async afterCreateOrganization({ organization: org }) {
          await db.insert(status).values(
            DEFAULT_STATUSES.map((s) => ({
              id: crypto.randomUUID(),
              ...s,
              organizationId: org.id,
            })),
          )
        },
      },
    }),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userOrganizations = await getUserOrganizations(session.userId)

          if (userOrganizations.length === 0) {
            return {
              data: {
                ...session,
                activeOrganizationId: null,
              },
            }
          }

          return {
            data: {
              ...session,
              activeOrganizationId: userOrganizations[0].id,
            },
          }
        },
      },
    },
  },
})
