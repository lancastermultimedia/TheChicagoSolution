interface PatchProps {
  value: string
  label: string
  color?: string
  size?: number
}

export function Patch({ value, label, color = 'var(--color-ink)', size = 72 }: PatchProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, border: `1.6px solid ${color}`, color }}
    >
      <div
        className="absolute rounded-full"
        style={{ inset: 5, border: `1px dashed ${color}`, opacity: 0.55 }}
      />
      <span className="font-display leading-none" style={{ fontSize: size * 0.32 }}>
        {value}
      </span>
      <span className="font-label leading-none mt-1" style={{ fontSize: size * 0.11 }}>
        {label}
      </span>
    </div>
  )
}
