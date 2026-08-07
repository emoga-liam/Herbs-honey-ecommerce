-- Run in Supabase SQL Editor for project hdedblyzfaemsmdujbkn
-- (Dashboard → SQL → New query). Required so the storefront publishable key
-- can SELECT catalog rows. Admin writes stay on Express + DATABASE_URL.

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read product_images" on public.product_images;
create policy "Public read product_images"
  on public.product_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  to anon, authenticated
  using (true);
