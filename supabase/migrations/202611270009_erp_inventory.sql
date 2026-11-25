create table if not exists public.warehouses (
  id text primary key,
  name text not null default '',
  farm_id text references public.farms(id) on delete cascade,
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  storage_type text not null default 'kho_mat'
    check (storage_type in ('kho_mat', 'kho_kho', 'diem_gom_htx')),
  bins text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.warehouse_stocks (
  id text primary key,
  warehouse_id text not null references public.warehouses(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  batch_code text,
  bin_code text not null default '',
  unit_label text not null default '',
  unit_cost_vnd integer not null default 0,
  on_hand_qty numeric not null default 0,
  reserved_qty numeric not null default 0,
  blocked_qty numeric not null default 0,
  quarantine_qty numeric not null default 0,
  expiry_date_iso text,
  min_threshold numeric not null default 0,
  max_threshold numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id text primary key,
  warehouse_id text not null references public.warehouses(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  batch_code text,
  type text not null default 'inbound'
    check (type in ('inbound', 'outbound', 'transfer', 'adjustment', 'return_restock', 'loss')),
  quantity_delta numeric not null default 0,
  unit_label text not null default '',
  date_iso text not null default '',
  actor_name text not null default '',
  reason text not null default '',
  is_internal_transfer boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id text primary key,
  name text not null default '',
  category text not null default '',
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  rating_note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.warehouses enable row level security;
alter table public.warehouse_stocks enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.suppliers enable row level security;

create policy warehouses_select on public.warehouses for select using (true);
create policy warehouses_write on public.warehouses for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

create policy warehouse_stocks_select on public.warehouse_stocks for select using (true);
create policy warehouse_stocks_write on public.warehouse_stocks for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.warehouses w
      where w.id = warehouse_id and public.owns_farm(w.farm_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.warehouses w
      where w.id = warehouse_id and public.owns_farm(w.farm_id)
    )
  );

create policy inventory_movements_select on public.inventory_movements for select using (true);
create policy inventory_movements_write on public.inventory_movements for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.warehouses w
      where w.id = warehouse_id and public.owns_farm(w.farm_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.warehouses w
      where w.id = warehouse_id and public.owns_farm(w.farm_id)
    )
  );

create policy suppliers_select on public.suppliers for select using (true);
create policy suppliers_write on public.suppliers for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.warehouses, public.warehouse_stocks, public.inventory_movements, public.suppliers to anon, authenticated;
grant insert, update, delete on public.warehouses, public.warehouse_stocks, public.inventory_movements, public.suppliers to authenticated;
