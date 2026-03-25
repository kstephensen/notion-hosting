'use client'

import * as Fathom from 'fathom-client'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import * as React from 'react'

import { fathomConfig, fathomId } from '@/lib/config'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  React.useEffect(() => {
    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }
  }, [])

  React.useEffect(() => {
    if (fathomId) {
      Fathom.trackPageview()
    }
  }, [pathname])

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      enableColorScheme
      storageKey='theme'
      value={{
        light: 'light-mode',
        dark: 'dark-mode'
      }}
    >
      {children}
    </ThemeProvider>
  )
}
