import { getBlockValue } from 'notion-utils'

import type { PageProps } from './types'

export async function pageAcl({
  site,
  recordMap,
  pageId
}: PageProps): Promise<PageProps | undefined> {
  if (!site) {
    return {
      error: {
        statusCode: 404,
        message: 'Unable to load site'
      }
    }
  }

  if (!recordMap) {
    return {
      error: {
        statusCode: 404,
        message: `Page "${pageId}" was not found for ${site.domain}.`
      }
    }
  }

  const keys = Object.keys(recordMap.block)
  const rootKey = keys[0]

  if (!rootKey) {
    return {
      error: {
        statusCode: 404,
        message: `Page "${pageId}" could not be loaded for ${site.domain}.`
      }
    }
  }

  const rootValue = getBlockValue(recordMap.block[rootKey])
  const rootSpaceId = rootValue?.space_id

  if (
    rootSpaceId &&
    site.rootNotionSpaceId &&
    rootSpaceId !== site.rootNotionSpaceId
  ) {
    if (process.env.NODE_ENV) {
      return {
        error: {
          statusCode: 404,
          message: `Page "${pageId}" is not available on this site.`
        }
      }
    }
  }
}
