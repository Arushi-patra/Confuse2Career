import { useState, useEffect } from 'react'

function getInitial(): boolean {
  try {
    return localStorage.getItem('c2c-theme') === 'dark'
  } catch {
    return false
  }
}

export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(getInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    try {
      localStorage.setItem('c2c-theme', dark ? 'dark' : 'light')
    } catch { /* ignore */ }
  }, [dark])

  // Sync across components on the same page
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'c2c-theme') setDark(e.newValue === 'dark')
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return [dark, () => setDark(d => !d)]
}
