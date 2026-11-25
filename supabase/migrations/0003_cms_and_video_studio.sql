-- NaiFarm V5.09 + V5.14: Local/Cloud Website CMS + OCOP AI Video Studio tables & atomic claim RPC
-- Apply manually via `supabase db push` or Supabase SQL Editor (zero paid billing required on Free Tier).

create table if not exists public.cms_content_blocks (
  id text primary key,
  scope text not null,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'published')),
  draft_vi_title text not null default '',
  draft_en_title text not null default '',
  draft_vi_body text not null default '',
  draft_en_body text not null default '',
  published_vi_title text not null default '',
  published_en_title text not null default '',
  published_vi_body text not null default '',
  published_en_body text not null default '',
  image_url text,
  focal_point text not null default '50% 50%',
  updated_by text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_revisions (
  id text primary key,
  block_id text not null references public.cms_content_blocks(id) on delete cascade,
  action text not null,
  actor text not null,
  snapshot_json jsonb not null,
  saved_at timestamptz not null default now()
);

create table if not exists public.video_templates (
  id text primary key,
  version text not null default '1.0.0',
  purpose text not null,
  ratio text not null check (ratio in ('9:16', '16:9', '1:1')),
  duration_sec integer not null check (duration_sec in (15, 30, 60)),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.video_jobs (
  id text primary key,
  owner_id text not null,
  organization_id text not null,
  target_type text not null default 'product',
  target_id text not null,
  input_hash text not null,
  idempotency_key text not null,
  mode_requested text not null default 'FAST' check (mode_requested in ('FAST', 'HYBRID', 'CINEMATIC')),
  mode_used text not null default 'FAST' check (mode_used in ('FAST', 'HYBRID', 'CINEMATIC')),
  status text not null default 'queued',
  provider text not null default 'ffmpeg',
  provider_task_id text,
  lease_owner text,
  lease_until timestamptz,
  attempts integer not null default 0,
  request_json jsonb not null,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (owner_id, idempotency_key)
);

create index if not exists idx_video_jobs_status_created on public.video_jobs (status, created_at);

create table if not exists public.video_results (
  job_id text primary key references public.video_jobs(id) on delete cascade,
  object_path text not null,
  vtt_path text,
  poster_path text,
  size_bytes bigint not null,
  duration_sec numeric(6, 2) not null,
  checksum_sha256 text not null,
  codec text not null,
  pixel_format text not null,
  provenance text not null,
  template_version text not null default '1.0.0',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_heartbeats (
  worker_id text primary key,
  status text not null,
  last_seen_at timestamptz not null default now(),
  capabilities_json jsonb not null default '{}'::jsonb
);

-- Atomic job claim RPC for external Windows Local Worker (no double-processing)
create or replace function public.claim_next_video_job(p_worker_id text, p_lease_seconds integer default 180)
returns setof public.video_jobs
language plpgsql
security definer
as $$
begin
  return query
  with picked as (
    select id
    from public.video_jobs
    where status = 'queued'
       or (status in ('preparing', 'rendering', 'validating') and lease_until < now())
    order by created_at asc
    limit 1
    for update skip locked
  )
  update public.video_jobs j
  set status = 'preparing',
      lease_owner = p_worker_id,
      lease_until = now() + make_interval(secs => p_lease_seconds),
      attempts = j.attempts + 1,
      updated_at = now()
  from picked
  where j.id = picked.id
  returning j.*;
end;
$$;

-- Strict Row Level Security
alter table public.cms_content_blocks enable row level security;
alter table public.cms_revisions enable row level security;
alter table public.video_jobs enable row level security;
alter table public.video_results enable row level security;

create policy "Public read published CMS blocks"
  on public.cms_content_blocks for select
  using (status = 'published');

create policy "Owners and org members read own video jobs"
  on public.video_jobs for select
  using (auth.uid()::text = owner_id);

create policy "Owners read own video results"
  on public.video_results for select
  using (
    exists (
      select 1 from public.video_jobs j
      where j.id = video_results.job_id and j.owner_id = auth.uid()::text
    )
  );
