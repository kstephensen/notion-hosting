'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function SailingShip() {
  return (
    <motion.div
      animate={{ y: [0, -3, 0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
    >
      <Image
        src='/pirate.png'
        alt='Home'
        width={40}
        height={40}
        style={{ imageRendering: 'pixelated' }}
      />
    </motion.div>
  )
}
