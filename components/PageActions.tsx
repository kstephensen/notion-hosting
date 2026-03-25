import { LikeIcon } from '@/lib/icons/like'
import { RetweetIcon } from '@/lib/icons/retweet'

/**
 * @see https://developer.twitter.com/en/docs/twitter-for-websites/web-intents/overview
 */
export function PageActions({ tweet }: { tweet: string }) {
  return (
    <div className='flex flex-row justify-center px-3 pb-3 pt-1.5'>
      <a
        className='cursor-pointer text-[24px] inline-flex p-3 mr-[1vw] rounded-full bg-transparent transition-all duration-250 ease-out hover:duration-50 hover:bg-[#f6e3e8] hover:text-[#e0265e]'
        href={`https://x.com/intent/like?tweet_id=${tweet}`}
        target='_blank'
        rel='noopener noreferrer'
        title='Like this post on Twitter'
      >
        <LikeIcon />
      </a>

      <a
        className='cursor-pointer text-[24px] inline-flex p-3 last:mr-0 rounded-full bg-transparent transition-all duration-250 ease-out hover:duration-50 hover:text-[#19bf64] hover:bg-[#e5f2e8]'
        href={`https://x.com/intent/retweet?tweet_id=${tweet}`}
        target='_blank'
        rel='noopener noreferrer'
        title='Retweet this post on Twitter'
      >
        <RetweetIcon />
      </a>
    </div>
  )
}
