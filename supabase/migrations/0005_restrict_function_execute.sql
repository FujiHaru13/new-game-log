-- Apply only to databases that already contain the initial schema.
-- Do not include this migration in the new-project setup package.

revoke all on function public.current_user_is_authorized() from public, anon;
revoke all on function public.set_updated_at() from public, anon;
revoke all on function public.check_import_row_match_owners() from public, anon;

grant execute on function public.current_user_is_authorized() to authenticated;
grant execute on function public.set_updated_at() to authenticated;
grant execute on function public.check_import_row_match_owners() to authenticated;
