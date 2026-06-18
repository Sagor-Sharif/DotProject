create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  local_id text unique,
  name text not null,
  category text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  sold integer not null default 0 check (sold >= 0),
  status text not null default 'Active',
  photo text,
  photos text[] not null default '{}',
  emoji text default '3D',
  is_new boolean not null default false,
  is_top boolean not null default false,
  created_at timestamptz not null default now()
);

alter table products add column if not exists local_id text;
alter table products add column if not exists sold integer not null default 0 check (sold >= 0);
alter table products add column if not exists photos text[] not null default '{}';
create unique index if not exists products_local_id_unique on products(local_id);

create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  shipping_address text,
  photo text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table customer_profiles add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists admin_access (
  email text primary key,
  permissions text[] not null default array['dashboard','products','orders'],
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  customer_email text,
  customer_name text not null,
  phone text,
  address text,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cod',
  status text not null default 'Pending',
  source text not null default 'Online',
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id text primary key,
  order_id text references orders(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  phone text,
  address text,
  items text not null,
  total numeric(10,2) not null default 0,
  status text not null default 'Pending',
  source text not null default 'Online',
  payment_method text,
  created_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  local_id text unique,
  title text not null,
  description text not null,
  photo text,
  video text,
  author_email text,
  created_at timestamptz not null default now()
);

alter table blog_posts add column if not exists local_id text;
create unique index if not exists blog_posts_local_id_unique on blog_posts(local_id);

create table if not exists blog_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references blog_posts(id) on delete cascade,
  user_email text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_email)
);

create table if not exists blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references blog_posts(id) on delete cascade,
  user_email text,
  name text not null default 'Guest',
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists product_reviews (
  id text primary key,
  order_id text,
  product_local_id text,
  product_name text not null,
  customer_name text not null,
  customer_email text,
  rating integer not null default 5 check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

insert into admin_access (email, permissions, is_super_admin)
values (
  'sagorsharif27@gmail.com',
  array['dashboard','addProduct','products','editProduct','stock','orders','orderStatus'],
  true
)
on conflict (email) do update set
  permissions = excluded.permissions,
  is_super_admin = true;

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('profile-images', 'profile-images', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read DotProject images') then
    create policy "Public read DotProject images"
      on storage.objects for select
      using (bucket_id in ('product-images', 'profile-images', 'blog-images'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public upload DotProject images') then
    create policy "Public upload DotProject images"
      on storage.objects for insert
      with check (bucket_id in ('product-images', 'profile-images', 'blog-images'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public update DotProject images') then
    create policy "Public update DotProject images"
      on storage.objects for update
      using (bucket_id in ('product-images', 'profile-images', 'blog-images'))
      with check (bucket_id in ('product-images', 'profile-images', 'blog-images'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public delete DotProject images') then
    create policy "Public delete DotProject images"
      on storage.objects for delete
      using (bucket_id in ('product-images', 'profile-images', 'blog-images'));
  end if;
end $$;
