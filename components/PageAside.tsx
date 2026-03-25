import { type Block, type ExtendedRecordMap, type PageBlock } from 'notion-types'
import { getPageTableOfContents } from 'notion-utils'

import { getPageTweet } from '@/lib/get-page-tweet'

import { PageActions } from './PageActions'
import { PageSocial } from './PageSocial'
import { PageTableOfContents } from './PageTableOfContents'

export function PageAside({
  block,
  recordMap,
  isBlogPost,
  minTableOfContentsItems = 3,
  tableOfContentsTitle
}: {
  block: Block
  recordMap: ExtendedRecordMap
  isBlogPost: boolean
  /** Hide the custom TOC when there are fewer than this many headings */
  minTableOfContentsItems?: number
  /** Optional accessible name for the TOC nav (screen readers only) */
  tableOfContentsTitle?: string
}) {
  if (!block) {
    return null
  }

  if (isBlogPost) {
    const pageBlock = block as PageBlock
    const toc = getPageTableOfContents(pageBlock, recordMap)
    const showToc = toc.length >= minTableOfContentsItems
    const tweet = getPageTweet(block, recordMap)

    if (!showToc && !tweet) {
      return null
    }

    return (
      <>
        {showToc && (
          <PageTableOfContents
            entries={toc}
            title={tableOfContentsTitle}
          />
        )}
        {tweet ? <PageActions tweet={tweet} /> : null}
      </>
    )
  }

  return <PageSocial />
}
