import { useEffect } from 'react'

// iOS has a long-standing WebKit bug where svh/dvh/lvh all misreport inside
// an installed home-screen PWA (standalone display mode) — they can resolve
// a few dozen pixels taller than the actual visible area, pushing fixed
// bottom UI (our nav bar) off-screen. window.innerHeight is reliable there,
// so we measure it in JS and expose it as a CSS var, with 100svh as the
// fallback for the brief moment before the first measurement runs.
export function useAppHeight() {
  useEffect(() => {
    function setHeight() {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    setHeight()
    window.addEventListener('resize', setHeight)
    window.addEventListener('orientationchange', setHeight)
    return () => {
      window.removeEventListener('resize', setHeight)
      window.removeEventListener('orientationchange', setHeight)
    }
  }, [])
}
