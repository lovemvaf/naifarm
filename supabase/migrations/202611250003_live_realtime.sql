begin;

alter table public.live_sessions
  add column room_ready boolean not null default false,
  add column work_after timestamptz not null default '-infinity',
  add column work_lease_until timestamptz not null default '-infinity',
  add column cleanup_attempts integer not null default 0,
  add column request_id uuid,
  add constraint live_session_create_request unique (owner_id, request_id);

drop index public.live_sessions_single_active;
create unique index live_sessions_single_active on public.live_sessions ((true))
  where status in ('starting', 'live', 'reconnecting') or cleanup_pending;

create table public.live_updates (
  session_id uuid primary key references public.live_sessions(id) on delete cascade,
  session_revision bigint not null default 1,
  chat_revision bigint not null default 0
);

alter table public.live_updates enable row level security;
alter table public.live_updates replica identity full;
create policy live_updates_read on public.live_updates for select to anon, authenticated using (true);
revoke all on public.live_updates from public, anon, authenticated;
grant select on public.live_updates to anon, authenticated;
grant select, insert, update, delete on public.live_updates to service_role;
alter publication supabase_realtime drop table public.live_sessions, public.live_messages;
alter publication supabase_realtime add table public.live_updates;
revoke all on public.live_sessions, public.live_messages, public.live_cameras from public, anon, authenticated;
drop policy "public reads live sessions" on public.live_sessions;
drop policy "public reads visible live messages" on public.live_messages;
drop policy "public reads active live cameras" on public.live_cameras;
grant select, insert, update, delete on public.live_sessions, public.live_messages, public.live_cameras,
  public.live_camera_pairings, public.live_host_permissions, public.live_rate_limits, public.live_webhook_events to service_role;

insert into public.live_updates(session_id, session_revision)
  select id, revision from public.live_sessions;

create function public.live_notify_session() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.live_updates(session_id, session_revision) values (new.id, new.revision)
  on conflict (session_id) do update set session_revision = excluded.session_revision;
  return new;
end;
$$;

create trigger live_session_created after insert on public.live_sessions
for each row execute function public.live_notify_session();
create trigger live_session_revised after update of revision on public.live_sessions
for each row when (old.revision is distinct from new.revision) execute function public.live_notify_session();

create function public.live_notify_chat() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.live_updates set chat_revision = chat_revision + 1 where session_id = new.session_id;
  return new;
end;
$$;

create trigger live_chat_sent after insert on public.live_messages
for each row execute function public.live_notify_chat();
create trigger live_chat_hidden after update of hidden_at on public.live_messages
for each row when (old.hidden_at is distinct from new.hidden_at) execute function public.live_notify_chat();

drop function public.live_start_session(uuid, uuid, integer);
create function public.live_start_session(p_session_id uuid, p_owner_id uuid, p_deadline_seconds integer default 90)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.live_sessions s set status = 'starting',
    start_deadline = now() + make_interval(secs => p_deadline_seconds),
    revision = revision + 1, work_after = now()
  where s.id = p_session_id and s.owner_id = p_owner_id and s.status = 'scheduled'
    and exists (select 1 from public.live_host_permissions h where h.user_id = p_owner_id and h.farm_id = s.farm_id and h.enabled);
  return found;
end;
$$;

drop function public.live_hide_message(uuid, uuid);
create function public.live_hide_message(p_session_id uuid, p_message_id uuid, p_owner_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.live_messages set hidden_at = now()
  where id = p_message_id and session_id = p_session_id and hidden_at is null
    and exists (select 1 from public.live_sessions s where s.id = p_session_id and s.owner_id = p_owner_id);
  return found;
end;
$$;

create or replace function public.live_transition(p_session_id uuid, p_owner_id uuid, p_from text[], p_to text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.live_sessions set status = p_to, revision = revision + 1,
    ended_at = now(), cleanup_pending = p_to = 'ended', work_after = now()
  where id = p_session_id and owner_id = p_owner_id and status = any(p_from);
  return found;
end;
$$;

create function public.live_new_pairing(p_session_id uuid, p_code_hash text)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare expiry timestamptz := now() + interval '5 minutes';
begin
  perform 1 from public.live_sessions where id = p_session_id and room_ready
    and status in ('starting', 'live', 'reconnecting') for update;
  if not found or exists (select 1 from public.live_cameras where session_id = p_session_id and revoked_at is null) then return null; end if;
  update public.live_camera_pairings set expires_at = now() where session_id = p_session_id and redeemed_at is null;
  insert into public.live_camera_pairings(session_id, code_hash, expires_at) values (p_session_id, p_code_hash, expiry);
  return expiry;
end;
$$;

drop function public.live_redeem_pairing(text);
create function public.live_redeem_pairing(p_code_hash text)
returns table(room_name text, identity text) language plpgsql security definer set search_path = '' as $$
declare session_record public.live_sessions%rowtype;
declare pairing_id uuid;
declare camera_identity text := 'camera-' || gen_random_uuid()::text;
begin
  select s.* into session_record from public.live_sessions s join public.live_camera_pairings p on p.session_id = s.id
  where p.code_hash = p_code_hash and s.room_ready and s.status in ('starting', 'live', 'reconnecting') for update of s;
  if not found or exists (select 1 from public.live_cameras where session_id = session_record.id and revoked_at is null) then return; end if;
  update public.live_camera_pairings set redeemed_at = now()
  where code_hash = p_code_hash and redeemed_at is null and expires_at > now()
  returning id into pairing_id;
  if pairing_id is null then return; end if;
  insert into public.live_cameras(session_id, identity) values (session_record.id, camera_identity);
  return query select session_record.room_name, camera_identity;
end;
$$;

create function public.live_send_message(p_session_id uuid, p_sender_id uuid, p_sender_name text, p_body text, p_client_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.live_sessions where id = p_session_id and status in ('live', 'reconnecting') for share;
  if not found then return false; end if;
  if exists (select 1 from public.live_messages where sender_id = p_sender_id and client_message_id = p_client_id and session_id = p_session_id) then return true; end if;
  if not public.live_rate_limit('chat:' || p_sender_id::text, 5, 10) then return null; end if;
  insert into public.live_messages(session_id, sender_id, sender_name, body, client_message_id)
  values (p_session_id, p_sender_id, p_sender_name, p_body, p_client_id)
  on conflict (sender_id, client_message_id) do nothing;
  return true;
end;
$$;

revoke all on function public.live_notify_session(), public.live_notify_chat(), public.live_new_pairing(uuid, text),
  public.live_redeem_pairing(text), public.live_hide_message(uuid, uuid, uuid),
  public.live_start_session(uuid, uuid, integer),
  public.live_send_message(uuid, uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.live_new_pairing(uuid, text), public.live_redeem_pairing(text),
  public.live_hide_message(uuid, uuid, uuid), public.live_start_session(uuid, uuid, integer),
  public.live_send_message(uuid, uuid, text, text, uuid) to service_role;

commit;
