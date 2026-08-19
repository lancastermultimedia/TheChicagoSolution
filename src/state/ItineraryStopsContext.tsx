import { createContext, useContext, type ReactNode } from 'react'
import { useItineraryStops } from '../data/useItineraryStops'
import type { LiveStop } from '../data/liveTypes'

interface ItineraryStopsState {
  stops: LiveStop[]
  loading: boolean
}

const ItineraryStopsContext = createContext<ItineraryStopsState | null>(null)

export function ItineraryStopsProvider({ children }: { children: ReactNode }) {
  const value = useItineraryStops()
  return <ItineraryStopsContext.Provider value={value}>{children}</ItineraryStopsContext.Provider>
}

export function useItineraryStopsContext() {
  const ctx = useContext(ItineraryStopsContext)
  if (!ctx) throw new Error('useItineraryStopsContext must be used within ItineraryStopsProvider')
  return ctx
}
