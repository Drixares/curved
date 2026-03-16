import { eq } from 'drizzle-orm'
import { db } from './index'
import {
  user,
  organization,
  member,
  team,
  teamMember,
  status,
  label,
  project,
  projectMember,
  issue,
  issueLabel,
} from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // Fetch existing users and organization
  const users = await db.select().from(user)
  const orgs = await db.select().from(organization)

  if (users.length === 0) {
    console.error('❌ No users found. Create a user account first via the app.')
    process.exit(1)
  }

  if (orgs.length === 0) {
    console.error('❌ No organization found. Create an organization first via the app.')
    process.exit(1)
  }

  const org = orgs[0]
  const orgMembers = await db.select().from(member).where(eq(member.organizationId, org.id))

  if (orgMembers.length === 0) {
    console.error('❌ No members found in organization. Join the organization first.')
    process.exit(1)
  }

  // Map members to their user records
  const memberUserIds = orgMembers.map((m) => m.userId)
  const orgUsers = users.filter((u) => memberUserIds.includes(u.id))
  const firstUser = orgUsers[0]
  const secondUser = orgUsers[1] ?? firstUser
  const thirdUser = orgUsers[2] ?? firstUser

  console.log(`   Using organization: ${org.name} (${org.slug})`)
  console.log(`   Found ${orgUsers.length} member(s): ${orgUsers.map((u) => u.email).join(', ')}`)

  // Clean existing domain data (in reverse order of dependencies)
  await db.delete(issueLabel)
  await db.delete(issue)
  await db.delete(projectMember)
  await db.delete(project)
  await db.delete(label)
  await db.delete(status)
  await db.delete(teamMember)
  await db.delete(team)

  // --- Teams ---
  const [engineering, design] = await db
    .insert(team)
    .values([
      {
        id: crypto.randomUUID(),
        name: 'Engineering',
        slug: 'engineering',
        identifier: 'ENG',
        description: 'Product engineering team',
        organizationId: org.id,
        issueCounter: 6,
      },
      {
        id: crypto.randomUUID(),
        name: 'Design',
        slug: 'design',
        identifier: 'DES',
        description: 'Product design team',
        organizationId: org.id,
        issueCounter: 3,
      },
    ])
    .returning()

  // --- Team Members ---
  const teamMemberValues = [
    { id: crypto.randomUUID(), teamId: engineering.id, userId: firstUser.id, role: 'owner' },
    { id: crypto.randomUUID(), teamId: design.id, userId: firstUser.id, role: 'member' },
  ]
  if (secondUser.id !== firstUser.id) {
    teamMemberValues.push({
      id: crypto.randomUUID(),
      teamId: engineering.id,
      userId: secondUser.id,
      role: 'member',
    })
  }
  if (thirdUser.id !== firstUser.id) {
    teamMemberValues.push({
      id: crypto.randomUUID(),
      teamId: design.id,
      userId: thirdUser.id,
      role: 'owner',
    })
  }
  await db.insert(teamMember).values(teamMemberValues)

  // --- Statuses ---
  const statuses = await db
    .insert(status)
    .values([
      {
        id: crypto.randomUUID(),
        name: 'Backlog',
        color: '#94a3b8',
        position: 0,
        type: 'backlog',
        organizationId: org.id,
        isDefault: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'Todo',
        color: '#64748b',
        position: 1,
        type: 'unstarted',
        organizationId: org.id,
      },
      {
        id: crypto.randomUUID(),
        name: 'In Progress',
        color: '#f59e0b',
        position: 2,
        type: 'started',
        organizationId: org.id,
      },
      {
        id: crypto.randomUUID(),
        name: 'In Review',
        color: '#8b5cf6',
        position: 3,
        type: 'started',
        organizationId: org.id,
      },
      {
        id: crypto.randomUUID(),
        name: 'Done',
        color: '#22c55e',
        position: 4,
        type: 'completed',
        organizationId: org.id,
      },
      {
        id: crypto.randomUUID(),
        name: 'Cancelled',
        color: '#ef4444',
        position: 5,
        type: 'cancelled',
        organizationId: org.id,
      },
    ])
    .returning()

  const statusMap = Object.fromEntries(statuses.map((s) => [s.name, s.id]))

  // --- Labels ---
  const labels = await db
    .insert(label)
    .values([
      { id: crypto.randomUUID(), name: 'Bug', color: '#ef4444', organizationId: org.id },
      { id: crypto.randomUUID(), name: 'Feature', color: '#3b82f6', organizationId: org.id },
      { id: crypto.randomUUID(), name: 'Improvement', color: '#8b5cf6', organizationId: org.id },
      { id: crypto.randomUUID(), name: 'Documentation', color: '#64748b', organizationId: org.id },
    ])
    .returning()

  const labelMap = Object.fromEntries(labels.map((l) => [l.name, l.id]))

  // --- Projects ---
  const [authProject, dashboardProject] = await db
    .insert(project)
    .values([
      {
        id: crypto.randomUUID(),
        name: 'Authentication Overhaul',
        description: 'Migrate to better-auth and add SSO support',
        status: 'in_progress',
        priority: 'high',
        leadId: firstUser.id,
        teamId: engineering.id,
        startDate: new Date('2026-03-01'),
        targetDate: new Date('2026-04-15'),
        sortOrder: 1,
      },
      {
        id: crypto.randomUUID(),
        name: 'Dashboard Redesign',
        description: 'New dashboard with analytics and better UX',
        status: 'planned',
        priority: 'medium',
        leadId: thirdUser.id,
        teamId: design.id,
        startDate: new Date('2026-04-01'),
        targetDate: new Date('2026-05-30'),
        sortOrder: 2,
      },
    ])
    .returning()

  // --- Project Members ---
  const projectMemberValues = [
    { id: crypto.randomUUID(), projectId: authProject.id, userId: firstUser.id },
    { id: crypto.randomUUID(), projectId: dashboardProject.id, userId: firstUser.id },
  ]
  if (secondUser.id !== firstUser.id) {
    projectMemberValues.push({
      id: crypto.randomUUID(),
      projectId: authProject.id,
      userId: secondUser.id,
    })
  }
  if (thirdUser.id !== firstUser.id) {
    projectMemberValues.push({
      id: crypto.randomUUID(),
      projectId: dashboardProject.id,
      userId: thirdUser.id,
    })
  }
  await db.insert(projectMember).values(projectMemberValues)

  // --- Engineering Issues ---
  const engineeringIssues = await db
    .insert(issue)
    .values([
      {
        id: crypto.randomUUID(),
        number: 1,
        title: 'Set up better-auth integration',
        description: 'Configure better-auth with Google and GitHub providers',
        statusId: statusMap['Done'],
        priority: 'high',
        teamId: engineering.id,
        projectId: authProject.id,
        assigneeId: firstUser.id,
        creatorId: firstUser.id,
        estimate: 3,
        sortOrder: 1,
      },
      {
        id: crypto.randomUUID(),
        number: 2,
        title: 'Implement session management',
        description: 'Add session tracking with IP and user agent',
        statusId: statusMap['In Progress'],
        priority: 'high',
        teamId: engineering.id,
        projectId: authProject.id,
        assigneeId: secondUser.id,
        creatorId: firstUser.id,
        estimate: 5,
        sortOrder: 2,
      },
      {
        id: crypto.randomUUID(),
        number: 3,
        title: 'Add organization invitations flow',
        description: 'Email-based invitation system with Resend',
        statusId: statusMap['Todo'],
        priority: 'medium',
        teamId: engineering.id,
        projectId: authProject.id,
        assigneeId: secondUser.id,
        creatorId: firstUser.id,
        estimate: 4,
        sortOrder: 3,
      },
      {
        id: crypto.randomUUID(),
        number: 4,
        title: 'Fix login redirect loop on expired sessions',
        statusId: statusMap['In Review'],
        priority: 'urgent',
        teamId: engineering.id,
        assigneeId: firstUser.id,
        creatorId: secondUser.id,
        estimate: 1,
        sortOrder: 4,
      },
      {
        id: crypto.randomUUID(),
        number: 5,
        title: 'Add rate limiting to API endpoints',
        statusId: statusMap['Backlog'],
        priority: 'low',
        teamId: engineering.id,
        creatorId: firstUser.id,
        estimate: 2,
        sortOrder: 5,
      },
      {
        id: crypto.randomUUID(),
        number: 6,
        title: 'Write API documentation',
        statusId: statusMap['Backlog'],
        priority: 'none',
        teamId: engineering.id,
        creatorId: secondUser.id,
        sortOrder: 6,
      },
    ])
    .returning()

  // --- Design Issues ---
  await db.insert(issue).values([
    {
      id: crypto.randomUUID(),
      number: 1,
      title: 'Design new dashboard layout',
      description: 'Wireframes and high-fidelity mockups for the new dashboard',
      statusId: statusMap['In Progress'],
      priority: 'high',
      teamId: design.id,
      projectId: dashboardProject.id,
      assigneeId: thirdUser.id,
      creatorId: thirdUser.id,
      estimate: 8,
      sortOrder: 1,
    },
    {
      id: crypto.randomUUID(),
      number: 2,
      title: 'Create component library specs',
      statusId: statusMap['Todo'],
      priority: 'medium',
      teamId: design.id,
      projectId: dashboardProject.id,
      assigneeId: thirdUser.id,
      creatorId: firstUser.id,
      estimate: 5,
      sortOrder: 2,
    },
    {
      id: crypto.randomUUID(),
      number: 3,
      title: 'Design empty states and error pages',
      statusId: statusMap['Backlog'],
      priority: 'low',
      teamId: design.id,
      creatorId: thirdUser.id,
      estimate: 3,
      sortOrder: 3,
    },
  ])

  // --- Issue Labels ---
  await db.insert(issueLabel).values([
    { id: crypto.randomUUID(), issueId: engineeringIssues[0].id, labelId: labelMap['Feature'] },
    { id: crypto.randomUUID(), issueId: engineeringIssues[1].id, labelId: labelMap['Feature'] },
    { id: crypto.randomUUID(), issueId: engineeringIssues[2].id, labelId: labelMap['Feature'] },
    { id: crypto.randomUUID(), issueId: engineeringIssues[3].id, labelId: labelMap['Bug'] },
    { id: crypto.randomUUID(), issueId: engineeringIssues[4].id, labelId: labelMap['Improvement'] },
    {
      id: crypto.randomUUID(),
      issueId: engineeringIssues[5].id,
      labelId: labelMap['Documentation'],
    },
  ])

  console.log('✅ Seed complete!')
  console.log(`   - 2 teams (Engineering, Design)`)
  console.log(`   - 6 statuses, 4 labels`)
  console.log(`   - 2 projects, 9 issues`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
