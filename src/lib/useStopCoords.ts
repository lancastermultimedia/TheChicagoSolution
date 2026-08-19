import { useEffect, useState } from 'react'
import { getStopPlaceDetails, placesConfigured } from './places'
import type { LiveStop } from '../data/liveTypes'

interface Coords {
  lat: number
  lng: number
}

// Resolves (and relies on getStopPlaceDetails' own localStorage cache for)
// coordinates for every real stop, so "which day is this Explore pin closest
// to" is just local math afterward instead of a live lookup per tap.
export function useStopCoords(stops: LiveStop[]): Record<string, Coords> {
  const [coords, setCoords] = useState<Record<string, Coords>>({})

  useEffect(() => {
    if (!placesConfigured()) return
    let cancelled = false

    const withVenue = stops.filter((s) => s.category)
    Promise.all(
      withVenue.map(async (s) => {
        const details = await getStopPlaceDetails(s.id, `${s.title} ${s.address}`)
        return details?.lat != null && details?.lng != null ? ([s.id, { lat: details.lat, lng: details.lng }] as const) : null
      }),
    ).then((results) => {
      if (cancelled) return
      const next: Record<string, Coords> = {}
      for (const r of results) {
        if (r) next[r[0]] = r[1]
      }
      setCoords(next)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops.length])

  return coords
}
