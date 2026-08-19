-- The Chicago Solution — initial schema.
-- Scoped to what's currently being built (itinerary sync + swap voting +
-- photo gallery). Points/challenges/penalties/wager tables are intentionally
-- left out until the gamification layer comes back into scope — see
-- CLAUDE.md and trip-data.json's challengeDeck/penalties/wagerRound, which
-- remain as seed content for whenever that happens.

create table public.players (
  id text primary key,
  name text not null,
  role text not null default 'player'
);

create table public.itinerary_stops (
  id text primary key,
  day_id text not null,
  day_order int not null,
  title text not null,
  address text not null,
  time_label text not null,
  description text not null,
  fixed boolean not null default false,
  tags text[] not null default '{}',
  category text,
  status text not null default 'planned' check (status in ('planned', 'done', 'skipped', 'swapped')),
  swapped_from_place_id text,
  updated_by text references public.players (id),
  updated_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('swap', 'addition', 'quick_poll')),
  stop_id text references public.itinerary_stops (id),
  created_by text not null references public.players (id),
  options jsonb not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'expired')),
  resolved_option text,
  created_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  player_id text not null references public.players (id),
  option text not null,
  created_at timestamptz not null default now(),
  unique (proposal_id, player_id)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  uploaded_by text not null references public.players (id),
  stop_id text references public.itinerary_stops (id),
  day_id text,
  caption text,
  created_at timestamptz not null default now()
);

-- Realtime: push changes to all connected phones instead of polling.
alter publication supabase_realtime add table
  public.players,
  public.itinerary_stops,
  public.proposals,
  public.votes,
  public.photos;

-- RLS: 5 trusted friends, one weekend, no accounts. Permissive by design —
-- access is scoped to this project, not meant as a pattern to reuse for
-- anything with real stakes. See CLAUDE.md's "Access model" section.
alter table public.players enable row level security;
alter table public.itinerary_stops enable row level security;
alter table public.proposals enable row level security;
alter table public.votes enable row level security;
alter table public.photos enable row level security;

create policy "public read/write" on public.players for all using (true) with check (true);
create policy "public read/write" on public.itinerary_stops for all using (true) with check (true);
create policy "public read/write" on public.proposals for all using (true) with check (true);
create policy "public read/write" on public.votes for all using (true) with check (true);
create policy "public read/write" on public.photos for all using (true) with check (true);

-- Seed: real trip data from trip-data.json, not placeholders.

-- players
insert into public.players (id, name, role) values
  ('wils', 'Wils', 'host'),
  ('jack', 'Jack', 'player'),
  ('nick', 'Nick', 'player'),
  ('eric', 'Eric', 'player'),
  ('will', 'Will', 'player');

-- itinerary_stops
insert into public.itinerary_stops (id, day_id, day_order, title, address, time_label, description, fixed, tags, category) values
  ('fri-01', 'fri', 0, 'Hit the Road', 'Depart Lexington, KY', '8:00 AM ET', 'I-65 N → I-90/94 W, approx. 6 hrs incl. stops. Clocks fall back an hour crossing into Central Time.', true, ARRAY['drive'], NULL),
  ('fri-02', 'fri', 1, 'Home Base: Ravenswood', '4689 N Hermitage Ave, Chicago', '~2:00 PM CT', 'Drop bags, unload the car, get oriented.', true, ARRAY['checkin'], NULL),
  ('fri-03', 'fri', 2, 'Laurie''s Planet of Sound', '4639 N Lincoln Ave, Chicago', 'Afternoon', '25-year neighborhood record store institution, 6 min walk from home base.', false, ARRAY['flex','records'], 'records'),
  ('fri-04', 'fri', 3, 'Lutz Continental Café & Pastry Shop', '2458 W Montrose Ave, Chicago', 'Afternoon', 'Chicago''s oldest German bakery-café, since 1948. Coffee + strudel.', false, ARRAY['flex','cheap'], 'coffee'),
  ('fri-05', 'fri', 4, 'Andersonville Detour', 'Clark St, Chicago (Bus 22, ~10 min)', 'Late Afternoon', 'Brown Elephant resale, Lost Girls Vintage, Women & Children First bookstore.', false, ARRAY['flex'], 'thrift'),
  ('fri-06', 'fri', 5, 'Spacca Napoli Pizzeria', '1769 W Sunnyside Ave, Lincoln Square, Chicago', 'Dinner', 'Wood-fired Neapolitan pies. Backup: Il Milanese or Gene''s Sausage Shop.', false, ARRAY['flex'], 'food'),
  ('fri-07', 'fri', 6, 'Green Mill Cocktail Lounge', '4802 N Broadway St, Uptown, Chicago', 'Night — Optional', 'Jazz club since 1907. Small cover, cash-friendly.', false, ARRAY['flex'], 'bar'),
  ('sat-01', 'sat', 0, 'Geraldine''s / Groundswell Coffee', 'Lincoln Square town square, Chicago', '8:30 AM', 'Cheap, quick breakfast around Giddings Plaza.', false, ARRAY['flex','cheap','breakfast'], 'coffee'),
  ('sat-02', 'sat', 1, 'Damen Brown Line → Loop', 'Damen/Leland stop', '9:30 AM', 'Ride to the Loop (~30 min), then walk to the Michigan Ave Water Taxi dock.', true, ARRAY['transit'], NULL),
  ('sat-03', 'sat', 2, 'Water Taxi to Chinatown', 'Chicago Water Taxi, Michigan Ave Dock', '~10:30 AM', '$10 one-way pp, ~30 min scenic ride down the river.', true, ARRAY['book-ahead-check'], NULL),
  ('sat-04', 'sat', 3, 'Wander & Dim Sum', 'Ping Tom Memorial Park → Chinatown Square', '11:00 AM–1:00 PM', 'Dim sum, Chiu Quon Bakery, gift shops.', false, ARRAY['flex'], 'food'),
  ('sat-05', 'sat', 4, 'Art Institute of Chicago', '111 S Michigan Ave, Chicago', '1:30–4:30 PM', '$32/adult, open 11–5. Book ahead at artic.edu.', true, ARRAY['book-ahead'], 'attraction'),
  ('sat-06', 'sat', 5, 'Loop / Wrigleyville Cheap Eats', 'Manny''s Cafeteria & Delicatessen (Loop) or near Wrigleyville', '5:30 PM', 'Chicago institution, cafeteria-style.', false, ARRAY['flex'], 'food'),
  ('sat-07', 'sat', 6, 'Smartbar', '3730 N Clark St, Wrigleyville, Chicago', '10:00 PM → Late', 'Leon Vynehall, Sorrbet, Moorhaus. Doors 10pm. Tickets via Etix.', true, ARRAY['book-ahead','wager-round'], 'nightlife'),
  ('sun-01', 'sun', 0, 'Wicker Park Farmers Market', '1425 N Damen Ave, Chicago', 'Whenever You Surface', '8:00 AM–2:00 PM, Sundays through the season.', false, ARRAY['flex','breakfast'], 'market'),
  ('sun-02', 'sun', 1, 'Bongo Room', '1470 N Milwaukee Ave, Wicker Park, Chicago', 'Sit-Down Option', 'Classic maximalist brunch spot. Expect a short wait.', false, ARRAY['flex','breakfast'], 'food'),
  ('sun-03', 'sun', 2, 'Reckless Records', '1379 N Milwaukee Ave, Chicago', 'Late Morning', 'Flagship location, deep new/used selection.', false, ARRAY['flex'], 'records'),
  ('sun-04', 'sun', 3, 'Dusty Groove', '1120 N Ashland Ave, Chicago', 'Late Morning', 'World-famous for rare funk and soul.', false, ARRAY['flex'], 'records'),
  ('sun-05', 'sun', 4, 'Kokorokoko', '1323 N Milwaukee Ave, Chicago', 'Midday', '''80s & ''90s vintage. Also nearby: Richard''s Fabulous Finds (2545 W North Ave).', false, ARRAY['flex'], 'thrift'),
  ('sun-06', 'sun', 5, 'Big Star', '1531 N Damen Ave, Wicker Park, Chicago', 'Late Lunch', 'Cheap, excellent tacos. Walk-ins only.', false, ARRAY['flex'], 'food'),
  ('sun-07', 'sun', 6, 'Monarch Thrift Shop', '2875 N Milwaukee Ave, Logan Square, Chicago', 'Afternoon', 'Boutique-curated resale.', false, ARRAY['flex'], 'thrift'),
  ('sun-08', 'sun', 7, 'Shuga Records — Logan Square', 'Milwaukee Ave corridor, Logan Square, Chicago', 'Afternoon', 'Deep catalog, in-store performances.', false, ARRAY['flex'], 'records'),
  ('sun-09', 'sun', 8, 'The Whistler', '2421 N Milwaukee Ave, Logan Square, Chicago', 'Early Evening', 'Listening room: cocktails, live jazz & DJ sets. Alt: Sleeping Village (3734 W Belmont Ave).', false, ARRAY['flex'], 'bar'),
  ('mon-01', 'mon', 0, 'Spoken Café or Lutz Continental Café', 'Near home base, Ravenswood, Chicago', 'Morning', 'Second chance at strudel before six hours in the car.', false, ARRAY['flex','breakfast'], 'coffee'),
  ('mon-02', 'mon', 1, 'Pack Up', '4689 N Hermitage Ave, Chicago', 'Late Morning', 'Load the car, point it toward I-90/94 E back to Lexington.', true, ARRAY['depart'], NULL);
