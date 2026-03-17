import { backup } from './backup'

async function main() {
  console.log('Starting cron backup...')
  await backup()
  console.log('Cron backup completed.')
}

main().catch(console.error)
