import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface IdentityState {
  meId: string | null
  setMe: (id: string) => void
}

const IdentityContext = createContext<IdentityState | null>(null)

function readHash(): string | null {
  const match = window.location.hash.match(/me=([a-z0-9_-]+)/i)
  return match ? match[1] : null
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [meId, setMeId] = useState<string | null>(() => readHash())

  useEffect(() => {
    const onHashChange = () => setMeId(readHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const setMe = (id: string) => {
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
