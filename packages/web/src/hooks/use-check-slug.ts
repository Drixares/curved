import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

async function checkSlug(slug: string): Promise<'available' | 'taken'> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/organization/check-slug`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ slug }),
    },
  )
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
    status: !slug
      ? ('idle' as const)
      : isDebouncing || query.isFetching
        ? ('checking' as const)
        : (query.data ?? ('idle' as const)),
    isChecking: isDebouncing || query.isFetching,
  }
}
