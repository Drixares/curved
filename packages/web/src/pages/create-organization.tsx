import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
  Label,
} from '@curved/ui'
import { authClient } from '@/lib/auth-client'
import { slugify } from '@/lib/slugify'
import { useCheckSlug } from '@/hooks/use-check-slug'

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  slug: z
    .string()
    .min(1, 'URL slug is required')
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Only lowercase letters, numbers, and hyphens'),
})

type CreateOrgValues = z.infer<typeof createOrgSchema>

export default function CreateOrganization() {
  const navigate = useNavigate()
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrgValues>({
    resolver: standardSchemaResolver(createOrgSchema),
    defaultValues: { name: '', slug: '' },
  })

  const slug = watch('slug')
  const { status: slugStatus, isChecking } = useCheckSlug(slug)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!slugManuallyEdited) {
      setValue('slug', slugify(value))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true)
    setValue('slug', slugify(e.target.value))
  }

  const onSubmit = async (values: CreateOrgValues) => {
    if (slugStatus === 'taken') return

    setServerError('')

    const { data: org, error } = await authClient.organization.create({
      name: values.name.trim(),
      slug: values.slug,
    })

    if (error) {
      setServerError(error.message ?? 'Failed to create organization')
      return
    }

    if (org) {
      await authClient.organization.setActive({ organizationId: org.id })
    }

    navigate('/dashboard')
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your workspace</CardTitle>
          <CardDescription>Set up your organization to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Acme Inc."
                {...register('name', { onChange: handleNameChange })}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="org-slug">URL</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>curved.app/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="org-slug"
                  placeholder="my-org"
                  value={slug}
                  onChange={handleSlugChange}
                />
              </InputGroup>
              {errors.slug && <p className="text-destructive text-sm">{errors.slug.message}</p>}
              {!errors.slug && slugStatus === 'checking' && (
                <p className="text-muted-foreground text-sm">Checking availability...</p>
              )}
              {!errors.slug && slugStatus === 'available' && (
                <p className="text-sm text-green-600 dark:text-green-400">Slug is available</p>
              )}
              {!errors.slug && slugStatus === 'taken' && (
                <p className="text-destructive text-sm">This slug is already taken</p>
              )}
            </div>

            {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || slugStatus === 'taken' || isChecking}
            >
              {isSubmitting ? 'Creating...' : 'Create workspace'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
