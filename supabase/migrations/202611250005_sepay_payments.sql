-- Migration: SePay Payment Transactions table
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

-- RLS
alter table public.payment_transactions enable row level security;

-- Allow reading payment status by anyone or authenticated users
create policy payment_transactions_select on public.payment_transactions
  for select using (true);

-- Allow service role to insert/update
create policy payment_transactions_service on public.payment_transactions
  for all using (true) with check (true);
