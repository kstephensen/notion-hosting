'use client'

import { type TableOfContentsEntry, uuidToId } from 'notion-utils'
import * as React from 'react'

import styles from './PageTableOfContents.module.css'

const SCROLL_SPY_THROTTLE_MS = 100

function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number) {
  let last = 0
  let trailing: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      if (trailing) {
        clearTimeout(trailing)
        trailing = undefined
      }
      last = now
      fn(...args)
    } else if (!trailing) {
      trailing = setTimeout(() => {
        last = Date.now()
        trailing = undefined
        fn(...args)
      }, remaining)
    }
  }
}

export type PageTableOfContentsProps = {
  entries: TableOfContentsEntry[]
  /** Accessible name for the nav (screen readers); no visible label */
  title?: string
  /** Pixels of left offset per indent level (default 14) */
  indentPx?: number
  /** Scrollspy offset from viewport top; mirrors react-notion-x behavior (default 150) */
  scrollSpyOffset?: number
  className?: string
}

/**
 * Custom table of contents with local styles. Uses the same heading data as
 * Notion’s TOC block (`getPageTableOfContents`) and the same scrollspy targets
 * as react-notion-x (`.notion-h` with `data-id`).
 */
export function PageTableOfContents({
  entries,
  title = 'Table of contents',
  indentPx = 14,
  scrollSpyOffset = 150,
  className
}: PageTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const updateActive = React.useMemo(
    () =>
      throttle(() => {
        const sections = document.getElementsByClassName('notion-h')
        let prevBBox: DOMRect | null = null
        let currentId: string | null = null

        for (const section of sections) {
          if (!section || !(section instanceof HTMLElement)) continue
          const id = section.dataset.id
          if (!id) continue

          if (!currentId) {
            currentId = id
          }

          const bbox = section.getBoundingClientRect()
          const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
          const offset = Math.max(scrollSpyOffset, prevHeight / 4)

          if (bbox.top - offset < 0) {
            currentId = id
            prevBBox = bbox
            continue
          }
          break
        }

        setActiveId(currentId)
      }, SCROLL_SPY_THROTTLE_MS),
    [scrollSpyOffset]
  )

  React.useEffect(() => {
    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    return () => window.removeEventListener('scroll', updateActive)
  }, [updateActive])

  if (!entries.length) {
    return null
  }

  return (
    <nav
      className={[styles.root, className].filter(Boolean).join(' ')}
      aria-label={title}
    >
      <ul className={styles.list}>
        {entries.map((item) => {
          const id = uuidToId(item.id)
          const isActive = activeId === id
          return (
            <li
              key={item.id}
              className={styles.item}
              style={{ paddingRight: item.indentLevel * indentPx }}
            >
              <a
                className={[styles.link, isActive && styles.linkActive]
                  .filter(Boolean)
                  .join(' ')}
                href={`#${id}`}
                aria-current={isActive ? 'location' : undefined}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
