alter table public.orders
  add column if not exists discount_rate integer not null default 0 check (discount_rate between 0 and 100),
  add column if not exists discount_amount integer not null default 0 check (discount_amount >= 0);

create policy "Admin staff can read orders"
on public.orders
for select
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

