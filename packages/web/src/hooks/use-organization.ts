import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export type OrgData = NonNullable<
  Awaited<ReturnType<typeof authClient.organization.getFullOrganization>>['data']
>

async function fetchOrganization(): Promise<OrgData> {
  const { data, error } = await authClient.organization.getFullOrganization()
  if (error || !data) {
    throw new Error('Failed to load organization')
  }
  return data
}

export function useOrganization() {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['organization', activeOrg?.id],
    queryFn: fetchOrganization,
    enabled: !!activeOrg?.id,
  })
}

export function useInvalidateOrganization() {
  const queryClient = useQueryClient()
  const { data: activeOrg } = authClient.useActiveOrganization()
  return () => queryClient.invalidateQueries({ queryKey: ['organization', activeOrg?.id] })
}
