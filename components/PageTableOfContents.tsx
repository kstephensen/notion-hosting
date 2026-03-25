'use client'

import { type TableOfContentsEntry, uuidToId } from 'notion-utils'
import { clsx } from 'clsx'
import * as React from 'react'
import { createPortal } from 'react-dom'

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

/** Dash width (px): shallower headings get a longer mark, like Notion's outline */
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
    /* Align popover's right edge to the nav's *right* edge (where the dashes sit), not r.left */
    right: window.innerWidth - r.right,
    maxHeight: Math.min(window.innerHeight * 0.88, window.innerHeight - Math.max(8, r.top) - 12)
  }
}

/**
 * Outline rail (dashes + scrollspy). Hovering anywhere on the rail opens one
 * global popover with the full heading list — same pattern as Notion's page outline.
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
            className='toc-popover fixed z-[10000] min-w-[200px] max-w-[min(300px,calc(100vw-24px))] py-[0.45rem] rounded-lg overflow-y-auto overflow-x-hidden text-(--fg-color) bg-(--bg-color) shadow-[0_0_0_1px_var(--fg-color-0,rgba(55,53,47,0.08)),0_6px_24px_rgba(15,15,15,0.12)]'
            style={{
              top: popoverLayout.top,
              right: popoverLayout.right,
              maxHeight: popoverLayout.maxHeight
            }}
            onMouseEnter={clearHideTimer}
            onMouseLeave={scheduleClosePopover}
          >
            <ul className='list-none m-0 p-0 flex flex-col gap-[0.1rem]'>
              {entries.map((item) => {
                const id = uuidToId(item.id)
                const isActive = activeId === id
                return (
                  <li
                    key={item.id}
                    className='m-0 w-full text-right leading-[1.4]'
                    style={{ paddingRight: item.indentLevel * indentPx }}
                  >
                    <a
                      className={clsx(
                        'block w-full px-[0.65rem] py-[0.28rem] text-[0.8125rem] font-normal text-(--fg-color) opacity-[0.52] no-underline transition-opacity duration-150 ease-linear hyphens-auto [overflow-wrap:anywhere]',
                        'hover:opacity-[0.88]',
                        isActive && 'toc-popover-link-active opacity-100 font-medium'
                      )}
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
      className={clsx(
        'toc-root min-w-[222px] max-w-[min(280px,100%)] max-h-[calc(100vh-164px)] overflow-y-auto overflow-x-hidden mb-5 pl-1',
        className
      )}
      aria-label={title}
      onMouseEnter={openPopover}
      onMouseLeave={scheduleClosePopover}
    >
      {popoverPortal}
      <ul className='list-none m-0 p-0 flex flex-col items-end gap-[0.2rem]'>
        {entries.map((item) => {
          const id = uuidToId(item.id)
          const isActive = activeId === id
          return (
            <li
              key={item.id}
              className='m-0 w-full flex justify-end leading-[1.2]'
              style={{ paddingRight: item.indentLevel * indentPx }}
            >
              <a
                data-toc-text={item.text}
                className={clsx(
                  'toc-link relative inline-flex items-center justify-end min-h-[1.35rem] min-w-[1.75rem] py-[0.2rem] text-(--fg-color) opacity-[0.48] no-underline transition-opacity duration-200 ease-linear outline-none',
                  'hover:opacity-[0.78]',
                  'focus-visible:opacity-100 focus-visible:rounded focus-visible:shadow-[0_0_0_2px_var(--fg-color-0,rgba(55,53,47,0.2))]',
                  isActive && 'toc-link-active opacity-100'
                )}
                href={`#${id}`}
                aria-label={item.text}
                aria-current={isActive ? 'location' : undefined}
              >
                <span
                  className='block h-[2px] shrink-0 rounded-[1px] bg-current'
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
