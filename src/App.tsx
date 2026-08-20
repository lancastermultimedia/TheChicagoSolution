import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IdentityProvider, useIdentity } from './state/IdentityContext'
import { ItineraryStopsProvider } from './state/ItineraryStopsContext'
import { StopSocialProvider } from './state/StopSocialContext'
import { UserLocationProvider } from './state/UserLocationContext'
import { useTripData } from './data/useTripData'
import { ClaimScreen } from './features/claim/ClaimScreen'
import { HomeTab } from './features/home/HomeTab'
import { ItineraryFeed } from './features/itinerary/ItineraryFeed'
import { ExploreTab } from './features/explore/ExploreTab'
import { GalleryTab } from './features/gallery/GalleryTab'
import { ProposalPopup } from './features/proposals/ProposalPopup'
import { useOfflineStatus } from './lib/useOfflineStatus'
import { useAppHeight } from './lib/useAppHeight'
import { Icon } from './components/Icon'
import { IntroSplash } from './components/IntroSplash'

type Tab = 'home' | 'itinerary' | 'explore' | 'gallery'

const INTRO_SESSION_KEY = 'chicago-solution:intro-shown'

function App() {
  useAppHeight()
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SESSION_KEY))

  function dismissIntro() {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1')
    setShowIntro(false)
  }

  return (
    <IdentityProvider>
      <AnimatePresence>{showIntro && <IntroSplash onDone={dismissIntro} />}</AnimatePresence>
      <Gate />
    </IdentityProvider>
  )
}

function Gate() {
  const { meId } = useIdentity()
  const { data, loading } = useTripData()

  if (loading || !data) {
    return <div className="p-8 font-label text-sm text-grey">Loading…</div>
  }

  if (!meId || !data.players.some((p) => p.id === meId)) {
    return <ClaimScreen players={data.players} />
  }

  return (
    <ItineraryStopsProvider>
      <StopSocialProvider>
        <UserLocationProvider>
          <Main />
        </UserLocationProvider>
      </StopSocialProvider>
    </ItineraryStopsProvider>
  )
}

function Main() {
  const [tab, setTab] = useState<Tab>('home')
  const { isOnline, queueCount } = useOfflineStatus()

  return (
    // 100% of #root, which is itself pinned to exactly the visual viewport
    // (see index.css) — this is what actually keeps the nav glued to the
    // true bottom edge, not a viewport-unit value (svh/dvh/JS-measured
    // innerHeight all proved unreliable in iOS standalone PWA mode).
    <div className="flex flex-col" style={{ height: '100%' }}>
      {!isOnline && (
        <div className="shrink-0 px-4 py-2 text-center bg-ink" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <p className="font-label text-[10px] text-white">
            OFFLINE — SHOWING LAST KNOWN INFO
            {queueCount > 0 && ` · ${queueCount} CHANGE${queueCount === 1 ? '' : 'S'} WILL SYNC WHEN BACK ONLINE`}
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {tab === 'home' ? (
              <HomeTab />
            ) : tab === 'itinerary' ? (
              <ItineraryFeed />
            ) : tab === 'explore' ? (
              <ExploreTab />
            ) : (
              <GalleryTab />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="flex bg-white border-t-[1.5px] border-ink shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <TabButton active={tab === 'home'} onClick={() => setTab('home')} icon="sun" label="Home" />
        <TabButton active={tab === 'explore'} onClick={() => setTab('explore')} icon="compass" label="Explore" />
        <TabButton active={tab === 'itinerary'} onClick={() => setTab('itinerary')} icon="pin" label="Itinerary" />
        <TabButton active={tab === 'gallery'} onClick={() => setTab('gallery')} icon="camera" label="Gallery" />
      </nav>

      <ProposalPopup />
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: Parameters<typeof Icon>[0]['name']
  label: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="flex-1 flex flex-col items-center gap-1 py-3"
      style={{ color: active ? 'var(--color-teal)' : 'var(--color-grey)' }}
    >
      <Icon name={icon} className="w-5 h-5" />
      <span className="font-label text-[10px]">{label}</span>
    </motion.button>
  )
}

export default App
