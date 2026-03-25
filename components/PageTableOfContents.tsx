'use client'

import { type TableOfContentsEntry, uuidToId } from 'notion-utils'
import * as React from 'react'
import { createPortal } from 'react-dom'

import styles from './PageTableOfContents.module.css'

const SCROLL_SPY_THROTTLE_MS = 100
/** Time to cross the gap between the dash rail and the portaled popover */
const POPOVER_HIDE_MS = 220

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

/** Dash width (px): shallower headings get a longer mark, like Notion’s outline */
function dashWidthPx(indentLevel: number) {
  return Math.max(8, 20 - indentLevel * 2)
}

type PopoverLayout = {
  top: number
  right: number
  maxHeight: number
}

export type PageTableOfContentsProps = {
  entries: TableOfContentsEntry[]
  /** Accessible name for the nav (screen readers); no visible label */
  title?: string
  /** Pixels of right offset per indent level (default 14) */
  indentPx?: number
  /** Scrollspy offset from viewport top; mirrors react-notion-x behavior (default 150) */
  scrollSpyOffset?: number
  className?: string
}

function layoutPopover(el: HTMLElement): PopoverLayout {
  const r = el.getBoundingClientRect()
  return {
    top: Math.max(8, r.top),
    /* Align popover’s right edge to the nav’s *right* edge (where the dashes sit), not r.left */
    right: window.innerWidth - r.right,
    maxHeight: Math.min(window.innerHeight * 0.88, window.innerHeight - Math.max(8, r.top) - 12)
  }
}

/**
 * Outline rail (dashes + scrollspy). Hovering anywhere on the rail opens one
 * global popover with the full heading list — same pattern as Notion’s page outline.
 */
export function PageTableOfContents({
  entries,
  title = 'Table of contents',
  indentPx = 14,
  scrollSpyOffset = 150,
  className
}: PageTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [popoverLayout, setPopoverLayout] = React.useState<PopoverLayout | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const rootRef = React.useRef<HTMLElement | null>(null)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = React.useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  const scheduleClosePopover = React.useCallback(() => {
    clearHideTimer()
    hideTimer.current = setTimeout(() => {
      setPopoverOpen(false)
      setPopoverLayout(null)
    }, POPOVER_HIDE_MS)
  }, [clearHideTimer])

  const updatePopoverLayout = React.useCallback(() => {
    const el = rootRef.current
    if (!el) return
    setPopoverLayout(layoutPopover(el))
  }, [])

  const openPopover = React.useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      return
    }
    clearHideTimer()
    const el = rootRef.current
    if (el) setPopoverLayout(layoutPopover(el))
    setPopoverOpen(true)
  }, [clearHideTimer])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!popoverOpen) return
    updatePopoverLayout()
    window.addEventListener('scroll', updatePopoverLayout, true)
    window.addEventListener('resize', updatePopoverLayout)
    return () => {
      window.removeEventListener('scroll', updatePopoverLayout, true)
      window.removeEventListener('resize', updatePopoverLayout)
    }
  }, [popoverOpen, updatePopoverLayout])

  React.useEffect(() => {
    if (!popoverOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopoverOpen(false)
        setPopoverLayout(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [popoverOpen])

  React.useEffect(
    () => () => {
      clearHideTimer()
    },
    [clearHideTimer]
  )

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

  const popoverPortal =
    mounted && popoverOpen && popoverLayout
      ? createPortal(
          <div
            className={styles.popover}
            style={{
              top: popoverLayout.top,
              right: popoverLayout.right,
              maxHeight: popoverLayout.maxHeight
            }}
            onMouseEnter={clearHideTimer}
            onMouseLeave={scheduleClosePopover}
          >
            <ul className={styles.popoverList}>
              {entries.map((item) => {
                const id = uuidToId(item.id)
                const isActive = activeId === id
                return (
                  <li
                    key={item.id}
                    className={styles.popoverItem}
                    style={{ paddingRight: item.indentLevel * indentPx }}
                  >
                    <a
                      className={[
                        styles.popoverLink,
                        isActive && styles.popoverLinkActive
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      href={`#${id}`}
                      tabIndex={-1}
                    >
                      {item.text}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>,
          document.body
        )
      : null

  return (
    <nav
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      aria-label={title}
      onMouseEnter={openPopover}
      onMouseLeave={scheduleClosePopover}
    >
      {popoverPortal}
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
                data-toc-text={item.text}
                className={[styles.link, isActive && styles.linkActive]
                  .filter(Boolean)
                  .join(' ')}
                href={`#${id}`}
                aria-label={item.text}
                aria-current={isActive ? 'location' : undefined}
              >
                <span
                  className={styles.dash}
                  style={{ width: dashWidthPx(item.indentLevel) }}
                  aria-hidden="true"
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
