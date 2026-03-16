import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Separator,
} from '@curved/ui'
import { authClient } from '@/lib/auth-client'
import { useInvitation } from '@/hooks/use-invitation'
import SocialAuthButtons from '@/components/social-auth-buttons'

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpValues = z.infer<typeof signUpSchema>

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState('')

  const invitationId = searchParams.get('invitationId')
  const signUpEmail = searchParams.get('signUpEmail')
  const { data: invitation } = useInvitation(invitationId ?? undefined)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: {
      email: signUpEmail ?? '',
    },
  })

  const onSubmit = async (values: SignUpValues) => {
    setServerError('')

    const redirectTo = searchParams.get('redirect') || '/dashboard'
    const { error } = await authClient.signUp.email(values, {
      onSuccess: () => navigate(redirectTo),
      onError: (ctx) => {
        setServerError(ctx.error.message ?? 'An error occurred')
      },
    })

    if (error) {
      setServerError(error.message ?? 'An error occurred')
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          {invitation ? (
            <>
              <Avatar className="mx-auto size-12 rounded-lg">
                {invitation.organization.logo ? (
                  <AvatarImage
                    src={invitation.organization.logo}
                    alt={invitation.organization.name}
                  />
                ) : null}
                <AvatarFallback className="rounded-lg text-lg">
                  {getInitials(invitation.organization.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">Join {invitation.organization.name}</CardTitle>
              <CardDescription>
                <strong>{invitation.inviter.name}</strong> invited you to join. Create an account to
                get started.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Get started with Curved</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <SocialAuthButtons />

          <div className="relative my-6">
            <Separator />
            <span className="text-muted-foreground bg-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={!!signUpEmail}
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
