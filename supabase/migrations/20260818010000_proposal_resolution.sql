-- Resolves a proposal the moment it hits majority (3 of 5), directly in the
-- database. This matters because the deciding vote can come from any of the
-- 5 phones — resolution can't depend on that specific client staying open
-- long enough to "apply" the change itself.
create or replace function public.resolve_proposal() returns trigger as $$
declare
  prop record;
  yes_count int;
  no_count int;
  target_day_id text;
  target_day_order int;
begin
  select * into prop from public.proposals where id = new.proposal_id;

  if prop.status <> 'open' then
    return new;
  end if;

  select count(*) into yes_count from public.votes where proposal_id = prop.id and option = 'yes';
  select count(*) into no_count from public.votes where proposal_id = prop.id and option = 'no';

  if yes_count >= 3 then
    update public.proposals set status = 'resolved', resolved_option = 'yes' where id = prop.id;

    select day_id, day_order into target_day_id, target_day_order
      from public.itinerary_stops where id = prop.stop_id;

    if prop.type = 'swap' then
      update public.itinerary_stops
        set title = prop.options ->> 'title',
            address = prop.options ->> 'address',
            description = coalesce(nullif(prop.options ->> 'editorialSummary', ''), 'Swapped in by group vote.'),
            category = prop.options ->> 'category',
            tags = ARRAY['flex'],
            status = 'swapped',
            swapped_from_place_id = prop.options ->> 'placeId',
            updated_by = new.player_id,
            updated_at = now()
        where id = prop.stop_id;

    elsif prop.type = 'addition' then
      update public.itinerary_stops
        set day_order = day_order + 1
        where day_id = target_day_id and day_order > target_day_order;

      insert into public.itinerary_stops
        (id, day_id, day_order, title, address, time_label, description, fixed, tags, category, status, updated_by, updated_at)
      values (
        'added-' || prop.id,
        target_day_id,
        target_day_order + 1,
        prop.options ->> 'title',
        prop.options ->> 'address',
        coalesce(nullif(prop.options ->> 'timeLabel', ''), 'Flex'),
        coalesce(nullif(prop.options ->> 'editorialSummary', ''), 'Added by group vote.'),
        false,
        ARRAY['flex'],
        prop.options ->> 'category',
        'planned',
        new.player_id,
        now()
      );
    end if;

  elsif no_count >= 3 then
    update public.proposals set status = 'resolved', resolved_option = 'no' where id = prop.id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger on_vote_cast
  after insert on public.votes
  for each row execute function public.resolve_proposal();
