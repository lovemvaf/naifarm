create table if not exists public.tour_packages (
  id text primary key,
  slug text not null unique,
  farm_id text references public.farms(id) on delete cascade,
  farm_name text not null default '',
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  zone_label text not null default '',
  experience_kind text not null default '',
  title_vi text not null default '',
  title_en text not null default '',
  summary_vi text not null default '',
  summary_en text not null default '',
  season_note_vi text not null default '',
  season_note_en text not null default '',
  duration_hours numeric not null default 0,
  adult_price_vnd integer not null default 0,
  child_price_vnd integer not null default 0,
  min_guests integer not null default 1,
  max_guests integer not null default 1,
  languages text[] not null default '{}',
  age_suitability text not null default 'all_ages',
  accessibility_note_vi text not null default '',
  accessibility_note_en text not null default '',
  allergen_note_vi text not null default '',
  allergen_note_en text not null default '',
  safety_note_vi text not null default '',
  safety_note_en text not null default '',
  weather_contingency_vi text not null default '',
  weather_contingency_en text not null default '',
  meeting_point_vi text not null default '',
  meeting_point_en text not null default '',
  coordinate_verified boolean not null default false,
  includes_vi jsonb not null default '[]',
  includes_en jsonb not null default '[]',
  itinerary jsonb not null default '[]',
  slots jsonb not null default '[]',
  linked_product_ids jsonb not null default '[]',
  linked_live_ids jsonb not null default '[]',
  image text not null default '',
  gallery jsonb not null default '[]',
  rating_fixture numeric not null default 4.8,
  review_count_fixture integer not null default 0
);

alter table public.tour_packages enable row level security;

create policy "tour_packages_select_public" on public.tour_packages
  for select using (true);

create policy "tour_packages_write_admin" on public.tour_packages
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.tour_packages to anon, authenticated;
grant insert, update, delete on public.tour_packages to authenticated;