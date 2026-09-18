import { cn } from '../../lib/cn'

export type UserAvatarProps = {
  imageUrl?: string | null
  className?: string
}

/**
 * 사람을 나타내는 공통 아바타.
 *
 * 프로필 사진이 없을 때 화면마다 다른 대체 이미지를 쓰면 같은 사람이 다른 사람처럼 보인다.
 * 사이드바와 회의 기록이 같은 기본 아이콘을 쓰도록 여기서 한 벌만 그린다.
 */
export function UserAvatar({ imageUrl, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        'flex size-[32px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-line-default text-fg-secondary',
        className,
      )}
    >
      {imageUrl ? (
        <img alt="" aria-hidden="true" className="size-full object-cover" src={imageUrl} />
      ) : (
        <DefaultAvatarIcon />
      )}
    </span>
  )
}

function DefaultAvatarIcon() {
  return (
    <svg aria-hidden="true" className="size-[24px]" fill="none" viewBox="0 0 24 24">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" opacity="0.5" />
      <path
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}
