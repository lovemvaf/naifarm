create table if not exists public.seasons (
  id text primary key,
  farm_id text not null default '',
  farm_name text not null default '',
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  crop_name text not null default '',
  variety text not null default '',
  season_name text not null default '',
  start_date text not null default '',
  expected_harvest_date text not null default '',
  area_ha numeric not null default 0,
  growing_zone_code text not null default '',
  status text not null default ''
    check (status in ('đang chăm sóc', 'sắp thu hoạch', 'đang thu hoạch', 'đã kết thúc')),
  summary text not null default '',
  batch_codes text[] not null default '{}',
  expected_yield_kg numeric,
  actual_yield_kg numeric,
  estimated_cost_vnd numeric,
  actual_cost_vnd numeric,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.diary_entries (
  id text primary key,
  season_id text not null default '',
  batch_code text references public.batches(batch_code) on delete set null,
  farm_id text references public.farms(id) on delete set null,
  farm_name text not null default '',
  date_label text not null default '',
  stage text not null default ''
    check (stage in (
      'Làm đất & Tỉa cành', 'Bón phân hữu cơ', 'Kiểm soát sinh học',
      'Tưới & Chăm sóc', 'Đo độ Brix & Khảo sát', 'Thu hoạch & Đóng gói'
    )),
  title text not null default '',
  detail text not null default '',
  actor_name text not null default '',
  source_declaration text not null default ''
    check (source_declaration in ('Nhà vườn tự khai', 'Thanh niên hỗ trợ ghi nhận', 'HTX đối chiếu')),
  photo text,
  visibility text check (visibility in ('public', 'internal')),
  materials_used text,
  version integer,
  is_demo boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.seasons enable row level security;
alter table public.diary_entries enable row level security;

create policy seasons_select on public.seasons for select using (true);
create policy seasons_write on public.seasons for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy diary_entries_select on public.diary_entries for select using (true);
create policy diary_entries_write on public.diary_entries for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

grant select on public.seasons, public.diary_entries to anon, authenticated;
grant insert, update, delete on public.seasons, public.diary_entries to authenticated;
