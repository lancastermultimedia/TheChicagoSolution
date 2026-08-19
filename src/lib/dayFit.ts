import { distanceMeters } from './geo'
import type { Day } from '../data/types'
import type { LiveStop } from '../data/liveTypes'

export interface DayFitSuggestion {
  dayId: string
  dayLabel: string
  nearestStopTitle: string
  meters: number
}

const SUGGEST_THRESHOLD_METERS = 2414 // ~1.5 miles — beyond this, don't bother suggesting a day

// Finds which day's plans this place is actually close to, so "found a
// coffee shop, is it near anything we're already doing" has an answer.
// Returns null rather than a far-fetched match if nothing's close enough.
export function findBestDayFit(
  pin: { lat: number; lng: number },
  stops: LiveStop[],
  stopCoords: Record<string, { lat: number; lng: number }>,
  days: Day[],
): DayFitSuggestion | null {
  let best: DayFitSuggestion | null = null

  for (const stop of stops) {
    const c = stopCoords[stop.id]
    if (!c) continue
    const meters = distanceMeters(pin, c)
    if (!best || meters < best.meters) {
      const day = days.find((d) => d.id === stop.day_id)
      best = { dayId: stop.day_id, dayLabel: day?.label ?? stop.day_id, nearestStopTitle: stop.title, meters }
    }
  }

  if (!best || best.meters > SUGGEST_THRESHOLD_METERS) return null
  return best
}

export function formatDayFit(fit: DayFitSuggestion): string {
  const miles = fit.meters / 1609.34
  const distanceLabel = miles < 0.15 ? 'right by' : `~${miles.toFixed(1)} mi from`
  return `Closest to ${fit.dayLabel}'s plans — ${distanceLabel} ${fit.nearestStopTitle}`
}
