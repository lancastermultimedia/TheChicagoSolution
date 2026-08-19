import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Day } from '../../data/types'
import type { LiveStop } from '../../data/liveTypes'
import { stopsForDay } from '../../data/useItineraryStops'

interface PlacementPickerProps {
  days: Day[]
  stops: LiveStop[]
  defaultDayId: string
  color: string
  onChoose: (dayId: string, afterStopId: string | null) => void
}

export function PlacementPicker({ days, stops, defaultDayId, color, onChoose }: PlacementPickerProps) {
  const [dayId, setDayId] = useState(defaultDayId)
  const daysStops = stopsForDay(stops, dayId)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDayId(d.id)}
            className="font-label text-[10px] px-2.5 py-1.5 border-[1.5px]"
            style={
              dayId === d.id
                ? { background: color, color: 'var(--color-white)', borderColor: color }
                : { borderColor: color, color }
            }
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="border-[1.5px] border-ink bg-white">
        <GapRow label="Start of the day" color={color} onClick={() => onChoose(dayId, null)} />
        {daysStops.map((s, i) => (
          <div key={s.id}>
            <div className="px-3 py-2 font-mono text-[10px] text-grey border-t border-ink/15">
              {s.time_label.toUpperCase()} — {s.title}
            </div>
            <GapRow
              label={i === daysStops.length - 1 ? 'End of the day' : `After ${s.title}`}
              color={color}
              onClick={() => onChoose(dayId, s.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function GapRow({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left px-3 py-2 font-label text-[9px] border-t border-ink/15"
      style={{ color }}
    >
      + INSERT — {label.toUpperCase()}
    </motion.button>
  )
}
