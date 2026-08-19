import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  color?: string
  filled?: boolean
}

export function Chip({ children, color = 'var(--color-ink)', filled = false }: ChipProps) {
  return (
    <span
      className="font-label inline-flex items-center px-2 py-1 text-[10px] leading-none"
      style={
        filled
          ? { background: color, color: 'var(--color-white)', border: `1px solid ${color}` }
          : { color, border: `1px solid ${color}` }
      }
    >
      {children}
    </span>
  )
}
