const PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined
const ROUTE_CACHE_PREFIX = 'chicago-solution:route:'
const WALK_MAX_MINUTES = 25

export interface RouteInfo {
  mode: 'walk' | 'transit'
  durationMinutes: number
  distanceMeters: number
  transitLines: string[]
  vehicleLabel: string | null
}

const VEHICLE_LABELS: Record<string, string> = {
  BUS: 'Bus',
  INTERCITY_BUS: 'Bus',
  TROLLEYBUS: 'Bus',
  SUBWAY: 'Train',
  HEAVY_RAIL: 'Train',
  LIGHT_RAIL: 'Train',
  RAIL: 'Train',
  COMMUTER_TRAIN: 'Train',
  HIGH_SPEED_TRAIN: 'Train',
  LONG_DISTANCE_TRAIN: 'Train',
  METRO_RAIL: 'Train',
  MONORAIL: 'Train',
  FERRY: 'Ferry',
  CABLE_CAR: 'Tram',
  GONDOLA_LIFT: 'Tram',
  FUNICULAR: 'Tram',
}

interface Coords {
  lat: number
  lng: number
}

async function computeRoute(
  origin: Coords,
  destination: Coords,
  travelMode: 'WALK' | 'TRANSIT',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  if (!PLACES_KEY) return null

  const fieldMask =
    travelMode === 'TRANSIT'
      ? 'routes.duration,routes.distanceMeters,routes.legs.steps.travelMode,routes.legs.steps.transitDetails.transitLine.name,routes.legs.steps.transitDetails.transitLine.vehicle.type'
      : 'routes.duration,routes.distanceMeters'

  const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode,
    }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.routes?.[0] ?? null
}

function parseDurationMinutes(duration: string | undefined): number {
  if (!duration) return 0
  return Math.round(parseInt(duration, 10) / 60)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTransit(route: any): { lines: string[]; vehicleLabel: string | null } {
  const steps = route.legs?.[0]?.steps ?? []
  const lines: string[] = []
  let vehicleLabel: string | null = null
  for (const step of steps) {
    const line = step.transitDetails?.transitLine
    if (!line) continue
    if (line.name && !lines.includes(line.name)) lines.push(line.name)
    if (!vehicleLabel && line.vehicle?.type) vehicleLabel = VEHICLE_LABELS[line.vehicle.type] ?? 'Transit'
  }
  return { lines, vehicleLabel }
}

// Real routed data (walk first, transit if the walk is long) instead of a
// straight-line guess — cached per stop pair since the route doesn't change.
export async function getRouteInfo(cacheKey: string, origin: Coords, destination: Coords): Promise<RouteInfo | null> {
  if (!PLACES_KEY) return null

  const key = ROUTE_CACHE_PREFIX + cacheKey
  const cached = localStorage.getItem(key)
  if (cached !== null) return cached === 'null' ? null : (JSON.parse(cached) as RouteInfo)

  let result: RouteInfo | null = null

  try {
    const walkRoute = await computeRoute(origin, destination, 'WALK')
    const walkMinutes = walkRoute ? parseDurationMinutes(walkRoute.duration) : null

    if (walkRoute && walkMinutes !== null && walkMinutes <= WALK_MAX_MINUTES) {
      result = {
        mode: 'walk',
        durationMinutes: walkMinutes,
        distanceMeters: walkRoute.distanceMeters ?? 0,
        transitLines: [],
        vehicleLabel: null,
      }
    } else {
      const transitRoute = await computeRoute(origin, destination, 'TRANSIT')
      if (transitRoute) {
        const { lines, vehicleLabel } = extractTransit(transitRoute)
        result = {
          mode: 'transit',
          durationMinutes: parseDurationMinutes(transitRoute.duration),
          distanceMeters: transitRoute.distanceMeters ?? 0,
          transitLines: lines,
          vehicleLabel,
        }
      } else if (walkRoute && walkMinutes !== null) {
        // no transit route available — fall back to the (long) walk time
        result = {
          mode: 'walk',
          durationMinutes: walkMinutes,
          distanceMeters: walkRoute.distanceMeters ?? 0,
          transitLines: [],
          vehicleLabel: null,
        }
      }
    }
  } catch {
    result = null
  }

  localStorage.setItem(key, result ? JSON.stringify(result) : 'null')
  return result
}

export function formatRouteInfo(info: RouteInfo, label = 'FROM LAST STOP'): string {
  if (info.mode === 'walk') return `${info.durationMinutes} MIN WALK ${label}`
  const vehicle = (info.vehicleLabel ?? 'Transit').toUpperCase()
  const lines = info.transitLines.length ? ` · ${info.transitLines.join(' + ').toUpperCase()}` : ''
  return `${info.durationMinutes} MIN ${vehicle}${lines} ${label}`
}
