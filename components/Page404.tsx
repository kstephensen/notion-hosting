import type * as types from '@/lib/types'

import styles from './styles.module.css'

export function Page404({ pageId, error }: types.PageProps) {
  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Page not found</h1>

          {error ? (
            <p>{error.message}</p>
          ) : (
            pageId && (
              <p>
                This page isn&apos;t available or the link may be incorrect.
              </p>
            )
          )}

          <img
            src='/404.png'
            alt='404 Not Found'
            className={styles.errorImage}
          />
        </main>
      </div>
    </>
  )
}
