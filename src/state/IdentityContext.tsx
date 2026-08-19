import { createContext, useContext, useState, type ReactNode } from 'react'

interface IdentityState {
  meId: string | null
  setMe: (id: string) => void
}

const IdentityContext = createContext<IdentityState | null>(null)

const STORAGE_KEY = 'chicago-solution:me'

function readHash(): string | null {
  const match = window.location.hash.match(/me=([a-z0-9_-]+)/i)
  return match ? match[1] : null
}

// localStorage is the real source of truth — installed-PWA launches open the
// manifest's start_url (no hash), so a hash-only identity gets forgotten
// every time the app is reopened from the home screen. The hash is kept
// only so a shared link can still work before someone has claimed locally.
function readStoredId(): string | null {
  return localStorage.getItem(STORAGE_KEY) ?? readHash()
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [meId, setMeId] = useState<string | null>(() => readStoredId())

  const setMe = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    window.location.hash = `me=${id}`
    setMeId(id)
  }

  return <IdentityContext.Provider value={{ meId, setMe }}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
