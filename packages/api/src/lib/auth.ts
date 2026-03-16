import { render } from '@react-email/components'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { lastLoginMethod, organization } from 'better-auth/plugins'
import { db } from '../db'
import { InvitationEmail } from '../emails/invitation-email'
import { resend } from './resend'

export const BASE_URL = 'http://localhost:3000'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  baseURL: BASE_URL,
  trustedOrigins: ['http://localhost:5173', 'http://localhost:5174'],
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

        resend.emails
          .send({
            from: 'Curved <matteo@matteo-marchelli.com>',
            to: data.email,
            subject: `Join ${data.organization.name} on Curved`,
            html,
          })
          .then(() => {
            console.info('Invitation email sent to', data.email)
          })
          .catch(console.error)
      },
    }),
  ],
})
