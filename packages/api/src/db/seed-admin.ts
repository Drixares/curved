import { db } from './index'
import { adminUser } from './schema'

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD
const ADMIN_NAME = process.env.ADMIN_SEED_NAME || 'Admin'

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('⏭️  Skipping admin seed: ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required')
    process.exit(0)
  }

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
  console.log(`   Name:     ${ADMIN_NAME}`)
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('❌ Admin seed failed:', err)
  process.exit(1)
})
