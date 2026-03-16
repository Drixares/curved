import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export type OrgData = NonNullable<
  Awaited<ReturnType<typeof authClient.organization.getFullOrganization>>['data']
>

async function fetchOrganization(orgId: string): Promise<OrgData> {
  await authClient.organization.setActive({ organizationId: orgId })
  const { data, error } = await authClient.organization.getFullOrganization()
  if (error || !data) {
    throw new Error('Failed to load organization')
  }
  return data
}

export function useOrganization(orgId: string | undefined) {
  return useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => fetchOrganization(orgId!),
    enabled: !!orgId,
  })
}

export function useInvalidateOrganization() {
  const queryClient = useQueryClient()
  return (orgId: string) => queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
}
