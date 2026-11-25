begin;

alter table public.live_sessions add column selected_camera_identity text;

create function public.live_select_camera(p_session_id uuid, p_identity text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.live_sessions s set selected_camera_identity = p_identity, revision = revision + 1, updated_at = now()
  where s.id = p_session_id and s.room_ready and s.status in ('live', 'reconnecting')
    and (p_identity = 'host-' || s.id::text or exists (
      select 1 from public.live_cameras c where c.session_id = s.id and c.identity = p_identity and c.revoked_at is null
    ));
  return found;
end;
$$;

revoke all on function public.live_select_camera(uuid, text) from public, anon, authenticated;
grant execute on function public.live_select_camera(uuid, text) to service_role;

commit;
