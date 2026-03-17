import type { Handler } from 'aws-lambda'
import { backup } from './backup'

export const handler: Handler = async () => {
  console.log('Lambda cron triggered')
  await backup()
  return { statusCode: 200, body: 'OK' }
}
