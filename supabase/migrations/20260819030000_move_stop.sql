-- Lets anyone directly reorder/reschedule an existing stop (day + position),
-- no vote needed — this is logistics, not a group preference decision like a
-- swap or addition. Closes the gap left in the old day, then opens a gap at
-- the destination and drops the stop into it, all in one transaction so
-- concurrent moves from different phones can't corrupt day_order.
create or replace function public.move_stop(p_stop_id text, p_target_day_id text, p_after_stop_id text)
returns void as $$
declare
  v_old_day_id text;
  v_old_order int;
  v_target_order int;
begin
  select day_id, day_order into v_old_day_id, v_old_order
    from public.itinerary_stops where id = p_stop_id;

  update public.itinerary_stops
    set day_order = day_order - 1
    where day_id = v_old_day_id and day_order > v_old_order;

  if p_after_stop_id is null then
    v_target_order := 0;
  else
    select day_order + 1 into v_target_order
      from public.itinerary_stops where id = p_after_stop_id;
  end if;

  update public.itinerary_stops
    set day_order = day_order + 1
    where day_id = p_target_day_id and day_order >= v_target_order and id <> p_stop_id;

  update public.itinerary_stops
    set day_id = p_target_day_id, day_order = v_target_order, updated_at = now()
    where id = p_stop_id;
end;
$$ language plpgsql;
