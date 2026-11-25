create table if not exists public.credentials (
  id text primary key,
  type_id text not null default '',
  holder_id text not null default '',
  holder_legal_name text not null default '',
  product_ids text[] not null default '{}',
  site_ids text[] not null default '{}',
  facility_ids text[] not null default '{}',
  lot_ids text[],
  issuer text not null default '',
  certificate_number text,
  decision_number text,
  standard_version text,
  issue_date text,
  valid_from text,
  valid_to text,
  evidence_ids text[] not null default '{}',
  source_url text,
  source_published_at text,
  checked_at text,
  verification_level text not null default 'self_declared'
    check (verification_level in ('self_declared', 'doc_matched', 'public_source_recorded', 'verifier_checked')),
  lifecycle_status text not null default 'not_provided'
    check (lifecycle_status in (
      'not_provided', 'self_declared', 'pending_verification', 'document_matched',
      'source_verified', 'announced_pending_dossier', 'assessed_not_yet_certified',
      'historical_check_required', 'expiring_soon', 'expired', 'suspended',
      'revoked', 'rejected', 'not_applicable'
    )),
  scope_description text not null default '',
  origin text not null default 'synthetic'
    check (origin in ('public_reference', 'synthetic')),
  permission_to_publish boolean not null default false,
  notes_internal text,
  renewed_from_id text,
  eligible_category_hint text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.credential_evidence (
  id text primary key,
  credential_id text references public.credentials(id) on delete cascade,
  label text not null default '',
  file_key text,
  uploaded_at_label text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  created_at timestamptz not null default now()
);

alter table public.credentials enable row level security;
alter table public.credential_evidence enable row level security;

create policy credentials_select on public.credentials for select using (true);
create policy credentials_write on public.credentials for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

create policy credential_evidence_select on public.credential_evidence for select using (true);
create policy credential_evidence_write on public.credential_evidence for all
  using (public.is_admin() or public.auth_role() = 'coordinator')
  with check (public.is_admin() or public.auth_role() = 'coordinator');

grant select on public.credentials, public.credential_evidence to anon, authenticated;
grant insert, update, delete on public.credentials, public.credential_evidence to authenticated;
