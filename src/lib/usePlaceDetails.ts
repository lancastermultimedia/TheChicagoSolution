import { useEffect, useState } from 'react'
import { getStopPlaceDetails, placesConfigured, type PlaceResult } from './places'

export function usePlaceDetails(stopId: string, query: string): PlaceResult | null {
  const [details, setDetails] = useState<PlaceResult | null>(null)

  useEffect(() => {
    if (!placesConfigured() || !stopId) return
    let cancelled = false
    getStopPlaceDetails(stopId, query).then((result) => {
      if (!cancelled) setDetails(result)
    })
    return () => {
      cancelled = true
    }
  }, [stopId, query])

  return details
}
