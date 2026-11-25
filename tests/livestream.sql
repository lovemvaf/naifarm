\set ON_ERROR_STOP on
-- Run on a test database after applying the three livestream migrations.
begin;
insert into auth.users(id) values
  ('97aa0000-0000-4000-8000-000000000001'),
  ('97aa0000-0000-4000-8000-000000000002');
insert into public.live_host_permissions (user_id, farm_id, display_name, can_chat) values
  ('97aa0000-0000-4000-8000-000000000001', 'farm-ba-tu-demo', 'Host kiểm thử', true);
insert into public.live_sessions (id, owner_id, farm_id, title) values
  ('98aa0000-0000-4000-8000-000000000001','97aa0000-0000-4000-8000-000000000001','farm-ba-tu-demo','Phiên kiểm thử số một'),
  ('98aa0000-0000-4000-8000-000000000002','97aa0000-0000-4000-8000-000000000001','farm-ba-tu-demo','Phiên kiểm thử số hai');

do $$
declare
  host uuid := '97aa0000-0000-4000-8000-000000000001';
  other uuid := '97aa0000-0000-4000-8000-000000000002';
  first uuid := '98aa0000-0000-4000-8000-000000000001';
  second uuid := '98aa0000-0000-4000-8000-000000000002';
  request_id uuid := '99aa0000-0000-4000-8000-000000000001';
  message_id uuid;
  emitted_identity text;
begin
  if public.live_start_session(first, other) then raise exception 'Nonowner started a session'; end if;
  if not public.live_start_session(first, host) then raise exception 'Owner could not start'; end if;
  begin
    perform public.live_start_session(second, host);
    raise exception 'Second active room was allowed';
  exception when unique_violation then null;
  end;
  update public.live_sessions set room_ready = true, status = 'live' where id = first;
  if public.live_new_pairing(first, 'old-test-code') is null or public.live_new_pairing(first, 'new-test-code') is null then raise exception 'QR not generated'; end if;
  if exists (select 1 from public.live_redeem_pairing('old-test-code')) then raise exception 'Replaced QR still valid'; end if;
  select identity into emitted_identity from public.live_redeem_pairing('new-test-code');
  if emitted_identity is null or not exists(select 1 from public.live_cameras where session_id = first and identity = emitted_identity) then raise exception 'QR did not return stored camera identity'; end if;
  if exists (select 1 from public.live_redeem_pairing('new-test-code')) then raise exception 'QR was used twice'; end if;
  if not public.live_select_camera(first, emitted_identity) then raise exception 'Active paired camera could not be selected'; end if;
  if (select selected_camera_identity from public.live_sessions where id = first) is distinct from emitted_identity then raise exception 'Shared camera selection was not stored'; end if;
  if public.live_select_camera(first, 'camera-revoked') then raise exception 'Unknown camera could be selected'; end if;

  if not public.live_send_message(first, host, 'Host', 'Tin kiểm thử', request_id)
    or not public.live_send_message(first, host, 'Host', 'Tin kiểm thử', request_id) then raise exception 'Idempotent chat send failed'; end if;
  select id into strict message_id from public.live_messages where session_id = first and client_message_id = request_id;
  if public.live_hide_message(second, message_id, host) or public.live_hide_message(first, message_id, other) then raise exception 'Unexpected chat moderation rights'; end if;
  if not public.live_hide_message(first, message_id, host) then raise exception 'Host could not hide message'; end if;
  if (select chat_revision from public.live_updates where session_id = first) is distinct from 2::bigint then raise exception 'Chat realtime revision did not advance twice'; end if;
  if not public.live_transition(first, host, array['live'], 'ended') then raise exception 'Could not end the session'; end if;
  begin
    perform public.live_start_session(second, host);
    raise exception 'Cleanup did not reserve the single slot';
  exception when unique_violation then null;
  end;
  if public.live_send_message(first, host, 'Host', 'Phiên đã đóng', gen_random_uuid()) then raise exception 'Closed room accepted chat'; end if;
  if exists (select 1 from public.live_redeem_pairing('new-test-code')) then raise exception 'Closed room accepted QR'; end if;
  update public.live_sessions set cleanup_pending = false where id = first;
  if not public.live_start_session(second, host) then raise exception 'Cleanup did not release the room slot'; end if;
  if has_table_privilege('anon', 'public.live_messages', 'select') or has_table_privilege('anon', 'public.live_sessions', 'select')
    or not has_table_privilege('anon', 'public.live_updates', 'select')
    or has_function_privilege('authenticated', 'public.live_redeem_pairing(text)', 'execute')
    or has_function_privilege('authenticated', 'public.live_select_camera(uuid, text)', 'execute') then raise exception 'Realtime exposed private data or RPC'; end if;
end
$$;
rollback;
