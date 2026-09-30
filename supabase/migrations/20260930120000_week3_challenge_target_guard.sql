-- Until a progress-reconciliation transaction is shipped, an admin cannot
-- silently change type/target after any member has started this challenge.
-- Title, description, order and active flag remain editable without moving
-- stable challenge IDs or history links.
create function public.guard_challenge_configuration_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.type is distinct from new.type or old.target is distinct from new.target then
    if exists (
      select 1 from public.challenge_progress
      where challenge_id = old.id
    ) then
      raise exception 'Cannot change type or target after member progress exists; create a new challenge instead'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_challenge_configuration_change() from public, anon, authenticated;

create trigger guard_challenge_configuration_change
before update of type, target on public.track_challenges
for each row execute function public.guard_challenge_configuration_change();
