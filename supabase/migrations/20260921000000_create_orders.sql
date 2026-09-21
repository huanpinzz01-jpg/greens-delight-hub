create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null check (char_length(customer_name) between 1 and 80),
  phone text not null check (char_length(phone) between 8 and 30),
  email text,
  address text not null check (char_length(address) between 5 and 300),
  delivery_method text not null default '宅配',
  note text,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer,
  total integer not null check (total >= 0),
  status text not null default '待確認',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Customers can create orders"
on public.orders
for insert
to anon, authenticated
with check (status = '待確認');

create index if not exists orders_created_at_idx on public.orders (created_at desc);
