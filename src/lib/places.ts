const PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined
const DETAILS_CACHE_PREFIX = 'chicago-solution:place-details:'

export function placesConfigured(): boolean {
  return Boolean(PLACES_KEY)
}

export interface PlaceResult {
  id: string
  name: string
  address: string
  rating: number | null
  userRatingCount: number | null
  priceLevel: string | null
  photoUrl: string | null
  googleMapsUri: string | null
  websiteUri: string | null
  editorialSummary: string | null
  lat: number | null
  lng: number | null
}

const PRICE_LEVEL_LABELS: Record<string, string> = {
  PRICE_LEVEL_FREE: 'FREE',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
}

export function formatPriceLevel(priceLevel: string | null): string | null {
  return priceLevel ? (PRICE_LEVEL_LABELS[priceLevel] ?? null) : null
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.photos',
  'places.googleMapsUri',
  'places.websiteUri',
  'places.editorialSummary',
  'places.location',
].join(',')

function photoNameToUrl(name: string | undefined): string | null {
  return name ? `https://places.googleapis.com/v1/${name}/media?maxWidthPx=900&key=${PLACES_KEY}` : null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlaceResult(p: any): PlaceResult {
  return {
    id: p.id,
    name: p.displayName?.text ?? '',
    address: p.formattedAddress ?? '',
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
    priceLevel: p.priceLevel ?? null,
    photoUrl: photoNameToUrl(p.photos?.[0]?.name),
    googleMapsUri: p.googleMapsUri ?? null,
    websiteUri: p.websiteUri ?? null,
    editorialSummary: p.editorialSummary?.text ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
  }
}

async function textSearch(
  textQuery: string,
  opts: { center?: { lat: number; lng: number }; radiusMeters?: number; maxResultCount?: number } = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  if (!PLACES_KEY) return []

  const body: Record<string, unknown> = { textQuery, maxResultCount: opts.maxResultCount ?? 1 }
  if (opts.center) {
    body.locationBias = {
      circle: {
        center: { latitude: opts.center.lat, longitude: opts.center.lng },
        radius: opts.radiusMeters ?? 1500,
      },
    }
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Places search failed (${res.status})`)
  const json = await res.json()
  return json.places ?? []
}

// The stop's own details — cached per stop+query. Keyed on the query text
// too (not just stopId) so a swap, which changes the title/address, misses
// the old cache instead of showing the previous venue's stale photo/rating.
export async function getStopPlaceDetails(stopId: string, query: string): Promise<PlaceResult | null> {
  if (!PLACES_KEY) return null

  const cacheKey = `${DETAILS_CACHE_PREFIX}${stopId}::${query}`
  const cached = localStorage.getItem(cacheKey)
  if (cached !== null) return cached === 'null' ? null : (JSON.parse(cached) as PlaceResult)

  try {
    const places = await textSearch(query, { maxResultCount: 1 })
    const result = places[0] ? toPlaceResult(places[0]) : null
    localStorage.setItem(cacheKey, result ? JSON.stringify(result) : 'null')
    return result
  } catch {
    return null
  }
}

export interface PlaceSuggestion {
  placeId: string
  mainText: string
  secondaryText: string
}

// As-you-type suggestions for the Explore search bar. Deliberately a
// separate lightweight endpoint from searchText — autocomplete returns
// predictions fast without pulling photos/ratings/etc for every keystroke.
export async function autocompletePlaces(
  input: string,
  center: { lat: number; lng: number } | null,
): Promise<PlaceSuggestion[]> {
  if (!PLACES_KEY || !input.trim()) return []

  const body: Record<string, unknown> = { input }
  if (center) {
    body.locationBias = {
      circle: { center: { latitude: center.lat, longitude: center.lng }, radius: 15_000 },
    }
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': PLACES_KEY },
      body: JSON.stringify(body),
    })
    if (!res.ok) return []
    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.suggestions ?? [])
      .map((s: any) => s.placePrediction)
      .filter(Boolean)
      .map((p: any) => ({
        placeId: p.placeId,
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
      }))
  } catch {
    return []
  }
}

// Nearby search — deliberately not cached, this is meant to be re-run as
// people change categories/search terms.
export async function searchPlacesNearby(
  query: string,
  center: { lat: number; lng: number } | null,
  maxResultCount = 12,
): Promise<PlaceResult[]> {
  if (!PLACES_KEY) return []
  try {
    const places = await textSearch(query, { center: center ?? undefined, maxResultCount })
    return places.map(toPlaceResult)
  } catch {
    return []
  }
}
