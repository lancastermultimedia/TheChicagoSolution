import type { Day } from '../data/types'
import type { LiveStop } from '../data/liveTypes'

export interface StopReference {
  id: string
  title: string
  address: string
}

// Friday's first stop is the literal departure from Lexington — comparing
// it to home base makes no sense before anyone's arrived. Every other day
// starts fresh from the Airbnb each morning, so that's the right reference
// point for "how far is the first stop."
export function getPreviousStopReference(
  day: Day,
  index: number,
  daysStops: LiveStop[],
  homeBase: { label: string; address: string },
): StopReference | null {
  if (index > 0) return daysStops[index - 1]
  if (day.id === 'fri') return null
  return { id: 'home-base', title: homeBase.label, address: homeBase.address }
}
