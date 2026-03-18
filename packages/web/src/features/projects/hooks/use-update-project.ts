import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/lib/api-client'

type UpdateProjectInput = {
  projectId: string
  name?: string
  description?: string | null
  status?: string
  priority?: string
  leadId?: string | null
  startDate?: string | null
  targetDate?: string | null
}

async function updateProject({ projectId, ...input }: UpdateProjectInput) {
  const res = await api.api.projects[':projectId'].$patch({
    param: { projectId },
    json: input,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(('error' in err && err.error) || 'Failed to update project')
  }
  return res.json()
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['team-projects'] })
    },
  })
}
