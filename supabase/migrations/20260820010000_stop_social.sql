-- Likes + comments on itinerary stops, and a remove_stop function (the
-- itinerary-editing counterpart to move_stop — direct action, no vote,
-- since removing a stop is the same kind of logistics call as moving one,
-- not a group preference decision like a swap/addition).

create table public.stop_likes (
  id uuid primary key default gen_random_uuid(),
  stop_id text not null references public.itinerary_stops (id) on delete cascade,
  player_id text not null references public.players (id),
  created_at timestamptz not null default now(),
  unique (stop_id, player_id)
);

create table public.stop_comments (
  id uuid primary key default gen_random_uuid(),
  stop_id text not null references public.itinerary_stops (id) on delete cascade,
  player_id text not null references public.players (id),
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.stop_likes enable row level security;
alter table public.stop_comments enable row level security;

create policy "stop_likes read/write" on public.stop_likes for all using (true) with check (true);
create policy "stop_comments read/write" on public.stop_comments for all using (true) with check (true);

alter publication supabase_realtime add table public.stop_likes, public.stop_comments;

create or replace function public.remove_stop(p_stop_id text)
returns void as $$
declare
  v_day_id text;
  v_order int;
begin
  select day_id, day_order into v_day_id, v_order from public.itinerary_stops where id = p_stop_id;

  delete from public.itinerary_stops where id = p_stop_id;

  update public.itinerary_stops
    set day_order = day_order - 1
    where day_id = v_day_id and day_order > v_order;
end;
$$ language plpgsql;
