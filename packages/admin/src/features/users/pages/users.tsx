import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@curved/ui'
import { usersApi } from '../api'
import { UsersTable } from '../components/users-table'
import { Pagination } from '../components/pagination'

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => usersApi.list(page, limit),
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground text-sm">All registered users on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>User list</CardTitle>
            <CardDescription>
              {data
                ? `${data.pagination.total} user${data.pagination.total !== 1 ? 's' : ''}`
                : 'Loading...'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-muted h-12 animate-pulse rounded" />
              ))}
            </div>
          ) : data ? (
            <>
              <UsersTable users={data.data} />
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
