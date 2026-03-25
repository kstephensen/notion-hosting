import type * as types from '@/lib/types'

export function Page404({ pageId, error }: types.PageProps) {
  return (
    <>
      <div
        className='absolute inset-0 flex justify-center items-center p-[2vmin]'
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        <main className='flex flex-col justify-center items-center'>
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
            className='max-w-full w-[640px]'
          />
        </main>
      </div>
    </>
  )
}
