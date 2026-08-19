export function getDirectionsUrl(address: string) {
  const encoded = encodeURIComponent(address)
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document || /iPhone|iPad|iPod/.test(navigator.userAgent)
  return isApple
    ? `https://maps.apple.com/?daddr=${encoded}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
}
