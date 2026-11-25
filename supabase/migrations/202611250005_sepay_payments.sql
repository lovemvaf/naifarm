-- Migration: SePay Payment Transactions table & Permissions Fix
-- 1. Ensure payment_status column exists in orders
alter table public.orders add column if not exists payment_status text default 'unpaid';

-- 2. Create payment_transactions table if not exists
create table if not exists public.payment_transactions (
  id text primary key default gen_random_uuid()::text,
  order_id text,
  gateway text not null default 'MBBank',
  account_number text not null default '0369966231',
  transfer_type text not null default 'in',
  amount_vnd integer not null default 0,
  content text not null default '',
  reference_code text,
  sepay_transaction_id text,
  raw_payload jsonb default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Index for fast lookup by order_id
create index if not exists idx_payment_transactions_order_id on public.payment_transactions(order_id);
create index if not exists idx_payment_transactions_created_at on public.payment_transactions(created_at desc);

-- 3. RLS
alter table public.payment_transactions enable row level security;

drop policy if exists payment_transactions_select on public.payment_transactions;
drop policy if exists payment_transactions_service on public.payment_transactions;
drop policy if exists payment_transactions_insert on public.payment_transactions;

-- Allow reading payment status by anyone or authenticated users
create policy payment_transactions_select on public.payment_transactions
  for select using (true);

-- Allow service role to do all operations
create policy payment_transactions_service on public.payment_transactions
  for all using (true) with check (true);

-- Allow insert by anon/authenticated as well
create policy payment_transactions_insert on public.payment_transactions
  for insert with check (true);

-- 4. CRITICAL: Grant table privileges
grant usage on schema public to anon, authenticated, service_role;
grant all on table public.payment_transactions to anon, authenticated, service_role;
grant all on table public.orders to anon, authenticated, service_role;

-- Grant service_role full privileges on all tables & sequences
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on routines to service_role;
