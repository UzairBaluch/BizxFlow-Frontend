import { useEffect } from 'react'
import { useThemeStore } from '@/stores/useThemeStore'

export function ThemeInit(): null {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', useThemeStore.getState().theme === 'dark')
  }, [])
  return null
}
