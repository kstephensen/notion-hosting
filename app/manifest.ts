import type { MetadataRoute } from 'next'

import * as config from '@/lib/config'

function shortAppName(name: string): string {
  if (name.length <= 12) return name
  const first = name.split(/\s+/)[0] ?? name
  return first.length <= 12 ? first : first.slice(0, 12)
}

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.name,
    short_name: shortAppName(config.name),
    icons: [
      {
        src: '/favicon.png',
        type: 'image/png',
        sizes: '32x32'
      },
      {
        src: '/favicon-128x128.png',
        type: 'image/png',
        sizes: '128x128'
      },
      {
        src: '/favicon-192x192.png',
        type: 'image/png',
        sizes: '192x192'
      }
    ],
    theme_color: '#000000',
    background_color: '#000000',
    display: 'standalone'
  }
}
