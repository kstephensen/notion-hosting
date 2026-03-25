'use client'

import Image from 'next/image'

export function SailingShip() {
  return (
    <div className='animate-bob'>
      <Image
        src='/pirate.png'
        alt='Home'
        width={40}
        height={40}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
