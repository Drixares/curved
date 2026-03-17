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
  Label,
} from '@curved/ui'
import { slugify } from '@/lib/slugify'
import { api } from '@/lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

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
      setServerError(('error' in data && data.error) || 'Failed to create team')
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['teams', activeOrg?.id] })
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto max-w-sm p-6 pt-24">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create a team</CardTitle>
          <CardDescription>Teams let you organize issues and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                type="text"
                placeholder="Engineering"
                {...register('name', { onChange: handleNameChange })}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="team-identifier">Identifier</Label>
              <Input
                id="team-identifier"
                type="text"
                placeholder="ENG"
                {...register('identifier', {
                  onChange: () => setIdentifierManuallyEdited(true),
                })}
              />
              <p className="text-muted-foreground text-xs">
                Used as prefix for issues (e.g. ENG-123)
              </p>
              {errors.identifier && (
                <p className="text-destructive text-sm">{errors.identifier.message}</p>
              )}
            </div>

            {serverError ? <p className="text-destructive text-sm">{serverError}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create team'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
