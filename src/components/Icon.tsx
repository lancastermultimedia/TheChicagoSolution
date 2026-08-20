// Stroke-based line icons in the itinerary doc's hand: 1.6px stroke, round
// caps/joins, no fill. This is a placeholder extension of that sprite (the
// original hand-drawn set lives only in the static PDF, not this repo) —
// worth a design pass later, but keeps the visual language consistent now.
import type { CSSProperties } from 'react'

export type IconName =
  | 'car'
  | 'key'
  | 'record'
  | 'shirt'
  | 'coffee'
  | 'fork'
  | 'boat'
  | 'column'
  | 'speaker'
  | 'moon'
  | 'market'
  | 'suitcase'
  | 'footprint'
  | 'bus'
  | 'pin'
  | 'sun'
  | 'cloud-sun'
  | 'cloud-bolt'
  | 'cloud'
  | 'clock'
  | 'compass'
  | 'search'
  | 'grave'
  | 'camera'

const PATHS: Record<IconName, React.ReactNode> = {
  car: (
    <>
      <path d="M4 16.5V12l2-5h12l2 5v4.5" />
      <path d="M3.5 16.5h17" />
      <circle cx="7.5" cy="16.5" r="1.6" />
      <circle cx="16.5" cy="16.5" r="1.6" />
      <path d="M6 12h12" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="3.5" />
      <path d="M10.5 12.5 19 4" />
      <path d="M15.5 8 18 10.5" />
      <path d="M17.5 6 20 8.5" />
    </>
  ),
  record: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="5.5" strokeDasharray="1.5 3" />
    </>
  ),
  shirt: (
    <>
      <path d="M8 4 4 7l2 3 2-1.2V20h8V8.8L18 10l2-3-4-3-1.5 1.5a3 3 0 0 1-5 0Z" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 9h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
      <path d="M17 10.5h1.5a2 2 0 0 1 0 4H17" />
      <path d="M8 6c0-1 1-1 1-2" />
      <path d="M12 6c0-1 1-1 1-2" />
    </>
  ),
  fork: (
    <>
      <path d="M8 3v7a2 2 0 0 0 4 0V3" />
      <path d="M10 10v11" />
      <path d="M16 3c-1.2 1-1.2 4 0 5.5v9.5" />
    </>
  ),
  boat: (
    <>
      <path d="M4 14h16l-2 5H6Z" />
      <path d="M12 14V4" />
      <path d="M12 4 8 8h4Z" />
      <path d="M12 6l5 3" />
    </>
  ),
  column: (
    <>
      <path d="M4 6h16" />
      <path d="M4 20h16" />
      <path d="M6 8v10" />
      <path d="M10 8v10" />
      <path d="M14 8v10" />
      <path d="M18 8v10" />
      <path d="M3.5 6 12 2.5 20.5 6" />
    </>
  ),
  speaker: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="8.5" r="2" />
      <circle cx="12" cy="15" r="3.5" />
    </>
  ),
  moon: <path d="M18 13.5A7.5 7.5 0 1 1 10.5 6a6 6 0 0 0 7.5 7.5Z" />,
  market: (
    <>
      <path d="M4 8h16l-1.5 4h-13Z" />
      <path d="M6 12v7h12v-7" />
      <path d="M9.5 15v3" />
      <path d="M14.5 15v3" />
      <path d="M4 8 6 4h12l2 4" />
    </>
  ),
  suitcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
      <path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v2" />
      <path d="M3.5 13h17" />
    </>
  ),
  footprint: (
    <>
      <path d="M9 3.5c1.8 0 2.5 2 2.2 4.2-.3 2-1.5 2.8-1.5 5 0 2 1.3 2.8 1.3 5a3 3 0 0 1-6 0c0-3 1-4 1-7.2 0-3.4.2-7 3-7Z" />
      <circle cx="9.3" cy="4.3" r="0.8" />
    </>
  ),
  bus: (
    <>
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M4 11h16" />
      <circle cx="8" cy="19" r="1.4" />
      <circle cx="16" cy="19" r="1.4" />
      <path d="M7 8h2M15 8h2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  'cloud-sun': (
    <>
      <circle cx="8" cy="7.5" r="3" />
      <path d="M8 2.5v1.5M8 11v1.5M3.5 7.5H5M11 7.5h1.5M4.6 4.1l1 1M10.4 4.1l-1 1M4.6 10.9l1-1" />
      <path d="M9 20.5a4 4 0 0 1-.5-7.97A5 5 0 0 1 18 13.5a3.5 3.5 0 0 1-1 7Z" />
    </>
  ),
  'cloud-bolt': (
    <>
      <path d="M7 18.5a4 4 0 0 1-.5-7.97A5 5 0 0 1 16 12.5a3.5 3.5 0 0 1-1 7Z" />
      <path d="M12.5 13 10 17h3l-1.5 4" />
    </>
  ),
  cloud: <path d="M7 18a4 4 0 0 1-.5-7.97A5 5 0 0 1 16 11a3.5 3.5 0 0 1-1 7Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15 15" />
    </>
  ),
  grave: (
    <>
      <path d="M7 21V11a5 5 0 0 1 10 0v10Z" />
      <path d="M12 13.5v5" />
      <path d="M9.5 16h5" />
      <path d="M4 21h16" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7 10 4.5h4L15.5 7" />
      <circle cx="12" cy="13.5" r="3.4" />
    </>
  ),
}

export function Icon({
  name,
  className,
  style,
}: {
  name: IconName
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
