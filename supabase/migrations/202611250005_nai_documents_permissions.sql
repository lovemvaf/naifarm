revoke all on table public.nai_documents from public, anon, authenticated;
grant select, insert, update, delete on table public.nai_documents to service_role;

revoke all on function public.match_nai_documents(extensions.vector, integer, jsonb) from public, anon, authenticated;
grant execute on function public.match_nai_documents(extensions.vector, integer, jsonb) to service_role;

revoke all on function public.search_nai_documents_fts(text, integer) from public, anon, authenticated;
grant execute on function public.search_nai_documents_fts(text, integer) to service_role;
