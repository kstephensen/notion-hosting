'use client'

import * as Fathom from 'fathom-client'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import { posthog } from 'posthog-js'
import * as React from 'react'

import {
  fathomConfig,
  fathomId,
  posthogConfig,
  posthogId
} from '@/lib/config'

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  React.useEffect(() => {
    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig)
    }
  }, [])

  React.useEffect(() => {
    if (fathomId) {
      Fathom.trackPageview()
    }

    if (posthogId) {
      posthog.capture('$pageview')
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
