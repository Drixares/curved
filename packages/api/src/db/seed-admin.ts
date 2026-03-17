import { db } from './index'
import { adminUser } from './schema'

const ADMIN_EMAIL = 'admin@curved.dev'
const ADMIN_PASSWORD = 'CurvedAdmin2026!'
const ADMIN_NAME = 'Admin'

async function seedAdmin() {
  console.log('🔐 Seeding admin user...')

  const passwordHash = await Bun.password.hash(ADMIN_PASSWORD)

  await db
    .insert(adminUser)
    .values({
      id: crypto.randomUUID(),
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
    })
    .onConflictDoUpdate({
      target: adminUser.email,
      set: { passwordHash, name: ADMIN_NAME },
    })

  console.log('✅ Admin user seeded!')
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log(`   Password: ${ADMIN_PASSWORD}`)
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('❌ Admin seed failed:', err)
  process.exit(1)
})
