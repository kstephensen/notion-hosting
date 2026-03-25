'use client'

import { type TableOfContentsEntry, uuidToId } from 'notion-utils'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { createPortal } from 'react-dom'

const SCROLL_SPY_THROTTLE_MS = 100
const CARD_CLOSE_DELAY_MS = 150

export type PageTableOfContentsProps = {
  entries: TableOfContentsEntry[]
  title?: string
  indentPx?: number
  scrollSpyOffset?: number
  className?: string
}

export function PageTableOfContents({
  entries,
  title = 'Table of contents',
  indentPx = 14,
  scrollSpyOffset = 150,
  className
}: PageTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setMounted(true)
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  }, [])

  React.useEffect(() => {
    let lastRun = 0
    const handler = () => {
      const now = Date.now()
      if (now - lastRun < SCROLL_SPY_THROTTLE_MS) return
      lastRun = now
      const sections = document.getElementsByClassName('notion-h')
      let prevBBox: DOMRect | null = null
      let currentId: string | null = null
      for (const section of sections) {
        if (!(section instanceof HTMLElement)) continue
        const id = section.dataset.id
        if (!id) continue
        if (!currentId) currentId = id
        const bbox = section.getBoundingClientRect()
        const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
        if (bbox.top - Math.max(scrollSpyOffset, prevHeight / 4) < 0) {
          currentId = id; prevBBox = bbox; continue
        }
        break
      }
      setActiveId(currentId)
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [scrollSpyOffset])

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), CARD_CLOSE_DELAY_MS)
  }

  if (!entries.length) return null

  return (
    <nav
      className={clsx(
        'toc-root fixed right-5 top-1/2 -translate-y-1/2 w-fit max-h-[80vh] overflow-y-auto overflow-x-hidden',
        className
      )}
      aria-label={title}
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={scheduleClose}
    >
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className='toc-popover fixed z-[10000] right-5 top-1/2 -translate-y-1/2 min-w-[200px] max-w-[min(300px,calc(100vw-24px))] max-h-[80vh] py-[0.45rem] rounded-lg overflow-y-auto overflow-x-hidden text-(--fg-color) bg-(--bg-color) shadow-[0_0_0_1px_var(--fg-color-0,rgba(55,53,47,0.08)),0_6px_24px_rgba(15,15,15,0.12)]'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
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
                          'block w-full px-4 py-[0.28rem] text-[0.8125rem] font-normal text-(--fg-color) opacity-[0.52] no-underline transition-opacity duration-150 hyphens-auto [overflow-wrap:anywhere] hover:opacity-[0.88]',
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
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ul className='list-none m-0 p-0 flex flex-col items-end gap-[0.2rem]'>
        {entries.map((item) => {
          const id = uuidToId(item.id)
          const isActive = activeId === id
          return (
            <li
              key={item.id}
              className='m-0 leading-[1.2]'
              style={{ paddingRight: item.indentLevel * indentPx }}
            >
              <a
                className={clsx(
                  'toc-link relative inline-flex items-center min-h-[1.35rem] py-[0.2rem] text-(--fg-color) no-underline outline-none',
                  'opacity-[0.48] hover:opacity-[0.78] transition-opacity duration-200',
                  'focus-visible:opacity-100 focus-visible:rounded focus-visible:shadow-[0_0_0_2px_var(--fg-color-0,rgba(55,53,47,0.2))]',
                  isActive && 'toc-link-active opacity-100'
                )}
                href={`#${id}`}
                aria-label={item.text}
                aria-current={isActive ? 'location' : undefined}
              >
                <span
                  className='block h-0.75 shrink-0 rounded-[1px] bg-current'
                  style={{ width: Math.max(10, 26 - item.indentLevel * 3) }}
                  aria-hidden='true'
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
