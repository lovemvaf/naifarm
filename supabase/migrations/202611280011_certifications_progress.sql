create table if not exists public.farm_certifications (
  id text primary key,
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  standard_type text not null default '',
  certificate_code text not null default '',
  star_level_label text,
  status text not null default '',
  status_label text not null default '',
  scope_summary text not null default '',
  issuer_label text not null default '',
  issued_date_demo text not null default '',
  valid_until_demo text not null default '',
  qr_batch_code text not null default '',
  disclaimer text not null default ''
);

alter table public.farm_certifications enable row level security;

create policy "farm_certifications_select_public" on public.farm_certifications
  for select using (true);

create policy "farm_certifications_write_admin" on public.farm_certifications
  for all using (public.is_admin()) with check (public.is_admin());

create policy "farm_certifications_write_farmer" on public.farm_certifications
  for insert with check (public.auth_role() = 'farmer');

grant select on public.farm_certifications to anon, authenticated;
grant insert, update, delete on public.farm_certifications to authenticated;

create table if not exists public.lesson_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_lesson_ids jsonb not null default '[]',
  quiz_answers jsonb not null default '{}',
  mastered_phrase_ids jsonb not null default '[]',
  matched_pair_ids jsonb not null default '[]',
  roleplay_choices jsonb not null default '{}',
  practice_points integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.lesson_progress enable row level security;

create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (user_id = auth.uid() or public.is_admin());

create policy "lesson_progress_write_own" on public.lesson_progress
  for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

grant select, insert, update, delete on public.lesson_progress to authenticated;