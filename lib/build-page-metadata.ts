import { type Metadata } from 'next'
import { type PageBlock } from 'notion-types'
import {
  getBlockTitle,
  getBlockValue,
  getPageProperty
} from 'notion-utils'

import * as config from '@/lib/config'
import { getSocialImageUrl } from '@/lib/get-social-image-url'
import { mapImageUrl } from '@/lib/map-image-url'
import { getCanonicalPageUrl } from '@/lib/map-page-url'
import { type PageProps } from '@/lib/types'

export function buildPageMetadata(props: PageProps): Metadata {
  const { site, recordMap, pageId, error } = props

  if (error || !site || !recordMap || !pageId) {
    return {
      title: site?.name || 'Page not found',
      robots: { index: false, follow: false }
    }
  }

  const keys = Object.keys(recordMap.block || {})
  const block = getBlockValue(recordMap.block[keys[0]!])

  if (!block) {
    return {
      title: site.name,
      robots: { index: false, follow: false }
    }
  }

  const title = getBlockTitle(block, recordMap) || site.name
  const description =
    getPageProperty<string>('Description', block, recordMap) ||
    config.description

  const socialImage = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
      (block as PageBlock).format?.page_cover ||
      config.defaultPageCover,
    block
  )

  const socialImageUrl = getSocialImageUrl(pageId) || socialImage || undefined

  const canonicalPageUrl = config.isDev
    ? undefined
    : getCanonicalPageUrl(site, recordMap)(pageId)

  const rssFeedUrl = `${config.host}/feed`

  const metadata: Metadata = {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title,
      description,
      ...(canonicalPageUrl ? { url: canonicalPageUrl } : {}),
      ...(socialImageUrl ? { images: [{ url: socialImageUrl }] } : {})
    },
    twitter: {
      card: socialImageUrl ? 'summary_large_image' : 'summary',
      ...(config.twitter ? { creator: `@${config.twitter}` } : {}),
      title,
      ...(description ? { description } : {}),
      ...(socialImageUrl ? { images: [socialImageUrl] } : {}),
      ...(canonicalPageUrl ? { url: canonicalPageUrl } : {})
    },
    alternates: {
      ...(canonicalPageUrl ? { canonical: canonicalPageUrl } : {}),
      types: {
        'application/rss+xml': rssFeedUrl
      }
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black'
    }
  }

  return metadata
}
