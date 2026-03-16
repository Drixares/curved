import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface InvitationEmailProps {
  inviterName: string
  organizationName: string
  acceptUrl: string
}

export function InvitationEmail({
  inviterName,
  organizationName,
  acceptUrl,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {organizationName} on Curved
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re invited</Heading>
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join{' '}
            <strong>{organizationName}</strong> on Curved.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={acceptUrl}>
              View invitation
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t expect this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '480px',
}

const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#09090b',
  margin: '0 0 16px',
}

const text = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#3f3f46',
  margin: '0 0 24px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const button = {
  backgroundColor: '#18181b',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500' as const,
  textDecoration: 'none',
  padding: '10px 24px',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e4e4e7',
  margin: '24px 0',
}

const footer = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#a1a1aa',
  margin: '0',
}
