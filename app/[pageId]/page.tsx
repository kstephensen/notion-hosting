import { cache,Suspense } from 'react'

import { Loading } from '@/components/Loading'
import { NotionPage } from '@/components/NotionPage'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import { domain, isDev, pageUrlOverrides } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

export const revalidate = 10

const loadPage = cache(async (pageId: string) =>
  resolveNotionPage(domain, pageId)
)

type PageProps = { params: Promise<{ pageId: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { pageId } = await params
  const props = await loadPage(pageId)
  return buildPageMetadata(props)
}

export async function generateStaticParams() {
  if (isDev) {
    return []
  }

  const siteMap = await getSiteMap()
  const allPageIds = [
    ...new Set([
      ...Object.keys(siteMap.canonicalPageMap),
      ...Object.keys(pageUrlOverrides)
    ])
  ]

  return allPageIds.map((pageId) => ({ pageId }))
}

export default async function DynamicPage({ params }: PageProps) {
  const { pageId } = await params
  const props = await loadPage(pageId)

  return (
    <Suspense fallback={<Loading />}>
      <NotionPage {...props} />
    </Suspense>
  )
}
