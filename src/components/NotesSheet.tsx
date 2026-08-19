import { motion } from 'framer-motion'
import type { StopNotes } from '../lib/stopNotes'

export function NotesSheet({ notes, onClose }: { notes: StopNotes; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-40"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div
        className="bg-white border-t-[1.5px] border-ink p-5 flex flex-col gap-4 max-h-[75dvh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <button type="button" onClick={onClose} className="font-label text-[10px] text-grey self-start">
          ✕ Close
        </button>

        <h3 className="font-display text-2xl text-ink">House Notes</h3>

        {notes.sections.map((s) => (
          <div key={s.heading}>
            <p className="font-label text-[10px]" style={{ color: 'var(--color-teal)' }}>
              {s.heading.toUpperCase()}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {s.items.map((item, i) => (
                <li key={i} className="text-ink text-sm font-light leading-relaxed">
                  &middot; {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="font-label text-[10px] text-grey mt-1">FROM {notes.host.toUpperCase()}, YOUR HOST</p>
      </div>
    </motion.div>
  )
}
