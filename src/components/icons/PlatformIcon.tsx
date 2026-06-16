import type { Platform } from '@/lib/db.types'

interface Props {
  platform: Platform
  size?: number
  className?: string
}

// 한눈에 구분되는 플랫폼 색 + 심볼. 브랜드 정밀 재현보다 식별성이 목적.
export function PlatformIcon({ platform, size = 20, className }: Props) {
  const s = size
  const common = {
    width: s,
    height: s,
    viewBox: '0 0 24 24',
    className,
    role: 'img',
    'aria-label': platform,
  } as const

  switch (platform) {
    case 'youtube':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="6" fill="#FF0000" />
          <path d="M10 8.5l6 3.5-6 3.5z" fill="#fff" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="6" fill="#000" />
          <path
            d="M15 6c.3 1.6 1.3 2.7 2.8 2.9v2.2c-1 .05-1.95-.25-2.8-.8v3.8a4 4 0 11-4-4c.2 0 .4.02.6.05v2.2a1.9 1.9 0 00-.6-.1 1.85 1.85 0 101.85 1.85V6z"
            fill="#fff"
          />
        </svg>
      )
    case 'chzzk':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="6" fill="#00FFA3" />
          <path d="M9 7.5l7 4.5-7 4.5z" fill="#0A0A0F" />
        </svg>
      )
    case 'soop':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="6" fill="#0F8CFF" />
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.4" fill="#fff" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="6" fill="#9B7EC8" />
        </svg>
      )
  }
}
