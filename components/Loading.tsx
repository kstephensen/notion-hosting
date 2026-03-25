import { LoadingIcon } from './LoadingIcon'

export function Loading() {
  return (
    <div
      className='absolute inset-0 flex justify-center items-center p-[2vmin] text-base leading-relaxed'
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--fg-color)' }}
    >
      <LoadingIcon />
    </div>
  )
}
