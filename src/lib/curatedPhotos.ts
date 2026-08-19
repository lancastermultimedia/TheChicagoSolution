// Real photos for stops where Places search can't find (or mismatches) the
// actual venue — home base is a private rental, not a searchable business.
const CURATED_PHOTOS: Record<string, string> = {
  'fri-02': '/img/home-base.jpg', // Home Base: Ravenswood — real photo from the Airbnb listing
  'mon-02': '/img/home-base.jpg', // Pack Up — same address
}

export function getCuratedPhoto(stopId: string): string | null {
  return CURATED_PHOTOS[stopId] ?? null
}
