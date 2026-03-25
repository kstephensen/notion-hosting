import * as React from 'react'

import * as config from '@/lib/config'
import { GitHubIcon } from '@/lib/icons/github'
import { LinkedInIcon } from '@/lib/icons/linkedin'
import { TwitterIcon } from '@/lib/icons/twitter'

export function FooterImpl() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='w-full max-w-[1100px] mx-auto mt-auto mb-0 p-2 flex flex-row justify-between items-center max-[566px]:flex-col'>
      <div className='text-[80%] p-[0.5em] max-[566px]:order-2 max-[566px]:mt-4'>
        Copyright {currentYear} {config.author}
      </div>

      <div className='select-none flex flex-row items-center gap-[0.25em] max-[566px]:order-1 max-[566px]:mt-4'>
        {config.twitter && (
          <a
            className='cursor-pointer text-[2em] inline-flex p-[0.25em] transition-colors duration-250 ease-out hover:duration-50 hover:text-[#2795e9]'
            href={`https://x.com/${config.twitter}`}
            title={`X @${config.twitter}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <TwitterIcon />
          </a>
        )}

        {config.github && (
          <a
            className='cursor-pointer text-[2em] inline-flex p-[0.25em] transition-colors duration-250 ease-out hover:duration-50 hover:text-[#c9510c]'
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <GitHubIcon />
          </a>
        )}

        {config.linkedin && (
          <a
            className='cursor-pointer text-[2em] inline-flex p-[0.25em] transition-colors duration-250 ease-out hover:duration-50 hover:text-[#0077b5]'
            href={`https://www.linkedin.com/in/${config.linkedin}`}
            title={`LinkedIn ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
