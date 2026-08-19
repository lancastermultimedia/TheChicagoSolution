import { useEffect, useState } from 'react'
import { getRouteInfo, type RouteInfo } from './routes'

interface Coords {
  lat: number
  lng: number
}

export function useRouteInfo(cacheKey: string | null, origin: Coords | null, destination: Coords | null): RouteInfo | null {
  const [info, setInfo] = useState<RouteInfo | null>(null)

  useEffect(() => {
    if (!cacheKey || !origin || !destination) {
      setInfo(null)
      return
    }
    let cancelled = false
    getRouteInfo(cacheKey, origin, destination).then((result) => {
      if (!cancelled) setInfo(result)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, origin?.lat, origin?.lng, destination?.lat, destination?.lng])

  return info
}
