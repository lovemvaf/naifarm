create extension if not exists "pgcrypto";

create type public.app_role as enum (
  'customer',
  'farmer',
  'volunteer',
  'coordinator',
  'organization',
  'admin'
);

create table public.farms (
  id text primary key,
  slug text not null unique,
  name text not null,
  owner_name text not null default '',
  owner_age_label text not null default '',
  region text not null default '',
  address_label text not null default '',
  admin_unit_code text,
  lat double precision,
  lng double precision,
  area_ha numeric not null default 0,
  main_crops text[] not null default '{}',
  ocop_status text not null default 'self_declared_unverified',
  ocop_label text not null default '',
  ocop_note text not null default '',
  story_headline text not null default '',
  story_summary text not null default '',
  banner_image text not null default '',
  owner_portrait text not null default '',
  gallery_images text[] not null default '{}',
  youth_supporters text[] not null default '{}',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.experiences (
  id text primary key,
  farm_id text not null references public.farms(id) on delete cascade,
  title text not null default '',
  duration text not null default '',
  price_per_guest integer not null default 0,
  max_guests integer not null default 0,
  schedule_summary text not null default '',
  safety_note text not null default '',
  image text not null default ''
);

create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null default '',
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  region text not null default '',
  unit_label text not null default 'kg',
  price_vnd integer not null default 0,
  stock_kg numeric not null default 0,
  season_status text not null default 'in_season',
  batch_code text,
  brix_note text,
  short_description text not null default '',
  story_note text not null default '',
  image text not null default '',
  gallery text[] not null default '{}',
  weight_options jsonb,
  has_3d_viewer boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.batches (
  batch_code text primary key,
  product_id text references public.products(id) on delete set null,
  product_name text not null default '',
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  region text not null default '',
  harvest_date text not null default '',
  pack_date text not null default '',
  declaration_level text not null default '',
  doc_status text not null default '',
  summary text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.batch_events (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null references public.batches(batch_code) on delete cascade,
  date_label text not null default '',
  title text not null default '',
  detail text not null default '',
  actor_category text not null default '',
  source_declaration text not null default '',
  photo text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.app_role not null default 'customer',
  farm_id text references public.farms(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity numeric not null default 1,
  selected_option_label text,
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.season_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id text primary key,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null default '',
  customer_phone_demo text not null default '',
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  delivery_method text not null default 'delivery',
  delivery_address text not null default '',
  subtotal_vnd integer not null default 0,
  shipping_fee_vnd integer not null default 0,
  total_vnd integer not null default 0,
  payment_label text not null default '',
  status text not null default 'pending_confirm',
  cancel_reason text,
  timeline jsonb not null default '[]',
  created_at_label text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null default '',
  unit_label text not null default '',
  quantity numeric not null default 1,
  unit_price_vnd integer not null default 0,
  image text not null default ''
);

create table public.missions (
  id text primary key,
  title text not null default '',
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  location text not null default '',
  mode text not null default '',
  skill_tag text not null default '',
  assignee_id uuid references auth.users(id) on delete set null,
  assignee_name text,
  expected_hours numeric not null default 0,
  submitted_hours numeric not null default 0,
  approved_hours numeric not null default 0,
  due_date text not null default '',
  deliverable_summary text not null default '',
  evidence_note text,
  evidence_image text,
  revision_reason text,
  status text not null default 'open',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.support_requests (
  id text primary key,
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  title text not null default '',
  need_type text not null default '',
  preferred_time text not null default '',
  location_mode text not null default '',
  note text not null default '',
  status text not null default 'Chờ điều phối phân công',
  created_at_label text not null default '',
  created_at timestamptz not null default now()
);

create table public.rfq_requests (
  id text primary key,
  company text not null default '',
  note text not null default '',
  status text not null default 'Mới gửi',
  created_at_label text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.experience_bookings (
  id text primary key,
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  package_title text not null default '',
  guest_name text not null default '',
  guest_count integer not null default 1,
  date_label text not null default '',
  note text not null default '',
  status text not null default 'Chờ nhà vườn xác nhận',
  guest_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.document_review_cases (
  id text primary key,
  farm_id text not null references public.farms(id) on delete cascade,
  farm_name text not null default '',
  document_title text not null default '',
  submitted_at text not null default '',
  scope_note text not null default '',
  status text not null default 'Chờ đối chiếu',
  reviewer_note text,
  created_at timestamptz not null default now()
);

create table public.admin_grants (
  id text primary key,
  account_name text not null default '',
  organization_name text not null default '',
  workspace_scope text not null default 'W01',
  capability text not null default '',
  unit_scope text not null default '',
  expires_at text not null default '',
  active boolean not null default true,
  last_reason text not null default '',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  time text not null default '',
  actor text not null default '',
  action text not null default '',
  target text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table public.admin_units (
  code text primary key,
  full_name text not null,
  level text not null,
  lat double precision not null,
  lng double precision not null
);

create or replace function public.auth_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.owns_farm(fid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and farm_id is not null and farm_id = fid
  );
$$;

grant execute on function public.auth_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_farm(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  if v_role not in ('customer', 'farmer', 'volunteer', 'organization') then
    v_role := 'customer';
  end if;
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    v_role::public.app_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  if new.farm_id is distinct from old.farm_id
     and auth.uid() is not null
     and not public.is_admin() then
    new.farm_id := old.farm_id;
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
before update on public.profiles
for each row execute function public.protect_profile_role();

create or replace function public.after_order_item_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock_kg = greatest(0, stock_kg - new.quantity)
  where id = new.product_id;
  return new;
end;
$$;

create trigger trg_after_order_item_insert
after insert on public.order_items
for each row execute function public.after_order_item_insert();

alter table public.farms enable row level security;
alter table public.experiences enable row level security;
alter table public.products enable row level security;
alter table public.batches enable row level security;
alter table public.batch_events enable row level security;
alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.favorites enable row level security;
alter table public.season_follows enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.missions enable row level security;
alter table public.support_requests enable row level security;
alter table public.rfq_requests enable row level security;
alter table public.experience_bookings enable row level security;
alter table public.document_review_cases enable row level security;
alter table public.admin_grants enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_units enable row level security;

create policy farms_select on public.farms for select using (true);
create policy farms_write on public.farms for all
  using (public.is_admin() or public.owns_farm(id) or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.owns_farm(id) or public.auth_role() = 'coordinator');

create policy experiences_select on public.experiences for select using (true);
create policy experiences_write on public.experiences for all
  using (public.is_admin() or public.owns_farm(farm_id))
  with check (public.is_admin() or public.owns_farm(farm_id));

create policy products_select on public.products for select using (true);
create policy products_write on public.products for all
  using (public.is_admin() or public.owns_farm(farm_id))
  with check (public.is_admin() or public.owns_farm(farm_id));

create policy batches_select on public.batches for select using (true);
create policy batches_write on public.batches for all
  using (public.is_admin() or public.owns_farm(farm_id))
  with check (public.is_admin() or public.owns_farm(farm_id));

create policy batch_events_select on public.batch_events for select using (true);
create policy batch_events_insert on public.batch_events for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.batches b
      where b.batch_code = batch_code and public.owns_farm(b.farm_id)
    )
  );
create policy batch_events_delete on public.batch_events for delete
  using (public.is_admin());

create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy admin_units_select on public.admin_units for select using (true);

create policy cart_items_all on public.cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy favorites_all on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy season_follows_all on public.season_follows for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy orders_select on public.orders for select
  using (
    customer_id = auth.uid()
    or public.owns_farm(farm_id)
    or public.is_admin()
    or public.auth_role() = 'coordinator'
  );
create policy orders_insert on public.orders for insert
  with check (customer_id = auth.uid());
create policy orders_update on public.orders for update
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy order_items_select on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.customer_id = auth.uid()
          or public.owns_farm(o.farm_id)
          or public.is_admin()
          or public.auth_role() = 'coordinator'
        )
    )
  );
create policy order_items_insert on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = auth.uid()
    )
  );

create policy missions_select on public.missions for select
  using (
    status = 'open'
    or assignee_id = auth.uid()
    or public.owns_farm(farm_id)
    or public.is_admin()
    or public.auth_role() = 'coordinator'
  );
create policy missions_insert on public.missions for insert
  with check (
    public.is_admin()
    or public.auth_role() = 'coordinator'
    or public.owns_farm(farm_id)
  );
create policy missions_claim on public.missions for update
  using (status = 'open' and public.auth_role() = 'volunteer')
  with check (assignee_id = auth.uid() and public.auth_role() = 'volunteer');
create policy missions_update on public.missions for update
  using (
    assignee_id = auth.uid()
    or public.owns_farm(farm_id)
    or public.is_admin()
    or public.auth_role() = 'coordinator'
  )
  with check (
    assignee_id = auth.uid()
    or public.owns_farm(farm_id)
    or public.is_admin()
    or public.auth_role() = 'coordinator'
  );

create or replace function public.guard_mission_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role := public.auth_role();
begin
  if auth.uid() is null then
    return new;
  end if;

  if v_role in ('coordinator', 'admin') then
    return new;
  end if;

  new.approved_hours := old.approved_hours;

  if v_role = 'farmer' then
    if new.status is distinct from old.status then
      if old.status = 'submitted' and new.status = 'farm_accepted' then
        null;
      else
        new.status := old.status;
      end if;
    end if;
    new.assignee_id := old.assignee_id;
    new.submitted_hours := old.submitted_hours;
    new.evidence_note := old.evidence_note;
    new.evidence_image := old.evidence_image;
    return new;
  end if;

  if v_role = 'volunteer' then
    if new.status is distinct from old.status then
      if old.status = 'open' and new.status = 'assigned' then
        null;
      elsif old.status in ('assigned', 'revision_requested') and new.status = 'submitted' then
        null;
      else
        new.status := old.status;
      end if;
    end if;
    if new.status = 'assigned' and old.status = 'open' then
      new.evidence_note := old.evidence_note;
      new.evidence_image := old.evidence_image;
      new.submitted_hours := old.submitted_hours;
    end if;
    return new;
  end if;

  return old;
end;
$$;

create trigger guard_mission_update
before update on public.missions
for each row execute function public.guard_mission_update();

create policy support_requests_select on public.support_requests for select
  using (
    public.owns_farm(farm_id)
    or public.is_admin()
    or public.auth_role() in ('coordinator', 'volunteer')
  );
create policy support_requests_insert on public.support_requests for insert
  with check (public.is_admin() or public.owns_farm(farm_id));
create policy support_requests_update on public.support_requests for update
  using (
    public.is_admin()
    or public.auth_role() = 'coordinator'
    or public.owns_farm(farm_id)
  )
  with check (
    public.is_admin()
    or public.auth_role() = 'coordinator'
    or public.owns_farm(farm_id)
  );

create policy rfq_requests_select on public.rfq_requests for select
  using (
    created_by = auth.uid()
    or public.is_admin()
    or public.auth_role() = 'organization'
  );
create policy rfq_requests_insert on public.rfq_requests for insert
  with check (created_by = auth.uid());
create policy rfq_requests_update on public.rfq_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy experience_bookings_select on public.experience_bookings for select
  using (
    guest_id = auth.uid()
    or public.owns_farm(farm_id)
    or public.is_admin()
  );
create policy experience_bookings_insert on public.experience_bookings for insert
  with check (guest_id is null or guest_id = auth.uid());
create policy experience_bookings_update on public.experience_bookings for update
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy document_review_cases_select on public.document_review_cases for select
  using (
    public.owns_farm(farm_id)
    or public.is_admin()
    or public.auth_role() = 'coordinator'
  );
create policy document_review_cases_write on public.document_review_cases for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

create policy admin_grants_all on public.admin_grants for all
  using (public.is_admin()) with check (public.is_admin());

create policy audit_logs_select on public.audit_logs for select
  using (public.is_admin() or public.auth_role() = 'coordinator');
create policy audit_logs_insert on public.audit_logs for insert
  with check (auth.uid() is not null);

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on public.experience_bookings to anon;

insert into storage.buckets (id, name, public) values
  ('stitch', 'stitch', true),
  ('product-images', 'product-images', true),
  ('evidence', 'evidence', true)
on conflict (id) do nothing;

create policy storage_public_read on storage.objects for select
  using (bucket_id in ('stitch', 'product-images', 'evidence'));
create policy storage_auth_insert on storage.objects for insert
  to authenticated
  with check (bucket_id in ('product-images', 'evidence'));
create policy storage_owner_update on storage.objects for update
  to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
create policy storage_owner_delete on storage.objects for delete
  to authenticated
  using (owner = auth.uid() or public.is_admin());
