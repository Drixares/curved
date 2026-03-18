import { api } from '@/shared/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

async function checkSlug(slug: string) {
  const res = await api.api.organization['check-slug'].$post({
    json: { slug },
  })
  if (!res.ok) {
    throw new Error('Failed to check slug')
  }
  const data = await res.json()
  return data.status === 'available' ? 'available' : 'taken'
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function useCheckSlug(slug: string) {
  const debouncedSlug = useDebouncedValue(slug, 300)

  const query = useQuery({
    queryKey: ['check-slug', debouncedSlug],
    queryFn: () => checkSlug(debouncedSlug),
    enabled: !!debouncedSlug,
  })

  // While debouncing, show as "checking"
  const isDebouncing = slug !== debouncedSlug && !!slug

  return {
    status: !slug ? 'idle' : isDebouncing || query.isFetching ? 'checking' : (query.data ?? 'idle'),
    isChecking: isDebouncing || query.isFetching,
  }
}
