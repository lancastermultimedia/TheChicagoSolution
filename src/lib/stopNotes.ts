// Transcribed from the host's actual pre-arrival messages (Regina), not
// generated — parking rules, house rules, check-in/out, in her own terms.
export interface StopNotes {
  host: string
  sections: { heading: string; items: string[] }[]
}

const STOP_NOTES: Record<string, StopNotes> = {
  'fri-02': {
    host: 'Regina',
    sections: [
      {
        heading: 'Check-In',
        items: [
          'Instructions post on Airbnb a few days before the stay — check the reservation in the Airbnb app.',
          'Host recommends turning on notifications in the Airbnb app before the trip.',
        ],
      },
      {
        heading: 'Parking',
        items: [
          'Free street parking.',
          'No parking on the street 9:00–11:00 AM, Monday–Friday only — fine the rest of the day, and the rule doesn’t apply at all on weekends.',
          'Ainsley St (a block away) works too, or anywhere else in the neighborhood outside that window.',
          'Daytime spots are easy. Nighttime can be tight — plan accordingly.',
        ],
      },
      {
        heading: 'House Rules',
        items: [
          'No parties, no loud music, no smoking.',
          'No shoes inside.',
          'No unregistered guests.',
          'Please don’t use the towels to remove makeup.',
          'Turn off the AC/heat when you leave the apartment.',
        ],
      },
      {
        heading: 'Check-Out',
        items: ['Leave keys in the lockbox.', 'Late check-out fee: $300.'],
      },
    ],
  },
}

export function getStopNotes(stopId: string): StopNotes | null {
  return STOP_NOTES[stopId] ?? null
}
