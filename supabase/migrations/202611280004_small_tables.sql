create table if not exists public.product_reviews (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  order_id text not null default '',
  author_name text not null default '',
  rating numeric not null default 0,
  comment text not null default '',
  created_date_label text not null default '',
  verified_order_purchase boolean not null default false
);

create table if not exists public.mentor_cases (
  id text primary key,
  student_name text not null default '',
  mentor_name text not null default '',
  topic text not null default '',
  status text not null default 'active',
  sessions integer not null default 0,
  created_at_label text not null default ''
);

create table if not exists public.international_inquiries (
  id text primary key,
  product_id text references public.products(id) on delete set null,
  farm_id text references public.farms(id) on delete set null,
  buyer_name text not null default '',
  country text not null default '',
  preferred_language text not null default 'en',
  quantity_note text not null default '',
  packaging_note text not null default '',
  sample_requested boolean not null default false,
  message text not null default '',
  created_at_iso text not null default '',
  status text not null default 'submitted_local',
  response_note text
);

alter table public.product_reviews enable row level security;
alter table public.mentor_cases enable row level security;
alter table public.international_inquiries enable row level security;

create policy product_reviews_select on public.product_reviews for select using (true);
create policy product_reviews_write on public.product_reviews for all
  using (public.is_admin())
  with check (public.is_admin());

create policy mentor_cases_select on public.mentor_cases for select using (true);
create policy mentor_cases_write on public.mentor_cases for all
  using (public.is_admin())
  with check (public.is_admin());

create policy international_inquiries_select on public.international_inquiries for select using (true);
create policy international_inquiries_write on public.international_inquiries for all
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.product_reviews, public.mentor_cases, public.international_inquiries to anon, authenticated;
grant insert, update, delete on public.product_reviews, public.mentor_cases, public.international_inquiries to authenticated;
