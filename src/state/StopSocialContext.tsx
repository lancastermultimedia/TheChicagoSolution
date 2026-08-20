import { createContext, useContext, type ReactNode } from 'react'
import { useStopSocial } from '../data/useStopSocial'
import type { StopComment, StopLike } from '../data/liveTypes'

interface StopSocialState {
  likes: StopLike[]
  comments: StopComment[]
  loading: boolean
}

const StopSocialContext = createContext<StopSocialState | null>(null)

export function StopSocialProvider({ children }: { children: ReactNode }) {
  const value = useStopSocial()
  return <StopSocialContext.Provider value={value}>{children}</StopSocialContext.Provider>
}

export function useStopSocialContext() {
  const ctx = useContext(StopSocialContext)
  if (!ctx) throw new Error('useStopSocialContext must be used within StopSocialProvider')
  return ctx
}
