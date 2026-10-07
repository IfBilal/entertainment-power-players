-- Questions model for the challenge-grouped learning module (plan Phase 3).
--
-- Natural key (category_slug, challenge_group, number) is enforced here, and
-- rows are identified by a server-generated UUID so spreadsheet re-sorting
-- never changes a question's identity or resets member progress.
--
-- Assumption to confirm before publishing: members read questions only when
-- is_pro() is true. Gate lives in RLS, not only in the UI.
--
-- Applied to the EPP project (knrjhmrsuyzzxlverryl) on 7 October 2026 after a
-- rolled-back dry run and RLS checks as anon, a non-pro member and a pro member.

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references public.categories (slug) on update cascade,
  challenge_group text not null check (length(btrim(challenge_group)) > 0),
  number integer not null check (number > 0),
  question text not null check (length(btrim(question)) > 0),
  answer text not null check (length(btrim(answer)) > 0),
  why text not null check (length(btrim(why)) > 0),
  power_move text not null check (length(btrim(power_move)) > 0),
  active boolean not null default true,
  import_fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_natural_key unique (category_slug, challenge_group, number)
);

create table if not exists public.question_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  first_opened_at timestamptz,
  revealed_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists question_progress_question_idx on public.question_progress (question_id);

create or replace function public.touch_questions_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists questions_touch_updated_at on public.questions;
create trigger questions_touch_updated_at
  before update on public.questions
  for each row execute function public.touch_questions_updated_at();

drop trigger if exists question_progress_touch_updated_at on public.question_progress;
create trigger question_progress_touch_updated_at
  before update on public.question_progress
  for each row execute function public.touch_questions_updated_at();

alter table public.questions enable row level security;
alter table public.question_progress enable row level security;

-- Questions: members who are pro see active rows; admins see and manage everything.
create policy "questions_read_pro_or_admin" on public.questions
  for select to authenticated
  using ((active and (select public.is_pro())) or (select public.is_admin()));

create policy "questions_admin_write" on public.questions
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Progress: each member reads and writes only their own rows, and only while pro.
create policy "question_progress_owner_select" on public.question_progress
  for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_pro()));

create policy "question_progress_owner_insert" on public.question_progress
  for insert to authenticated
  with check (user_id = (select auth.uid()) and (select public.is_pro()));

create policy "question_progress_owner_update" on public.question_progress
  for update to authenticated
  using (user_id = (select auth.uid()) and (select public.is_pro()))
  with check (user_id = (select auth.uid()) and (select public.is_pro()));

-- Explicit privileges complement RLS. Anonymous users get nothing.
revoke all on public.questions from anon, public;
revoke all on public.question_progress from anon, public;
grant select, insert, update, delete on public.questions to authenticated;
grant select, insert, update on public.question_progress to authenticated;
