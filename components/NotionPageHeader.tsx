import type * as types from 'notion-types'
import cs from 'classnames'
import * as React from 'react'
import { Breadcrumbs, Search, useNotionContext } from 'react-notion-x'

import { isSearchEnabled, navigationLinks, navigationStyle } from '@/lib/config'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className={styles.themeToggle}>
      <button
        type='button'
        className={cs(
          styles.themeToggleBtn,
          !hasMounted && styles.themeToggleHidden
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

  const breadcrumbs =
    navigationStyle === 'custom' ? (
      <Breadcrumbs block={block} rootOnly={true} />
    ) : (
      <Breadcrumbs block={block} />
    )

  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        {breadcrumbs}

        <div
          className={cs('notion-nav-header-rhs', 'breadcrumbs', styles.headerRhs)}
        >
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
                      className={cs(styles.navLink, 'breadcrumb', 'button')}
                    >
                      {link.title}
                    </components.PageLink>
                  )
                }
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
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
