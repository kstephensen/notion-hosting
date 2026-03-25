import { NextResponse } from 'next/server'

import type * as types from '@/lib/types'
import { search } from '@/lib/notion'

export async function POST(request: Request) {
  const searchParams = (await request.json()) as types.SearchParams

  console.log('<<< lambda search-notion', searchParams)
  const results = await search(searchParams)
  console.log('>>> lambda search-notion', results)

  return NextResponse.json(results, {
    headers: {
      'Cache-Control':
        'public, s-maxage=60, max-age=60, stale-while-revalidate=60'
    }
  })
}
