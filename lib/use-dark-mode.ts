import { useTheme } from 'next-themes'
import * as React from 'react'

export function useDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDarkMode = resolvedTheme === 'dark'

  const toggleDarkMode = React.useCallback(() => {
    setTheme(isDarkMode ? 'light' : 'dark')
  }, [isDarkMode, setTheme])

  return {
    isDarkMode,
    toggleDarkMode
  }
}
