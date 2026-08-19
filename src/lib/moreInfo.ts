// Fallback for when Places details haven't loaded (or the key isn't
// configured) — a Maps search URL needs no key and still lands on a Google
// panel with photos, hours, and a website link.
export function getMoreInfoUrl(stop: { title: string; address: string }): string {
  const query = encodeURIComponent(`${stop.title} ${stop.address}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
