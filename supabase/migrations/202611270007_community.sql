create table if not exists public.notifications (
  id text primary key,
  title text not null default '',
  title_en text,
  message text not null default '',
  message_en text,
  category text not null default 'system'
    check (category in ('order', 'season', 'mission', 'system', 'calendar', 'campaign')),
  created_at_label text not null default '',
  read boolean not null default false,
  href text not null default '',
  dedupe_key text,
  role_scope text check (role_scope in ('W01', 'W02', 'W03', 'W04', 'W05', 'W06')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id text primary key,
  requester_name text not null default '',
  role_label text not null default '',
  category text not null default '',
  subject text not null default '',
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  status text not null default 'Mới tiếp nhận'
    check (status in ('Mới tiếp nhận', 'Đang xử lý', 'Đã phản hồi')),
  priority text not null default 'Thường'
    check (priority in ('Thường', 'Ưu tiên')),
  created_at_label text not null default '',
  note text not null default '',
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.address_book (
  id text primary key,
  label text not null default '',
  recipient_name text not null default '',
  phone_demo text not null default '',
  detail_address text not null default '',
  administrative_unit_code text not null default '',
  full_address text not null default '',
  is_default boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_orgs (
  id text primary key,
  name text not null default '',
  type text not null default ''
    check (type in ('HTX', 'Đoàn trường', 'Doanh nghiệp phân phối', 'Hội Nông dân')),
  administrative_unit_code text not null default '',
  administrative_unit_name text not null default '',
  linked_farms_count integer not null default 0,
  contact_role_demo text not null default '',
  focus_area text not null default '',
  status_label text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.sponsor_campaigns (
  id text primary key,
  sponsor_name text not null default '',
  title text not null default '',
  planned_budget_vnd integer not null default 0,
  approved_budget_vnd integer not null default 0,
  milestone_summary text not null default '',
  outputs_accepted_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
alter table public.tickets enable row level security;
alter table public.address_book enable row level security;
alter table public.partner_orgs enable row level security;
alter table public.sponsor_campaigns enable row level security;

create policy notifications_select on public.notifications for select using (true);
create policy notifications_write on public.notifications for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy tickets_select on public.tickets for select using (true);
create policy tickets_write on public.tickets for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy address_book_select on public.address_book for select using (true);
create policy address_book_write on public.address_book for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy partner_orgs_select on public.partner_orgs for select using (true);
create policy partner_orgs_write on public.partner_orgs for all
  using (public.is_admin())
  with check (public.is_admin());

create policy sponsor_campaigns_select on public.sponsor_campaigns for select using (true);
create policy sponsor_campaigns_write on public.sponsor_campaigns for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.notifications, public.tickets, public.address_book, public.partner_orgs, public.sponsor_campaigns to anon, authenticated;
grant insert, update, delete on public.notifications, public.tickets, public.address_book, public.partner_orgs, public.sponsor_campaigns to authenticated;
