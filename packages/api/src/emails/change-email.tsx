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

interface ChangeEmailProps {
  url: string
}

export function ChangeEmailEmail({ url }: ChangeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your new email address on Curved</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your new email</Heading>
          <Text style={text}>
            You requested to change the email address associated with your Curved account. Click the
            button below to verify this new email address.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={url}>
              Verify email address
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request this change, you can safely ignore this email.
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
