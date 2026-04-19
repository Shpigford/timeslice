import { useSyncExternalStore, useCallback } from 'react'

export function useMediaQuery(query) {
  const subscribe = useCallback((cb) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }, [query])
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
