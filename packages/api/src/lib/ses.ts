import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const VERIFIED_EMAIL = 'matteo@impulselab.ai'

const ses = new SESClient({
  region: process.env.AWS_REGION || 'eu-north-1',
})

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Curved <noreply@matteo-marchelli.com>',
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  // Sandbox mode: always send to the verified email
  const destination = VERIFIED_EMAIL

  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: [destination],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
      },
    },
  })

  try {
    await ses.send(command)
    console.info(`Email sent to ${destination} (original: ${to})`)
  } catch (error) {
    console.error('SES send error:', error)
  }
}
