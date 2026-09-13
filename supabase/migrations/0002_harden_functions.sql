-- Harden functions flagged by the Supabase security linter.

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to postgres, service_role;
