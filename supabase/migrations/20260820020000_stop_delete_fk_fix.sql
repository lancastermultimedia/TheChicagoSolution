-- remove_stop() needs to actually be able to delete a stop. Both of these
-- FKs defaulted to ON DELETE NO ACTION, which would block deleting any stop
-- that ever had a resolved proposal or a tagged photo against it — SET NULL
-- keeps that history (an old swap proposal, a photo's caption) intact while
-- just dropping the now-dangling stop reference.
alter table public.proposals
  drop constraint proposals_stop_id_fkey,
  add constraint proposals_stop_id_fkey foreign key (stop_id) references public.itinerary_stops (id) on delete set null;

alter table public.photos
  drop constraint photos_stop_id_fkey,
  add constraint photos_stop_id_fkey foreign key (stop_id) references public.itinerary_stops (id) on delete set null;
