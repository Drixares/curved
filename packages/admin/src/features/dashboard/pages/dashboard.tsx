import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader } from '@curved/ui'
import { Users, Building2, FolderKanban, Layers, CircleDot } from 'lucide-react'
import { dashboardApi, type Stats } from '../api'
import { StatCard } from '../components/stat-card'

const statConfig: { key: keyof Stats; icon: typeof Users; label: string }[] = [
  { key: 'users', icon: Users, label: 'Users' },
  { key: 'organizations', icon: Building2, label: 'Organizations' },
  { key: 'teams', icon: Layers, label: 'Teams' },
  { key: 'projects', icon: FolderKanban, label: 'Projects' },
  { key: 'issues', icon: CircleDot, label: 'Issues' },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: dashboardApi.stats,
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of the platform</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} size="sm">
                <CardHeader>
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                  <div className="bg-muted h-8 w-12 animate-pulse rounded" />
                </CardHeader>
              </Card>
            ))
          : stats
            ? statConfig.map(({ key, icon, label }) => (
                <StatCard key={key} icon={icon} label={label} value={stats[key]} />
              ))
            : null}
      </div>
    </div>
  )
}
