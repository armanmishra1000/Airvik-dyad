-- Timestamped migration: enable RLS & policies for tariffs

alter table tariffs enable row level security;
drop policy if exists tariffs_select_all on tariffs;
create policy tariffs_select_all on tariffs
for select using (true);
drop policy if exists tariffs_insert_auth on tariffs;
create policy tariffs_insert_auth on tariffs
for insert with check (auth.role() = 'authenticated');
drop policy if exists tariffs_update_auth on tariffs;
create policy tariffs_update_auth on tariffs
for update using (auth.role() = 'authenticated');
drop policy if exists tariffs_delete_auth on tariffs;
create policy tariffs_delete_auth on tariffs
for delete using (auth.role() = 'authenticated');
