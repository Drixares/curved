import { api } from '@/shared/lib/api-client'
import { authClient } from '@/shared/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import type { InferResponseType } from 'hono/client'

const $getProject = api.api.projects[':projectId'].$get
type ProjectResponse = InferResponseType<typeof $getProject, 200>
export type Project = ProjectResponse

async function fetchProject(projectId: string) {
  const res = await api.api.projects[':projectId'].$get({
    param: { projectId },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch project')
  }
  return res.json()
}

export function useProject(projectId: string | undefined) {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['project', projectId, activeOrg?.id],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId && !!activeOrg?.id,
  })
}
