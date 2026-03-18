import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/lib/api-client'
import type { InferRequestType, InferResponseType } from 'hono/client'

type CreateProjectInput = InferRequestType<typeof api.api.projects.$post>['json']
type CreateProjectResponse = InferResponseType<typeof api.api.projects.$post, 201>

async function createProject(input: CreateProjectInput): Promise<CreateProjectResponse> {
  const res = await api.api.projects.$post({ json: input })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(('error' in err && err.error) || 'Failed to create project')
  }
  return res.json() as Promise<CreateProjectResponse>
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-projects'] })
    },
  })
}
