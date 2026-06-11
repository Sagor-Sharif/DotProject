create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'Active',
  photo text,
  emoji text default '3D',
  is_new boolean not null default false,
  is_top boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  shipping_address text,
  photo text,
  created_at timestamptz not null default now()
);

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
  title text not null,
  description text not null,
  photo text,
  video text,
  author_email text,
  created_at timestamptz not null default now()
);

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

insert into admin_access (email, permissions, is_super_admin)
values (
  'sagorsharif27@gmail.com',
  array['dashboard','addProduct','products','editProduct','stock','orders','orderStatus'],
  true
)
on conflict (email) do update set
  permissions = excluded.permissions,
  is_super_admin = true;
