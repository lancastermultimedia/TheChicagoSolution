import { useState } from 'react'

// Tries a few common extensions before giving up — avatars just need to
// live at public/avatars/<playerId>.<ext>, whatever format that ends up being.
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

interface AvatarProps {
  playerId: string
  name: string
  size?: number
  className?: string
}

export function Avatar({ playerId, name, size = 40, className }: AvatarProps) {
  const [extIndex, setExtIndex] = useState(0)
  const exhausted = extIndex >= EXTENSIONS.length
  const initials = name.slice(0, 1).toUpperCase()

  if (exhausted) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-ink)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.42,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      key={extIndex}
      src={`/avatars/${playerId}.${EXTENSIONS[extIndex]}`}
      alt={name}
      onError={() => setExtIndex((i) => i + 1)}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        objectFit: 'cover',
        flexShrink: 0,
        border: '1.5px solid var(--color-ink)',
      }}
    />
  )
}
