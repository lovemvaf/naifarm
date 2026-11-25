create table if not exists public.purchase_orders (
  id text primary key,
  supplier_id text references public.suppliers(id) on delete set null,
  supplier_name text not null default '',
  farm_id text references public.farms(id) on delete cascade,
  item_name text not null default '',
  quantity numeric not null default 0,
  unit_label text not null default '',
  unit_cost_vnd integer not null default 0,
  total_vnd integer not null default 0,
  expected_date_iso text not null default '',
  status text not null default 'rfq_draft'
    check (status in ('rfq_draft', 'po_approved', 'received_qc_pass', 'qc_rejected')),
  qc_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.coop_pools (
  id text primary key,
  title text not null default '',
  target_order_code text not null default '',
  mixed_batch_code text not null default '',
  total_committed_qty numeric not null default 0,
  unit_label text not null default '',
  status text not null default 'dang_gom'
    check (status in ('dang_gom', 'da_phan_bo', 'da_doi_soat')),
  created_at timestamptz not null default now()
);

create table if not exists public.member_deliveries (
  id text primary key,
  pool_id text not null references public.coop_pools(id) on delete cascade,
  member_farm_id text references public.farms(id) on delete set null,
  member_farm_name text not null default '',
  product_name text not null default '',
  unit_label text not null default '',
  delivered_qty numeric not null default 0,
  grade_label text not null default '',
  agreed_buy_price_vnd integer not null default 0,
  shared_fee_vnd integer not null default 0,
  net_payable_vnd integer not null default 0,
  settlement_status text not null default 'cho_doi_soat'
    check (settlement_status in ('cho_doi_soat', 'da_duyet_thanh_toan', 'tranh_chap')),
  maker_name text not null default '',
  checker_name text,
  delivered_date_iso text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key,
  farm_id text not null default '',
  category text not null default 'vat_tu'
    check (category in ('vat_tu', 'dong_goi', 'van_chuyen_noi_bo', 'nhan_cong_thoi_vu')),
  description text not null default '',
  amount_vnd integer not null default 0,
  date_iso text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.receivables_payables (
  id text primary key,
  farm_id text not null default '',
  kind text not null default 'payable'
    check (kind in ('receivable', 'payable')),
  counterparty_name text not null default '',
  original_vnd integer not null default 0,
  paid_vnd integer not null default 0,
  due_date_iso text not null default '',
  status text not null default 'open'
    check (status in ('open', 'overdue', 'settled')),
  created_at timestamptz not null default now()
);

create table if not exists public.logistics_trips (
  id text primary key,
  route_label text not null default '',
  driver_name text not null default '',
  order_ids text[] not null default '{}',
  parcel_count integer not null default 0,
  planned_departure text not null default '',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_transit', 'delivered_pod', 'failed_reschedule')),
  pod_note text,
  created_at timestamptz not null default now()
);

alter table public.purchase_orders enable row level security;
alter table public.coop_pools enable row level security;
alter table public.member_deliveries enable row level security;
alter table public.expenses enable row level security;
alter table public.receivables_payables enable row level security;
alter table public.logistics_trips enable row level security;

create policy purchase_orders_select on public.purchase_orders for select using (true);
create policy purchase_orders_write on public.purchase_orders for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy coop_pools_select on public.coop_pools for select using (true);
create policy coop_pools_write on public.coop_pools for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

create policy member_deliveries_select on public.member_deliveries for select using (true);
create policy member_deliveries_write on public.member_deliveries for all
  using (public.owns_farm(member_farm_id) or public.is_admin())
  with check (public.owns_farm(member_farm_id) or public.is_admin());

create policy expenses_select on public.expenses for select using (true);
create policy expenses_write on public.expenses for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy receivables_payables_select on public.receivables_payables for select using (true);
create policy receivables_payables_write on public.receivables_payables for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy logistics_trips_select on public.logistics_trips for select using (true);
create policy logistics_trips_write on public.logistics_trips for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

grant select on public.purchase_orders, public.coop_pools, public.member_deliveries, public.expenses, public.receivables_payables, public.logistics_trips to anon, authenticated;
grant insert, update, delete on public.purchase_orders, public.coop_pools, public.member_deliveries, public.expenses, public.receivables_payables, public.logistics_trips to authenticated;
