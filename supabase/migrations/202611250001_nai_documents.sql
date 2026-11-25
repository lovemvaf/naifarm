create extension if not exists vector with schema extensions;

create table if not exists public.nai_documents (
  id bigint generated always as identity primary key,
  source_id text not null,
  source_hash text not null,
  chunk_index integer not null,
  title text not null,
  href text not null,
  content text not null,
  metadata jsonb not null default '{}',
  embedding extensions.vector(768) not null,
  created_at timestamptz not null default now(),
  unique (source_id, source_hash, chunk_index)
);

create index if not exists nai_documents_embedding_hnsw
on public.nai_documents using hnsw (embedding extensions.vector_cosine_ops);

create index if not exists nai_documents_content_fts
on public.nai_documents using gin (to_tsvector('simple', content));

alter table public.nai_documents enable row level security;

create or replace function public.match_nai_documents(
  query_embedding extensions.vector(768), match_count integer default 5,
  filter jsonb default '{}'
) returns table(id bigint, content text, metadata jsonb, title text, href text, similarity real)
language sql stable security invoker set search_path = '' as $$
  select d.id, d.content, d.metadata, d.title, d.href,
    1 - (d.embedding OPERATOR(extensions.<=>) query_embedding)::real as similarity
  from public.nai_documents as d
  where d.metadata @> filter
  order by d.embedding OPERATOR(extensions.<=>) query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

create or replace function public.search_nai_documents_fts(
  search_query text, match_count integer default 5
) returns table(id bigint, content text, title text, href text, rank real)
language sql stable security invoker set search_path = '' as $$
  select d.id, d.content, d.title, d.href,
    ts_rank_cd(to_tsvector('simple', d.content), plainto_tsquery('simple', search_query))::real as rank
  from public.nai_documents as d
  where to_tsvector('simple', d.content) @@ plainto_tsquery('simple', search_query)
  order by rank desc
  limit least(greatest(match_count, 1), 20);
$$;
