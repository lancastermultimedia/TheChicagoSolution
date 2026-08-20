// Hand-picked recommendations from a friend's Google Maps saved lists.
// There's no public API for reading a saved list's contents (the share
// link is a client-rendered page, not fetchable data), so these are typed
// in by hand — each entry just needs a name specific enough for a Places
// text search to find the right venue; `query` overrides that search text
// for anything ambiguous (e.g. a common name, or one that needs a
// neighborhood hint to disambiguate).
export interface CuratedEntry {
  name: string
  query?: string
}

export const CURATED_LISTS: Record<'bars' | 'restaurants', CuratedEntry[]> = {
  bars: [],
  restaurants: [],
}
