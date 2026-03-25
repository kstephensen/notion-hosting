export function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <>
      <div
        className='absolute inset-0 flex justify-center items-center p-[2vmin]'
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        <main className='flex flex-col justify-center items-center'>
          <h1>Error Loading Page</h1>

          {statusCode && <p>Error code: {statusCode}</p>}

          <img src='/error.png' alt='Error' className='max-w-full w-[640px]' />
        </main>
      </div>
    </>
  )
}
