import type { ReactNode } from 'react'

import type { IconName } from './iconTypes'
import './Icon.css'

import type { IconSize, IconTone } from './iconTypes'

interface IconProps {
  name: IconName
  size: IconSize
  tone?: IconTone
  label?: string
}

function getIconContent(name: IconName): ReactNode {
  switch (name) {
    case 'book-open':
      return <><path d="M2.5 4.5A2.5 2.5 0 0 1 5 2h5v16H5a2.5 2.5 0 0 0-2.5 2.5z" /><path d="M21.5 4.5A2.5 2.5 0 0 0 19 2h-5v16h5a2.5 2.5 0 0 1 2.5 2.5z" /></>
    case 'chevrons-up-down':
      return <><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></>
    case 'layout-dashboard':
      return <><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></>
    case 'files':
      return <><path d="M15 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>
    case 'database':
      return <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>
    case 'chart-no-axes-combined':
      return <><path d="M3 3v18h18" /><path d="m7 16 4-5 3 3 5-7" /></>
    case 'clipboard-check':
      return <><rect width="14" height="16" x="5" y="5" rx="2" /><path d="M9 5V3h6v2M9 13l2 2 4-4" /></>
    case 'users':
      return <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>
    case 'settings':
      return <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1M15 19.4l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1M9 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1M4.6 15l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1M4.6 9l-.1.1a2 2 0 1 1 2.8 2.8l.1-.1M9 4.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1M15 4.6l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1M19.4 9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1" /></>
    case 'chevron-down':
      return <path d="m6 9 6 6 6-6" />
    case 'chevron-right':
      return <path d="m9 18 6-6-6-6" />
    case 'search':
      return <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>
    case 'bell':
      return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>
    case 'plus':
      return <><path d="M12 5v14M5 12h14" /></>
    case 'layers':
      return <><path d="m12 2 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>
  }
}

export function Icon({ name, size, tone = 'default', label }: IconProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className="icon"
      data-name={`Workflow/Icon/${name}/${size}`}
      data-tone={tone}
      height={size}
      role={label ? 'img' : undefined}
      viewBox="0 0 24 24"
      width={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
    >
      {getIconContent(name)}
    </svg>
  )
}
