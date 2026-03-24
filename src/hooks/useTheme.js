import { useSyncExternalStore, useCallback } from 'react'

let dark = typeof window !== 'undefined'
  ? localStorage.getItem('timeslice-theme') === 'dark'
  : false

const listeners = new Set()

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function setDark(value) {
  dark = value
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('timeslice-theme', dark ? 'dark' : 'light')
  listeners.forEach(cb => cb())
}

// Apply initial class
if (typeof window !== 'undefined') {
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, () => dark)
  const toggle = useCallback(() => setDark(!dark), [])
  return { dark: current, toggle }
}
