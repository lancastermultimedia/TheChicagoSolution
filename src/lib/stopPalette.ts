// Cycled per stop within a day (independent of the day's own accent color),
// borrowed from Bandmate's solid-block accent treatment (.ob-step tiles).
const STOP_COLORS = ['var(--color-teal)', 'var(--color-red)', 'var(--color-olive)']

export function getStopColor(indexInDay: number): string {
  return STOP_COLORS[indexInDay % STOP_COLORS.length]
}
