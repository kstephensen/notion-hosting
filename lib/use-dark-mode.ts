import { useTheme } from 'next-themes'
import * as React from 'react'

/**
 * Theme flags for UI that must match between server HTML and the first client
 * paint (e.g. react-notion-x `darkMode`). `resolvedTheme` is undefined during SSR
 * and on the first client render before next-themes hydrates, so we only expose
 * `isDarkMode` after mount to avoid hydration mismatches.
 */
export function useDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = mounted && resolvedTheme === 'dark'

  const toggleDarkMode = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return {
    isDarkMode,
    toggleDarkMode
  }
}
