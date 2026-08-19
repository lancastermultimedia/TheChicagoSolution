import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface Coords {
  lat: number
  lng: number
}

const UserLocationContext = createContext<Coords | null>(null)

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) return

    function update() {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // denied, unavailable, or timed out — just stay null and degrade gracefully
        },
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
      )
    }

    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [])

  return <UserLocationContext.Provider value={coords}>{children}</UserLocationContext.Provider>
}

export function useUserLocation(): Coords | null {
  return useContext(UserLocationContext)
}
