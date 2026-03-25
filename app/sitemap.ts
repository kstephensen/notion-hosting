import type { MetadataRoute } from 'next'

import { host } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteMap = await getSiteMap()

  const entries: MetadataRoute.Sitemap = [
    { url: host, lastModified: new Date() },
    { url: `${host}/`, lastModified: new Date() }
  ]

  for (const canonicalPagePath of Object.keys(siteMap.canonicalPageMap)) {
    entries.push({
      url: `${host}/${canonicalPagePath}`,
      lastModified: new Date()
    })
  }

  return entries
}
