create table if not exists public.live_host_permissions (
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id text not null,
  display_name text not null check (length(display_name) between 1 and 80),
  can_chat boolean not null default false,
  enabled boolean not null default true,
  primary key (user_id, farm_id)
);

create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  farm_id text not null,
  room_name text not null unique default ('naifarm-' || gen_random_uuid()::text),
  title text not null check (length(title) between 3 and 140),
  description text not null default '' check (length(description) <= 2000),
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'starting', 'live', 'reconnecting', 'ended', 'cancelled')),
  product_ids text[] not null default '{}',
  pinned_product_id text,
  revision bigint not null default 1,
  start_deadline timestamptz,
  reconnect_deadline timestamptz,
  cleanup_pending boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);

create unique index if not exists live_sessions_single_active on public.live_sessions ((true)) where status in ('starting', 'live', 'reconnecting');
create index if not exists live_sessions_discovery on public.live_sessions (status, scheduled_at);

create table if not exists public.live_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender_name text not null check (length(sender_name) between 1 and 80),
  body text not null check (length(body) between 1 and 500),
  hidden_at timestamptz,
  client_message_id uuid not null,
  created_at timestamptz not null default now(),
  unique (sender_id, client_message_id)
);

create index if not exists live_messages_history on public.live_messages (session_id, created_at desc, id desc);

create table if not exists public.live_cameras (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  identity text not null unique,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.live_camera_pairings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.live_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);

create table if not exists public.live_rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null,
  hits integer not null default 1
);

create or replace function public.live_start_session(p_session_id uuid, p_owner_id uuid, p_deadline_seconds integer default 90)
returns public.live_sessions language plpgsql security definer set search_path = '' as $$
declare started public.live_sessions%rowtype;
begin
  update public.live_sessions s set status = 'starting', start_deadline = now() + make_interval(secs => least(greatest(p_deadline_seconds, 10), 180)), revision = revision + 1
  where s.id = p_session_id and s.owner_id = p_owner_id and s.status in ('scheduled', 'reconnecting')
    and exists (select 1 from public.live_host_permissions h where h.user_id = p_owner_id and h.farm_id = s.farm_id and h.enabled)
  returning * into started;
  return started;
end;
$$;

create or replace function public.live_hide_message(p_message_id uuid, p_owner_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  update public.live_messages m set hidden_at = now()
  from public.live_sessions s
  where m.id = p_message_id and m.session_id = s.id and s.owner_id = p_owner_id and m.hidden_at is null;
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

create or replace function public.live_transition(p_session_id uuid, p_owner_id uuid, p_from text[], p_to text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  update public.live_sessions set status = p_to, revision = revision + 1,
    ended_at = case when p_to in ('ended', 'cancelled') then now() else ended_at end,
    cleanup_pending = p_to in ('ended', 'cancelled')
  where id = p_session_id and owner_id = p_owner_id and status = any(p_from);
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;

create or replace function public.live_change_revision(p_session_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.live_sessions set revision = revision + 1, updated_at = now() where id = p_session_id;
$$;

create or replace function public.live_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare allowed boolean;
begin
  insert into public.live_rate_limits(bucket, window_started_at, hits)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update set
    hits = case when live_rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then 1 else live_rate_limits.hits + 1 end,
    window_started_at = case when live_rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then now() else live_rate_limits.window_started_at end
  returning hits <= p_limit into allowed;
  return allowed;
end;
$$;

create or replace function public.live_redeem_pairing(p_code_hash text)
returns table(session_id uuid, camera_id uuid, owner_id uuid, room_name text)
language plpgsql security definer set search_path = '' as $$
declare pairing public.live_camera_pairings%rowtype;
declare session public.live_sessions%rowtype;
declare camera public.live_cameras%rowtype;
begin
  select * into pairing from public.live_camera_pairings where code_hash = p_code_hash and redeemed_at is null and expires_at > now() for update;
  if not found then return; end if;
  select * into session from public.live_sessions where id = pairing.session_id and status in ('starting', 'live', 'reconnecting') for update;
  if not found or exists (select 1 from public.live_cameras where live_cameras.session_id = pairing.session_id and revoked_at is null) then return; end if;
  update public.live_camera_pairings set redeemed_at = now() where id = pairing.id;
  insert into public.live_cameras(session_id, identity) values (pairing.session_id, 'camera-' || gen_random_uuid()::text) returning * into camera;
  return query select session.id, camera.id, session.owner_id, session.room_name;
end;
$$;

alter table public.live_host_permissions enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_messages enable row level security;
alter table public.live_cameras enable row level security;
alter table public.live_camera_pairings enable row level security;
alter table public.live_webhook_events enable row level security;
alter table public.live_rate_limits enable row level security;

create policy "public reads live sessions" on public.live_sessions for select to anon, authenticated using (status not in ('ended', 'cancelled'));
create policy "public reads visible live messages" on public.live_messages for select to anon, authenticated using (hidden_at is null);
create policy "public reads active live cameras" on public.live_cameras for select to anon, authenticated using (revoked_at is null);

alter publication supabase_realtime add table public.live_sessions;
alter publication supabase_realtime add table public.live_messages;

revoke all on public.live_host_permissions, public.live_camera_pairings, public.live_webhook_events, public.live_rate_limits from anon, authenticated;
revoke insert, update, delete on public.live_sessions, public.live_messages, public.live_cameras from anon, authenticated;
grant select on public.live_sessions, public.live_messages, public.live_cameras to anon, authenticated;
grant execute on function public.live_redeem_pairing(text), public.live_rate_limit(text, integer, integer), public.live_change_revision(uuid), public.live_start_session(uuid, uuid, integer), public.live_hide_message(uuid, uuid), public.live_transition(uuid, uuid, text[], text) to service_role;
revoke all on function public.live_redeem_pairing(text), public.live_rate_limit(text, integer, integer), public.live_change_revision(uuid), public.live_start_session(uuid, uuid, integer), public.live_hide_message(uuid, uuid), public.live_transition(uuid, uuid, text[], text) from public, anon, authenticated;
