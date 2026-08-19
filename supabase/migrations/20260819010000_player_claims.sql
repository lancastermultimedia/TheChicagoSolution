-- Tracks who's already claimed a name so the claim screen can grey out
-- names other people have taken.
alter table public.players add column claimed_at timestamptz;
