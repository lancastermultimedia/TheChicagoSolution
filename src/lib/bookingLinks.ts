// Verified real booking/ticket pages for the book-ahead stops — checked
// directly against each site rather than guessed, since a wrong link here
// is worse than the generic Google Maps fallback.
const BOOKING_LINKS: Record<string, string> = {
  'sat-03': 'https://www.chicagowatertaxi.com/buy-tickets/', // Water Taxi — matches the $10 Michigan Ave <-> Chinatown route exactly
  'sat-05': 'https://sales.artic.edu/', // Art Institute's own ticket sales page
  'sat-07': 'https://smartbarchicago.com/events/', // Smartbar's events calendar — they sell via Etix, this is the durable link
}

export function getBookingUrl(stopId: string): string | null {
  return BOOKING_LINKS[stopId] ?? null
}
