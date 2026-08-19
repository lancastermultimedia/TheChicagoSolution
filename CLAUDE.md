# The Chicago Solution — Interactive Trip App

## What this is

A mobile-first web app that turns a real long-weekend trip itinerary (Chicago, Aug 21–24, 2026, five friends) into a live, playable "game show." It replaces a static PDF itinerary with a dynamic, swipeable, full-screen itinerary; layers a points-based game on top (challenges, drinking games, dares, steals, penalties); lets the group vote on swaps and detours in real time; surfaces "what's nearby" suggestions on demand; and collects a shared, tagged photo gallery that becomes an auto-generated recap at the end of the trip.

This file is the seed brief for a Claude Code session. `trip-data.json` in this same folder has the real itinerary content (days, stops, addresses, times) and a starter challenge deck already ported over — use it as real data, not a placeholder.

Read this whole file before writing code. Ask the user (not yourself) before making an irreversible architecture call not already decided below.

---

## Trip context (real, not fictional — use as-is)

- **Dates:** Friday Aug 21 – Monday Aug 24, 2026
- **Crew (5):** Wils, Jack, Nick, Eric, Will — Wils is the organizer / de facto "game show host" (gets tiebreak authority in voting, see below)
- **Home base:** 4689 N Hermitage Ave, Ravenswood, Chicago — 5 min walk from the Damen Brown Line stop
- **Shape of the trip:** Friday = settling in near home base (records, coffee, a jazz bar). Saturday = the big day (water taxi → Chinatown → Art Institute → Smartbar at night). Sunday = deliberately slow — thrift & record crawl through Wicker Park/Logan Square. Monday = coffee, then the drive home.
- Full day-by-day content, real addresses, and times are in `trip-data.json`.

---

## Design system — reuse exactly, don't reinterpret

The group already has a beautifully designed static itinerary (mid-century-modern meets 1960s-NASA-graphics-manual). The app must look and feel like a direct continuation of it, just interactive. Below are the exact tokens from that document.

### Color palette

```css
--cream:      #F3EAD8;   /* app background, light surfaces */
--paper:      #FBF5E8;   /* card backgrounds */
--navy:       #1B2A3C;   /* primary dark surface (cover, nav, back cover) */
--navy-2:     #233650;
--orange:     #DD5B2E;   /* Friday accent */
--orange-dark:#B8431C;
--teal:       #1E7E78;   /* Saturday accent */
--teal-dark:  #155C58;
--mustard:    #E4A93C;   /* Sunday accent */
--mustard-dark:#C4881E;
--brick:      #A23829;   /* Monday accent */
--ink:        #20293A;   /* primary text */
--ink-soft:   #4B5568;   /* secondary text */
```

Each day of the trip keeps its own accent color throughout the app (Friday = orange, Saturday = teal, Sunday = mustard, Monday = brick) — used on day headers, timeline nodes, and anything scoped to that day. This mapping is load-bearing for the whole visual system; don't reassign it.

### Type

```css
--font-display: 'Futura', 'Century Gothic', 'Avenir Next', 'Trebuchet MS', sans-serif; /* headlines, big numbers */
--font-body:    'Helvetica Neue', Helvetica, Arial, sans-serif;                         /* body copy */
--font-mono:    'Courier New', Courier, monospace;                                      /* labels, timestamps, technical readouts — ALL CAPS, letter-spaced */
```

System font stacks on purpose (no web font loading) — keep it that way for reliability offline.

### Recurring motifs (carry these into the app; they're the visual signature)

- **Patch badge** — a circle with a thin dashed inner ring, a big number or short label in the center, a smaller all-caps mono label underneath. Used for day numbers (01–04), and should become the shape used for the "passport stamp" collectibles (see Gamification below).
- **Timeline** — vertical line of numbered/iconed circular nodes connected by a dashed vertical connector, each node paired with a card to its right. This is the natural pattern for the itinerary feed — keep it, just make it interactive (tap to expand, swipe to see nearby, etc.) instead of static.
- **Day band** — a full-bleed gradient header per day (day's accent color → a darker shade of itself) containing: day number patch, day name + date, one-line objective, and a stat rail (weather / walk distance / getting-around / a fourth contextual stat) separated by thin vertical rules.
- **Chips** — pill-shaped outlined tags in mono caps: `FLEX`, `BOOK AHEAD`, `LOCAL TIP` in the original doc. Extend this system for the game (`+10 PTS`, `PHOTO REQUIRED`, `DRINKING`, `VOTE OPEN`, etc.) using the same visual language.
- **Custom line icons** — hand-drawn SVG symbols, stroke-based, 1.6px stroke, rounded caps/joins, no fill. There's a small existing sprite (car, key, record, shirt, coffee, fork, boat, column, speaker, moon, market, suitcase, footprint, bus, pin, sun, cloud-sun, cloud-bolt). Extend this set in the same hand rather than dropping in a mismatched icon library. If a broader icon set is genuinely needed faster than hand-drawing more, Lucide icons (stroke-based, rounded) are the closest existing match — restyle stroke width/color to fit, but prefer hand-drawn extensions of the existing sprite where practical.
- **Orbit rings** — faint concentric circles as background decoration (used heavily on the cover). Nice as a subtle background flourish on the home tab / loading states, used sparingly elsewhere.
- **Cards** — 1.4–1.6px solid ink border, 4px radius, cream/paper fill, no drop shadows. Keep flat — this design system has no shadows or gradients except the day-band headers. Depth comes from borders and color blocking, not elevation.

### Layout doctrine for the app specifically

- **Mobile-first, one primary column.** No sidebars, no dense multi-column dashboards.
- **Each itinerary stop takes the full viewport height** — this was explicit in the brief. Implement the itinerary feed as a vertical scroll-snap sequence (`scroll-snap-type: y mandatory`, each stop `scroll-snap-align: start`, `min-height: 100dvh`). It should feel like flipping through slides, not scrolling a dense list.
- Keep the flat/technical-diagram feel: thin rules, dashed lines, mono-spaced labels, no skeuomorphism, no heavy shadows, no rounded-blob buttons. Buttons and inputs should look like they belong on the same page as the timeline chips — outlined, rectangular-ish with small radius, mono-caps labels.

---

## Core features

### 1. Home tab — the day brief

- Shows the current day's band (reuse the day-band component) with a one-line "brief" pulled from that day's data.
- **"What's up next"** — the single most important live element. Shows the next unstarted stop: name, time, a live countdown if it has a fixed time, current weather, and two tap targets: **Directions** (deep-links to Apple Maps on iOS / Google Maps on Android, or lets the user choose) and the **nearby dropdown** (see below). This section re-evaluates automatically as stops get marked done or as time passes — it's not something anyone manually advances (though manual "mark done / skip" should also be possible, since plans slip).
- Below that: a compact progress rail for the rest of today, and the live point leaderboard (top 5, always visible, this is a game after all).

### 2. Dynamic, interactive itinerary

- Full itinerary lives as a scroll-snap sequence of full-screen stop cards (see layout doctrine above), grouped by day, day accent color driving each stop's styling.
- Each stop card: time, title, address, description, tags (flex/book-ahead/etc., extended with game tags where relevant), a **Directions** button, and the nearby-search affordance below.
- **Nearby search dropdown.** A chevron/expand control on every stop. Tapping it expands an inline panel (doesn't navigate away — keep the person in the flow) showing a horizontally-scrollable set of nearby suggestions, filterable by category chips: Coffee, Records, Thrift, Parks/Attractions, Food, Bars. Cards in this panel should be a compact version of the same stop-card visual language.
- **"See other options"** — a button in that panel that swaps in 2 more results in the same category/area, paginating through the underlying places search rather than re-querying from scratch.
- **Propose a swap.** From the nearby panel, a person can propose swapping the current stop for a nearby alternative (or just proposing a brand new addition). This creates a live vote (see Voting below) visible to everyone.

### 3. Voting

- Any of the 5 can propose: a stop swap, a new addition, or a "should we do X" quick poll.
- Each proposal is a card (same visual language as everything else) with yes/no or A/B options, live tally, and shows who's voted.
- **Resolution rule:** majority of 5 (i.e., 3+) auto-resolves immediately once reached — no need to wait for all 5. If it's a straight tie situation that can't reach 3 (e.g. 2-2 with one abstaining past a reasonable window), Wils (the host) casts the deciding vote. Auto-expire proposals that get no votes after a reasonable window (e.g. 20 minutes) so stale polls don't clutter the feed.
- Applying a swap updates the shared itinerary state for everyone (see Data & Sync below) — this is the same sync mechanism as the point system, not a separate thing.

### 4. Gamification — "The Chicago Solution Game Show"

- **Claiming.** On first load, each person picks their name from the 5-person roster (no accounts/passwords — this is a trusted friend group). Store identity in the URL hash (e.g. `#me=jack`) so a bookmarked/re-shared link remembers who's who without relying on storage that might not survive a browser/app switch.
- **Challenge deck.** Pulled from `trip-data.json` — categories: crate-digging, thrift, food/drink, culture (Art Institute scavenger items), transit, dance floor, plus **drinking challenges** and **debauchery/funny challenges** (secret-sharing, dares, impressions). Each challenge has a point value, a type (photo-required / honor-system), and whether it's steal-eligible.
- **Photo-required challenges** submit through the shared photo gallery (see below), tagged with the challenge + the person — that submission is what completes the challenge and awards points.
- **Steal mechanic.** A steal-eligible challenge someone already completed can be "topped" by another player (funnier photo, better find, group-judged) — group vote (same voting system) reassigns the points on a majority.
- **Penalties.** A short list of small negative-point joke penalties (defined in `trip-data.json`) — self-reportable or callable-out by anyone, confirmed by a quick reaction/vote to prevent grief-reporting.
- **Wager round.** One flagged moment in the data (Saturday night, pre-Smartbar) where players can wager banked points on a single high-stakes challenge, double-or-nothing style.
- **Drinking-game content guardrails:** every drinking challenge needs a stated non-alcoholic equivalent baked into its text (e.g., "cheers a stranger — water counts"), keep quantities implied small ("a sip," never "a shot" repeated or anything that reads as a chugging contest), and nothing that pressures a specific person by name. Keep it funny, not a reason for anyone to feel obligated to overdo it.
- **Passport / stamps.** Big milestones (first stop of each neighborhood, each fixed event) unlock a patch badge (reuse the patch component) in a personal "passport" view. Purely a nice-to-have collectible layer on top of points.
- **Leaderboard** — always-visible running total, with a breakdown by category available on tap (who's winning at crate-digging vs. who's winning at debauchery, etc.).
- **Day-end recap** — a generated card each night: points earned, challenges completed, top photo, day's "MVP." These recap cards are also the building blocks for the final slideshow.
- **Final slideshow** — end-of-trip auto-generated recap (superlatives like "Best Find," "Most Chicago Thing That Happened," plus the full tagged photo set) assembled from the day-end recaps + photo gallery. Doesn't need to be built as a separate export format necessarily — an in-app "recap" view that's screenshot/shareable is enough for v1; a proper exportable video/PDF slideshow is a stretch goal.

### 5. Maps, weather, nearby search — technical approach

- **Provider: Google Maps Platform** (the user already has a Google API account — use it, no need to evaluate alternatives). Enable the **Maps JavaScript API** and **Places API (New)**.
- **Map rendering (in-app, styled to match):** don't embed a default-styled map — use Google's Cloud-based Map Styling (create a Map ID in Google Cloud Console, define a custom style pulling from the palette above: cream/paper land, ink roads, muted teal water) so the embedded map actually looks like it belongs in this app. Use `@vis.gl/react-google-maps` (the actively-maintained official-adjacent React wrapper) rather than a stale community package.
- **"Open in Maps" deep links:** for actual turn-by-turn navigation, don't try to build that in-app — deep-link out to the native app. Use `https://maps.apple.com/?daddr=<address>` on iOS and `https://www.google.com/maps/dir/?api=1&destination=<address>` elsewhere, or offer both as two small buttons and let the person pick. Embed for browsing, hand off to native for actual navigation — standard pattern.
- **Nearby/places search:** use the Places API (New) `searchNearby` / `searchText` endpoints for the "what's nearby" and "see other options" features, filtered to the category chips (coffee, records/music, thrift/vintage, parks, food, bars) via Places `includedType`s and keyword text. Restrict the API key by HTTP referrer (the Netlify domain, see Hosting below) rather than trying to keep it secret — Maps/Places keys are meant to be client-visible and secured that way, not hidden.
- **Weather:** a free, no-key weather API is fine here (e.g., the National Weather Service API for US locations — what the static itinerary's forecast was pulled from — or Open-Meteo, which is free and keyless). No need to route this through Google. Cache the day's forecast; refresh a few times a day, not on every load.

### 6. Shared photo gallery

- Every photo submitted (whether attached to a challenge or just posted) is visible to all 5 in a shared, chronological + filterable-by-person/by-day gallery.
- Use **Supabase Storage** (a bucket for this trip's photos) rather than a separate image-hosting vendor — one less account, and it stays inside the same project as everything else. Client uploads directly to the bucket using the Supabase JS client; a `photos` table stores metadata (storage path, uploader, challenge id if applicable, day, timestamp, caption) so the gallery and recap slideshow can filter/query by any of that. Compress/resize images client-side before upload (a phone photo doesn't need to be full resolution for this) to stay comfortably inside the free storage tier over the weekend.
- Because this rides on the same Supabase Realtime layer as everything else, new photos can appear in everyone's gallery live, not just on next refresh.
- Gallery view should use the same visual language — think a grid of cards, not a generic camera-roll UI.

### 7. Offline mode

- This is a PWA (installable, home-screen icon using the patch mark as the app icon, `theme-color` set to navy).
- Service worker caches: the app shell, `trip-data.json`, and the last-fetched map tiles/nearby results for stops already viewed. The itinerary, the challenge deck, and anyone's already-loaded photos/leaderboard state should all work with zero signal — this matters in practice (the L goes underground, Smartbar's basement has no signal).
- Writes made offline (points, votes, photo uploads) queue locally (IndexedDB, not localStorage) and flush automatically on reconnect. iOS Safari does not reliably support the Background Sync API — implement the retry-on-reconnect queue manually via `online`/`offline` events rather than depending on it.
- New nearby-search queries and fresh map tiles obviously require connectivity — degrade gracefully (show cached data + a small "offline — showing last known info" indicator, not an error state).

---

## Data & sync architecture

**Decision:** shared state (points, votes, itinerary swaps, photos) lives in **Supabase** (Postgres + Realtime + Storage). The user already has a Supabase account, a Google API account, a GitHub account, and a Netlify account — use all four for what they're actually good at rather than making one do double duty:

- **Supabase** — the database, the live sync layer, and the photo storage bucket.
- **GitHub** — source control only. A normal repo, normal commits.
- **Netlify** — hosting, connected to the GitHub repo for auto-deploy on push. Also available for a serverless Function later if a genuine server-side need shows up (it likely won't for this project).
- **Google Maps Platform** — maps + places, per the section above.

### Suggested schema (adjust as needed once building — this is a starting point, not gospel)

- `players` — id, name (seeded with the 5 names from `trip-data.json`), color/accent if wanted.
- `points_events` — id, player_id, challenge_id (nullable, for freeform/penalty entries), delta (can be negative), reason, created_at. **The leaderboard is a derived sum over this table, not a mutable counter** — keeps a full audit trail ("wait, who gave Jack -5?") and makes the steal mechanic trivial (just another event referencing the same challenge).
- `challenges` — seeded from `trip-data.json`'s challenge deck: id, title, description, category, points, type (photo/honor), steal_eligible (bool), is_drinking (bool).
- `itinerary_stops` — seeded from `trip-data.json`: id, day, order, title, address, time, description, tags, status (planned/done/skipped/swapped), swapped_from_place_id (nullable, for stops added via a resolved vote).
- `proposals` — id, type (swap/addition/quick-poll), created_by, options (jsonb), status (open/resolved/expired), resolved_option, created_at.
- `votes` — id, proposal_id, player_id, option, created_at. Unique constraint on (proposal_id, player_id) so a vote can be changed but not duplicated.
- `photos` — id, storage_path, uploaded_by, challenge_id (nullable), day, caption, created_at.

### Realtime

Subscribe to Postgres changes (or use Supabase Broadcast, either works) on `points_events`, `proposals`, `votes`, `itinerary_stops`, and `photos` — this replaces polling entirely. Updates should feel instant across all 5 phones, which is a real upgrade over anything file-based.

### Access model

No need to build real auth for this — it's 5 trusted friends for one weekend. Use the Supabase **anon public key** client-side (this is by design; Supabase's security model assumes the anon key is public and enforces access via Row Level Security policies, not key secrecy — unlike a raw GitHub token, there's no "oops it's exposed" problem here). Set permissive RLS policies (allow read/write on all the above tables) scoped to this project — call this out as an intentional low-stakes tradeoff for a private trip app, not something to carry into anything more sensitive.

### Offline writes

Same principle as before, different destination: queue writes locally (IndexedDB) when offline, flush to Supabase on reconnect via `online`/`offline` listeners (don't depend on the Background Sync API — unreliable on iOS Safari).

---

## Suggested tech stack

- **Vite + React + TypeScript** — fast, simple, good PWA tooling support.
- **Tailwind CSS**, configured with the palette/fonts above as design tokens (not ad hoc hex codes scattered through components).
- **Framer Motion** for the full-screen scroll-snap transitions and the expand/collapse of the nearby panel — this is where "smooth and slick" actually gets won or lost.
- **vite-plugin-pwa** (Workbox under the hood) for the service worker / offline story.
- **`@supabase/supabase-js`** for the database/realtime/storage client.
- **`@vis.gl/react-google-maps`** for the styled embedded map.
- No heavy state library needed — Supabase Realtime subscriptions plus a thin context are enough. Don't reach for Redux for this.

---

## Suggested build order (phase this — don't try to do it all in one pass)

1. Scaffold the app, wire up the design tokens (colors/fonts/components: patch, day-band, timeline, card, chip) as a small shared component library. Get this looking right before building features on top of it — it's the whole point.
2. Static itinerary feed from `trip-data.json` as the full-screen scroll-snap sequence. No sync, no game yet — just make the itinerary itself feel great.
3. Home tab: "what's up next," weather, directions deep links, countdown.
4. Supabase project setup (schema above) + a thin sync/data hook wrapping the client + Realtime subscriptions — build and test this in isolation before wiring the game on top of it.
5. Points/game system + claiming flow, wired to the sync layer.
6. Voting (swaps + quick polls), wired to the same sync layer.
7. Nearby search + "see other options" + propose-a-swap.
8. Photo gallery (Supabase Storage) + day recaps.
9. PWA/offline pass — this touches everything above, so it comes after the features exist, not before.
10. Polish pass: animations, empty states, error/offline states, the final slideshow/recap view.

---

## Accounts / setup the user needs to do before or during build

The user already has Supabase, Google API, GitHub, and Netlify accounts — this is just the per-project setup, not new signups:

- **Supabase:** new project for this trip. Run the schema above (or a Claude-Code-refined version of it). Enable Storage, create a bucket for photos. Grab the project URL + anon key for the app's env vars.
- **Google Cloud:** enable Maps JavaScript API + Places API (New) on their existing account, create an API key, restrict it by HTTP referrer to the Netlify domain once known, create a custom Map ID/style in Cloud-based Maps Styling using the palette above.
- **GitHub:** a normal new repo for the app's source.
- **Netlify:** connect the new GitHub repo, set the env vars (Supabase URL/anon key, Google Maps key) in Netlify's dashboard, auto-deploy on push to main.

Flag each as it comes up rather than assuming defaults silently — schema details and RLS policy specifics especially are worth a quick confirm with the user before locking in.

---

## Tone reminder

This whole project exists because five friends are excited about a weekend trip. Keep the copy in the app warm and funny, not corporate — it's a direct extension of the itinerary's voice (see the original document's copy for tone: dry, warm, a little deadpan, never over-explained).
