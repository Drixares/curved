import { STATUS_TYPE_ORDER } from '@/features/issues/data/data'
import { useMemo } from 'react'

interface GroupableIssue {
  status: { id: string; name: string; type: string; position: number }
}

export function useGroupedIssues<T extends GroupableIssue>(issues: T[]) {
  return useMemo(() => {
    const grouped = new Map<string, T[]>()
    for (const issue of issues) {
      const key = issue.status.id
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(issue)
    }

    const statusMap = new Map<string, T['status']>()
    for (const issue of issues) {
      if (!statusMap.has(issue.status.id)) {
        statusMap.set(issue.status.id, issue.status)
      }
    }

    const sortedStatuses = [...statusMap.values()].sort(
      (a, b) =>
        (STATUS_TYPE_ORDER[a.type] ?? 99) - (STATUS_TYPE_ORDER[b.type] ?? 99) ||
        a.position - b.position,
    )

    return sortedStatuses.map((s) => ({
      status: s,
      issues: grouped.get(s.id)!,
    }))
  }, [issues])
}
