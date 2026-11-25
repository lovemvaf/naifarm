create table if not exists public.calendar_events (
  id text primary key,
  title text not null default '',
  title_en text not null default '',
  description text not null default '',
  description_en text not null default '',
  event_kind text not null default 'meeting'
    check (event_kind in (
      'observance','harvest','live','tour','promotion','training','mission',
      'school_assignment','supplier_delivery','cert_expiry','inventory_count',
      'settlement','meeting','reminder','volunteer_shift'
    )),
  classification text not null default 'platform_initiative'
    check (classification in ('official_observance','platform_initiative','commercial','internal')),
  organizer text not null default '',
  status text not null default 'scheduled'
    check (status in ('scheduled','active','completed','cancelled')),
  start_iso text not null default '',
  end_iso text not null default '',
  all_day boolean not null default false,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  recurrence_rule text,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  visibility text not null default 'public' check (visibility in ('public','w02','w03','w04','w05','w06')),
  administrative_unit_code text,
  farm_id text references public.farms(id) on delete set null,
  organization_id text,
  assigned_to text,
  linked_route text,
  linked_entity_id text,
  location_label text,
  is_official_read_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.official_observances (
  id text primary key,
  title_vi text not null default '',
  title_en text not null default '',
  date_label_vi text not null default '',
  month_day text not null default '',
  is_lunar_variable boolean not null default false,
  year_verified integer not null default 0,
  legal_or_official_source text not null default '',
  source_url text not null default '',
  category text not null default 'vietnam_official'
    check (category in ('vietnam_official','un_fao','traditional_lunar','seasonal_agri')),
  note_vi text not null default '',
  note_en text not null default '',
  is_read_only_official boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id text primary key,
  slug text not null unique,
  title_vi text not null default '',
  title_en text not null default '',
  subtitle_vi text not null default '',
  subtitle_en text not null default '',
  objective_vi text not null default '',
  objective_en text not null default '',
  classification text not null default 'platform_initiative'
    check (classification in ('platform_initiative','commercial','cultural_recap')),
  organizer text not null default '',
  target_audience text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft','submitted','approved','scheduled','active','ended','paused','cancelled')),
  start_iso text not null default '',
  end_iso text not null default '',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  priority integer not null default 0,
  show_national_flag_accent boolean not null default false,
  banner_image text not null default '',
  banner_alt_vi text not null default '',
  banner_alt_en text not null default '',
  primary_cta_label_vi text not null default '',
  primary_cta_label_en text not null default '',
  primary_cta_href text not null default '',
  maker_name text not null default '',
  approver_name text,
  product_ids text[] not null default '{}',
  farm_ids text[] not null default '{}',
  experience_slugs text[] not null default '{}',
  live_ids text[] not null default '{}',
  lesson_slugs text[] not null default '{}',
  promotion_ids text[] not null default '{}',
  budget_planned_vnd integer not null default 0,
  budget_spent_vnd integer not null default 0,
  fixture_sessions_count integer not null default 0,
  fixture_orders_count integer not null default 0,
  fixture_revenue_vnd integer not null default 0,
  agenda_items jsonb not null default '[]',
  recap_story_vi text,
  recap_story_en text,
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id text primary key,
  code text not null unique,
  campaign_id text references public.campaigns(id) on delete set null,
  title_vi text not null default '',
  title_en text not null default '',
  kind text not null default 'percent'
    check (kind in ('percent','fixed_amount','min_cart','bundle','shipping_discount','preorder','flash_sale')),
  discount_percent numeric,
  discount_fixed_vnd integer,
  shipping_discount_vnd integer,
  min_spend_vnd integer not null default 0,
  max_discount_vnd integer not null default 0,
  max_redemptions_total integer not null default 0,
  redeemed_count integer not null default 0,
  stock_allocated_units integer,
  stock_used_units integer,
  stackable boolean not null default false,
  eligible_locales text[] not null default '{}',
  eligible_categories text[],
  eligible_product_ids text[],
  target_seller_id text,
  start_iso text not null default '',
  end_iso text not null default '',
  active boolean not null default false,
  approved_by text,
  maker_name text not null default '',
  budget_cap_vnd integer not null default 0,
  budget_used_vnd integer not null default 0,
  exclude_minors boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;
alter table public.official_observances enable row level security;
alter table public.campaigns enable row level security;
alter table public.promotions enable row level security;

create policy calendar_events_select on public.calendar_events for select using (true);
create policy calendar_events_write on public.calendar_events for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

create policy official_observances_select on public.official_observances for select using (true);
create policy official_observances_write on public.official_observances for all
  using (public.is_admin())
  with check (public.is_admin());

create policy campaigns_select on public.campaigns for select using (true);
create policy campaigns_write on public.campaigns for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

create policy promotions_select on public.promotions for select using (true);
create policy promotions_write on public.promotions for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

grant select on public.calendar_events, public.official_observances, public.campaigns, public.promotions to anon, authenticated;
grant insert, update, delete on public.calendar_events, public.official_observances, public.campaigns, public.promotions to authenticated;

create or replace function public.increment_promo_redemption(promo_id text, qty integer default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.promotions
  set redeemed_count = redeemed_count + qty
  where id = promo_id;
end;
$$;

grant execute on function public.increment_promo_redemption(text, integer) to anon, authenticated;
