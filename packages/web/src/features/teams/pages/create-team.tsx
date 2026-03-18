import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { slugify } from '@/shared/lib/slugify'
import { Button, Input, Separator } from '@curved/ui'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  identifier: z
    .string()
    .min(1, 'Identifier is required')
    .max(5, 'Identifier must be 5 characters or less')
    .regex(
      /^[A-Z][A-Z0-9]*$/,
      'Must start with a letter and contain only uppercase letters and numbers',
    ),
})

type CreateTeamValues = z.infer<typeof createTeamSchema>

export default function CreateTeam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const [identifierManuallyEdited, setIdentifierManuallyEdited] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamValues>({
    resolver: standardSchemaResolver(createTeamSchema),
    defaultValues: { name: '', identifier: '' },
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!identifierManuallyEdited) {
      const id = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 3)
      setValue('identifier', id)
    }
  }

  const onSubmit = async (values: CreateTeamValues) => {
    setServerError('')

    const res = await api.api.teams.$post({
      json: {
        name: values.name.trim(),
        identifier: values.identifier,
        slug: slugify(values.name),
      },
    })

    if (!res.ok) {
      const data = await res.json()
      setServerError(data.error)
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['teams', activeOrg?.id] })
    navigate('/dashboard')
  }

  return (
    <div className="p-3">
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
          Back
        </Button>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Create a new team</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create a new team to manage separate cycles, workflows and notifications
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="border-border rounded-lg border">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm font-medium">Team name</span>
              <div className="flex flex-col items-end gap-1">
                <Input
                  className="w-48 text-sm"
                  placeholder="e.g. Engineering"
                  {...register('name', { onChange: handleNameChange })}
                />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <span className="text-sm font-medium">Identifier</span>
                <p className="text-muted-foreground text-xs">
                  Used to identify issues from this team (e.g. ENG-123)
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Input
                  className="w-48 text-sm"
                  placeholder="e.g. ENG"
                  {...register('identifier', {
                    onChange: () => setIdentifierManuallyEdited(true),
                  })}
                />
                {errors.identifier && (
                  <p className="text-destructive text-xs">{errors.identifier.message}</p>
                )}
              </div>
            </div>
          </div>

          {serverError ? <p className="text-destructive mt-4 text-sm">{serverError}</p> : null}

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
