import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-coy.css'
import 'react-notion-x/styles.css'
import '@/styles/global.css'
import '@/styles/notion.css'
import '@/styles/prism-theme.css'

import type { Metadata, Viewport } from 'next'
import { PT_Serif } from 'next/font/google'
import * as React from 'react'

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-pt-serif'
})

import { Providers } from '@/components/providers'
import * as config from '@/lib/config'

export const metadata: Metadata = {
  metadataBase: new URL(config.host),
  title: {
    default: config.name,
    template: `%s — ${config.name}`
  },
  description: config.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    other: [{ rel: 'icon', url: '/favicon.png', sizes: '32x32' }]
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fefffe' },
    { media: '(prefers-color-scheme: dark)', color: '#2d3439' }
  ]
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={ptSerif.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
