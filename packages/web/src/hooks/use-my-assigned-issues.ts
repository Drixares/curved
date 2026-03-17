import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export interface IssueStatus {
  id: string
  name: string
  color: string
  type: string // backlog | unstarted | started | completed | cancelled
}

export interface IssueLabel {
  id: string
  name: string
  color: string
}

export interface AssignedIssue {
  id: string
  number: number
  title: string
  priority: string
  status: IssueStatus
  team: { id: string; identifier: string }
  labels: IssueLabel[]
  createdAt: string
  updatedAt: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function fetchMyAssignedIssues(): Promise<AssignedIssue[]> {
  const res = await fetch(`${API_URL}/api/my-issues/assigned`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch assigned issues')
  }
  return res.json()
}

export function useMyAssignedIssues() {
  const { data: activeOrg } = authClient.useActiveOrganization()

  return useQuery({
    queryKey: ['my-issues', 'assigned', activeOrg?.id],
    queryFn: fetchMyAssignedIssues,
    enabled: !!activeOrg?.id,
  })
}
