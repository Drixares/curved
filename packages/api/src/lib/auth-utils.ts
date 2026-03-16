import { eq } from 'drizzle-orm'
import { db } from '../db'
import { member } from '../db/schema'
import { auth } from './auth'

export async function getServerSession(headers: Headers) {
  const session = await auth.api.getSession({
    headers,
  })
  return session
}

export async function getUserOrganizations(userId: string) {
  const userOrganizations = await db.query.member.findMany({
    where: eq(member.userId, userId),
    with: {
      organization: true,
    },
    orderBy: (organization, { desc }) => desc(organization.createdAt),
  })

  return userOrganizations.map((memberRecord) => memberRecord.organization)
}
