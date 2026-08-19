import { useEffect, useState } from 'react'
import type { TripData } from './types'

interface TripDataState {
  data: TripData | null
  loading: boolean
  error: string | null
}

let cache: TripData | null = null

export function useTripData(): TripDataState {
  const [data, setData] = useState<TripData | null>(cache)
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache) return

    let cancelled = false
    fetch('/trip-data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load trip data (${res.status})`)
        return res.json() as Promise<TripData>
      })
      .then((json) => {
        if (cancelled) return
        cache = json
        setData(json)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
