'use client'

import type * as types from 'notion-types'
import { clsx } from 'clsx'
import * as React from 'react'
import { Search, useNotionContext } from 'react-notion-x'

import { isSearchEnabled, navigationLinks, navigationStyle } from '@/lib/config'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'
import { SailingShip } from '@/components/SailingShip'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className='flex items-center leading-none'>
      <button
        type='button'
        className={clsx(
          'inline-flex items-center justify-center p-1.25 border-none rounded-md bg-transparent text-(--fg-color) opacity-50 cursor-pointer transition-[opacity,background] duration-120 ease-in',
          'hover:enabled:opacity-95 hover:enabled:bg-(--bg-color-0)',
          'disabled:cursor-default',
          'focus-visible:outline-2 focus-visible:outline-(--select-color-0) focus-visible:outline-offset-2 focus-visible:opacity-95',
          !hasMounted && 'opacity-0 pointer-events-none'
        )}
        onClick={toggleDarkMode}
        title='Toggle color theme'
        aria-label='Toggle color theme'
        disabled={!hasMounted}
      >
        {hasMounted && (isDarkMode ? <MoonIcon /> : <SunIcon />)}
      </button>
    </div>
  )
}

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { components, mapPageUrl } = useNotionContext()
  const [shipHovered, setShipHovered] = React.useState(false)
  const [shipItCount, setShipItCount] = React.useState(8)
  const spanRef = React.useRef<HTMLSpanElement>(null)

  React.useLayoutEffect(() => {
    if (!shipHovered || !spanRef.current) return
    const container = spanRef.current
    const cs = window.getComputedStyle(container)
    const measurer = document.createElement('span')
    measurer.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-weight:${cs.fontWeight};font-style:${cs.fontStyle};letter-spacing:${cs.letterSpacing};font-family:${cs.fontFamily};font-size:${cs.fontSize}`
    measurer.textContent = 'SHIP IT  '
    document.body.appendChild(measurer)
    const unitWidth = measurer.offsetWidth
    document.body.removeChild(measurer)
    if (unitWidth > 0) {
      setShipItCount(Math.max(1, Math.floor(container.offsetWidth / unitWidth)))
    }
  }, [shipHovered])

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        <components.PageLink
          href='/'
          className='breadcrumb button'
          onMouseEnter={() => setShipHovered(true)}
          onMouseLeave={() => setShipHovered(false)}
        >
          <SailingShip />
        </components.PageLink>

        {shipHovered && (
          <span
            ref={spanRef}
            className='ship-text-enter flex-1 overflow-hidden whitespace-nowrap font-bold italic tracking-widest text-base select-none pointer-events-none px-4'
            style={{ fontFamily: 'monospace' }}
          >
            {Array(shipItCount).fill('SHIP IT').join('  ')}
          </span>
        )}

        <div className={clsx('notion-nav-header-rhs', 'breadcrumbs', 'flex flex-row items-center justify-end gap-0.5 shrink-0 ml-auto')}>
          {navigationStyle === 'custom' &&
            navigationLinks
              ?.map((link, index) => {
                if (!link?.pageId && !link?.url) {
                  return null
                }

                if (link.pageId) {
                  return (
                    <components.PageLink
                      href={mapPageUrl(link.pageId)}
                      key={index}
                      className='breadcrumb button'
                    >
                      {link.title}
                    </components.PageLink>
                  )
                }
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className='breadcrumb button'
                  >
                    {link.title}
                  </components.Link>
                )
              })
              .filter(Boolean)}

          <ToggleThemeButton />

          {isSearchEnabled && <Search block={block} title={null} />}
        </div>
      </div>
    </header>
  )
}
