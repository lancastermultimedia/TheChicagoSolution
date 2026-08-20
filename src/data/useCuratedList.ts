import { useEffect, useState } from 'react'
import { CURATED_LISTS } from './curatedLists'
import { getCuratedPlaceDetails, type PlaceResult } from '../lib/places'

export function useCuratedList(category: 'bars' | 'restaurants') {
  const [results, setResults] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const entries = CURATED_LISTS[category]
    setLoading(true)
    Promise.all(
      entries.map((e) => getCuratedPlaceDetails(`${category}:${e.name}`, e.query ?? `${e.name} Chicago`)),
    ).then((found) => {
      if (cancelled) return
      setResults(found.filter((r): r is PlaceResult => r != null))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [category])

  return { results, loading }
}
