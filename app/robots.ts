import type { MetadataRoute } from 'next'

import { host } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'production') {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/get-tweet-ast/*', '/api/search-notion']
      },
      sitemap: `${host}/sitemap.xml`
    }
  }

  return {
    rules: {
      userAgent: '*',
      disallow: '/'
    },
    sitemap: `${host}/sitemap.xml`
  }
}
