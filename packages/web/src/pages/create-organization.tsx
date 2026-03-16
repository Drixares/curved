import { useCallback, useEffect, useRef, useState } from 'react'
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

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  slug: z
    .string()
    .min(1, 'URL slug is required')
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Only lowercase letters, numbers, and hyphens'),
})

type CreateOrgValues = z.infer<typeof createOrgSchema>

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken'

export default function CreateOrganization() {
  const navigate = useNavigate()
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [serverError, setServerError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

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

  const checkSlugAvailability = useCallback((slugToCheck: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!slugToCheck) {
      setSlugStatus('idle')
      return
    }

    setSlugStatus('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/organization/check-slug`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ slug: slugToCheck }),
          },
        )
        const data = await res.json()
        setSlugStatus(data.status === 'available' ? 'available' : 'taken')
      } catch {
        setSlugStatus('idle')
      }
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!slugManuallyEdited) {
      const newSlug = slugify(value)
      setValue('slug', newSlug)
      checkSlugAvailability(newSlug)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true)
    const newSlug = slugify(e.target.value)
    setValue('slug', newSlug)
    checkSlugAvailability(newSlug)
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
              disabled={isSubmitting || slugStatus === 'taken' || slugStatus === 'checking'}
            >
              {isSubmitting ? 'Creating...' : 'Create workspace'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
