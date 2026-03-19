import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import postgres from 'postgres'

const migrationsDir = resolve(dirname(new URL(import.meta.url).pathname), '../../migrations')

const journal = JSON.parse(readFileSync(resolve(migrationsDir, 'meta/_journal.json'), 'utf-8')) as {
  entries: { idx: number; tag: string; when: number; breakpoints: boolean }[]
}

const sql = postgres(process.env.DATABASE_URL!)

async function migrate() {
  // Create the drizzle schema and migrations tracking table (matches drizzle-orm behavior)
  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `

  // Get the last applied migration (by created_at, matching drizzle-orm logic)
  const dbMigrations = await sql<{ id: number; hash: string; created_at: string }[]>`
    SELECT id, hash, created_at FROM "drizzle"."__drizzle_migrations"
    ORDER BY created_at DESC LIMIT 1
  `
  const lastMigration = dbMigrations[0]

  const sorted = journal.entries.sort((a, b) => a.idx - b.idx)

  let count = 0
  await sql.begin(async (tx) => {
    for (const entry of sorted) {
      // Skip already applied migrations (compare timestamps like drizzle-orm)
      if (lastMigration && Number(lastMigration.created_at) >= entry.when) {
        console.log(`⏭ Skipping already applied: ${entry.tag}`)
        continue
      }

      const filePath = resolve(migrationsDir, `${entry.tag}.sql`)
      const content = readFileSync(filePath, 'utf-8')
      const hash = createHash('sha256').update(content).digest('hex')

      console.log(`▶ Applying: ${entry.tag}`)

      // Split by statement breakpoints and execute each statement
      const statements = content
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter(Boolean)

      for (const statement of statements) {
        await tx.unsafe(statement)
      }

      await tx.unsafe(
        `INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, entry.when],
      )

      console.log(`✓ Applied: ${entry.tag}`)
      count++
    }
  })

  if (count === 0) {
    console.log('No pending migrations.')
  } else {
    console.log(`Done. Applied ${count} migration(s).`)
  }

  await sql.end()
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
