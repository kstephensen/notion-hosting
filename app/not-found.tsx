import type { Metadata } from 'next'

import { Page404 } from '@/components/Page404'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false }
}

export default function NotFound() {
  return <Page404 site={site} />
}
