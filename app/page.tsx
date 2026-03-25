import { cache,Suspense } from 'react'

import { Loading } from '@/components/Loading'
import { NotionPage } from '@/components/NotionPage'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

export const revalidate = 3600

const loadHomePage = cache(async () => resolveNotionPage(domain))

export async function generateMetadata() {
  const props = await loadHomePage()
  return buildPageMetadata(props)
}

export default async function HomePage() {
  const props = await loadHomePage()

  return (
    <Suspense fallback={<Loading />}>
      <NotionPage {...props} />
    </Suspense>
  )
}
