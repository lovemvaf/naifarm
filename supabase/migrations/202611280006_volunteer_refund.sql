create table if not exists public.volunteer_hours (
  id text primary key,
  mission_id text references public.missions(id) on delete cascade,
  volunteer_name text not null default '',
  farm_id text references public.farms(id) on delete set null,
  farm_name text not null default '',
  hours numeric not null default 0,
  status text not null default 'approved'
    check (status in ('pending_farmer', 'pending_coordinator', 'approved', 'revision')),
  recorded_date text not null default '',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.refund_requests (
  id text primary key,
  order_id text references public.orders(id) on delete cascade,
  farm_id text references public.farms(id) on delete cascade,
  requester_name text not null default '',
  reason text not null default '',
  amount_vnd numeric not null default 0,
  restock_qty numeric not null default 0,
  status text not null default 'pending_maker'
    check (status in ('pending_maker', 'approved_by_finance', 'rejected')),
  maker_name text not null default '',
  checker_name text,
  requested_date_iso text not null default '',
  created_at timestamptz not null default now()
);

alter table public.volunteer_hours enable row level security;
alter table public.refund_requests enable row level security;

create policy volunteer_hours_select on public.volunteer_hours for select using (true);
create policy volunteer_hours_write on public.volunteer_hours for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

create policy refund_requests_select on public.refund_requests for select using (true);
create policy refund_requests_write on public.refund_requests for all
  using (public.owns_farm(farm_id) or public.is_admin())
  with check (public.owns_farm(farm_id) or public.is_admin());

grant select on public.volunteer_hours, public.refund_requests to anon, authenticated;
grant insert, update, delete on public.volunteer_hours, public.refund_requests to authenticated;
