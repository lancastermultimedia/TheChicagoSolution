import type { DayAccent } from '../data/types'

interface AccentTokens {
  base: string
  dark: string
  pale: string
}

// trip-data.json's `accent` field keeps its original keys (orange/teal/
// mustard/brick) — remapped here onto the Bandmate palette so the data file
// doesn't need to change. Monday (brick) gets a quiet ink/grey treatment
// instead of a fourth invented hue — its brief is "kept intentionally open,"
// so a neutral day fits better than forcing another saturated color into a
// palette that was deliberately built around three accents.
export const ACCENTS: Record<DayAccent, AccentTokens> = {
  orange: { base: 'var(--color-teal)', dark: 'var(--color-teal-dark)', pale: 'var(--color-teal-pale)' }, // Friday
  teal: { base: 'var(--color-red)', dark: 'var(--color-red-dark)', pale: 'var(--color-red-pale)' }, // Saturday
  mustard: { base: 'var(--color-olive)', dark: 'var(--color-olive-dark)', pale: 'var(--color-olive-pale)' }, // Sunday
  brick: { base: 'var(--color-ink)', dark: 'var(--color-ink)', pale: 'var(--color-border)' }, // Monday
}
