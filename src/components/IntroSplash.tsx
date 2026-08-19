import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function IntroSplash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'skyline' | 'wordmark'>('skyline')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('wordmark'), 1500)
    const t2 = setTimeout(() => onDone(), 3300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: '#0F0F0C' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onDone}
    >
      <AnimatePresence mode="wait">
        {phase === 'skyline' ? (
          <motion.div
            key="skyline"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <SkylineArt />
          </motion.div>
        ) : (
          <motion.div
            key="wordmark"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center px-6 text-center"
          >
            <h1 className="font-display text-4xl leading-none" style={{ color: '#F8F5EE' }}>
              The Chicago Solution
            </h1>
            <p className="font-label text-[10px] mt-3" style={{ color: '#8A8A7C', letterSpacing: '0.12em' }}>
              BROUGHT TO YOU BY QUANNTECH INDUSTRIES
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Plain (non-animated-stroke) line art — a per-path draw animation was tried
// first but Framer Motion's pathLength trick doesn't handle these multi-
// segment paths cleanly (renders as disconnected dots). A simple fade/scale
// on the group above gives the "reveal" without that fragility.
function SkylineArt() {
  return (
    <svg
      viewBox="0 0 400 170"
      width={300}
      height={128}
      fill="none"
      stroke="#F8F5EE"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" y1="150" x2="390" y2="150" />

      {/* small building */}
      <path d="M20 150V118H55V150" />

      {/* Marina City twin towers */}
      <path d="M65 150V100A13 13 0 0 1 91 100V150M65 112H91M65 124H91M65 136H91" />
      <path d="M98 150V100A13 13 0 0 1 124 100V150M98 112H124M98 124H124M98 136H124" />

      {/* Willis Tower */}
      <path d="M145 150V70H155V50H175V70H185V150M162 50V20M172 50V26" />

      {/* John Hancock */}
      <path d="M205 150L212 60H230L237 150M212 60L237 150M230 60L212 150" />

      {/* spired building */}
      <path d="M252 150V85H278V85L265 65L252 85" />

      {/* filler buildings */}
      <path d="M292 150V108H316V150" />
      <path d="M324 150V125H352V150" />
      <path d="M360 150V95H384V150" />
    </svg>
  )
}
