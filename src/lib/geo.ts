interface Coords {
  lat: number
  lng: number
}

export function distanceMeters(a: Coords, b: Coords): number {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Straight-line distance, not routed — a rough "how far" for at-a-glance use,
// not turn-by-turn (that's what the Directions button is for).
export function formatWalkingDistance(meters: number): string {
  const miles = meters / 1609.34
  const minutes = Math.max(1, Math.round(meters / 80)) // ~3 mph
  if (miles < 0.1) return `${minutes} MIN WALK`
  return `${miles.toFixed(1)} MI · ${minutes} MIN WALK`
}

// Gap from the previous stop in the day (or home base, for the first stop
// of a day). Straight-line fallback only — used when the Routes API call
// fails; otherwise formatRouteInfo below gives real routed data.
export function formatHopFromPrevious(meters: number, label = 'FROM LAST STOP'): string {
  const miles = meters / 1609.34
  const walkMinutes = Math.max(1, Math.round(meters / 80))
  if (miles <= 1.2) return `${walkMinutes} MIN WALK ${label}`
  return `${miles.toFixed(1)} MI ${label} · CONSIDER TRANSIT`
}
