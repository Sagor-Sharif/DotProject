create or replace function public.current_user_email()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(coalesce((select auth.jwt() ->> 'email'), ''));
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_access
    where email = public.current_user_email()
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_access
    where email = public.current_user_email()
      and is_super_admin
  );
$$;

create or replace function public.create_customer_order(
  p_order_id text,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_items jsonb,
  p_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := public.current_user_email();
  v_item jsonb;
  v_product_id text;
  v_product_name text;
  v_price numeric(10,2);
  v_stock integer;
  v_qty integer;
  v_total numeric(10,2) := 0;
  v_items_text text := '';
  v_invoice_id text := 'INV-' || regexp_replace(p_order_id, '^DP-', '');
begin
  if (select auth.uid()) is null or v_email = '' then
    raise exception 'Authentication is required';
  end if;

  if p_order_id is null or btrim(p_order_id) = '' then
    raise exception 'Order ID is required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one product';
  end if;

  if p_payment_method not in ('card', 'bkash', 'nagad', 'cod') then
    raise exception 'Unsupported payment method';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := v_item ->> 'id';
    v_qty := coalesce((v_item ->> 'qty')::integer, 0);

    if v_product_id is null or v_qty < 1 then
      raise exception 'Invalid product quantity';
    end if;

    select name, price, stock
    into v_product_name, v_price, v_stock
    from public.products
    where local_id = v_product_id
      and status = 'Active'
    for update;

    if not found then
      raise exception 'Product % is unavailable', v_product_id;
    end if;

    if v_stock < v_qty then
      raise exception 'Not enough stock for %', v_product_name;
    end if;

    v_total := v_total + (v_price * v_qty);
    v_items_text := v_items_text
      || case when v_items_text = '' then '' else ', ' end
      || v_product_name || ' x' || v_qty;
  end loop;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := v_item ->> 'id';
    v_qty := (v_item ->> 'qty')::integer;

    update public.products
    set stock = stock - v_qty,
        sold = sold + v_qty,
        status = case when stock - v_qty <= 0 then 'Out of Stock' else status end
    where local_id = v_product_id;
  end loop;

  insert into public.orders (
    id,
    customer_email,
    customer_name,
    phone,
    address,
    items,
    total,
    payment_method,
    status,
    source
  )
  values (
    p_order_id,
    v_email,
    coalesce(nullif(btrim(p_customer_name), ''), 'Customer'),
    coalesce(p_phone, ''),
    coalesce(p_address, ''),
    p_items,
    v_total,
    p_payment_method,
    'Pending',
    'Online'
  );

  insert into public.invoices (
    id,
    order_id,
    customer_name,
    customer_email,
    phone,
    address,
    items,
    total,
    status,
    source,
    payment_method
  )
  values (
    v_invoice_id,
    p_order_id,
    coalesce(nullif(btrim(p_customer_name), ''), 'Customer'),
    v_email,
    coalesce(p_phone, ''),
    coalesce(p_address, ''),
    v_items_text,
    v_total,
    'Pending',
    'Online',
    p_payment_method
  );

  return jsonb_build_object(
    'order_id', p_order_id,
    'invoice_id', v_invoice_id,
    'total', v_total,
    'items', v_items_text
  );
end;
$$;

revoke all on function public.current_user_email() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.create_customer_order(text, text, text, text, jsonb, text) from public;
grant execute on function public.current_user_email() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;
grant execute on function public.create_customer_order(text, text, text, text, jsonb, text) to authenticated;

alter table public.products enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.admin_access enable row level security;
alter table public.orders enable row level security;
alter table public.invoices enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_likes enable row level security;
alter table public.blog_comments enable row level security;
alter table public.product_reviews enable row level security;

revoke all on table public.products from anon, authenticated;
revoke all on table public.customer_profiles from anon, authenticated;
revoke all on table public.admin_access from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.invoices from anon, authenticated;
revoke all on table public.blog_posts from anon, authenticated;
revoke all on table public.blog_likes from anon, authenticated;
revoke all on table public.blog_comments from anon, authenticated;
revoke all on table public.product_reviews from anon, authenticated;

grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;

grant select, insert, update on table public.customer_profiles to authenticated;

grant select, insert, update, delete on table public.admin_access to authenticated;

grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.invoices to authenticated;

grant select on table public.blog_posts to anon, authenticated;
grant insert, update, delete on table public.blog_posts to authenticated;

grant select on table public.blog_likes to anon, authenticated;
grant insert, delete on table public.blog_likes to authenticated;

grant select on table public.blog_comments to anon, authenticated;
grant insert, delete on table public.blog_comments to authenticated;

grant select on table public.product_reviews to anon, authenticated;
grant insert, update, delete on table public.product_reviews to authenticated;

create policy "Products are publicly readable"
on public.products
for select
to anon, authenticated
using (true);

create policy "Admins manage products"
on public.products
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Customers read own profile"
on public.customer_profiles
for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or email = (select public.current_user_email())
  or (select public.is_admin())
);

create policy "Customers insert own profile"
on public.customer_profiles
for insert
to authenticated
with check (
  auth_user_id = (select auth.uid())
  and email = (select public.current_user_email())
);

create policy "Customers update own profile"
on public.customer_profiles
for update
to authenticated
using (
  auth_user_id = (select auth.uid())
  or email = (select public.current_user_email())
)
with check (
  auth_user_id = (select auth.uid())
  and email = (select public.current_user_email())
);

create policy "Admins read allowed admin access"
on public.admin_access
for select
to authenticated
using (
  email = (select public.current_user_email())
  or (select public.is_super_admin())
);

create policy "Super admin grants admin access"
on public.admin_access
for insert
to authenticated
with check ((select public.is_super_admin()));

create policy "Super admin updates admin access"
on public.admin_access
for update
to authenticated
using ((select public.is_super_admin()))
with check ((select public.is_super_admin()));

create policy "Super admin removes admin access"
on public.admin_access
for delete
to authenticated
using (
  (select public.is_super_admin())
  and not is_super_admin
);

create policy "Customers read own orders"
on public.orders
for select
to authenticated
using (
  customer_email = (select public.current_user_email())
  or (select public.is_admin())
);

create policy "Admins create orders"
on public.orders
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins update orders"
on public.orders
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Super admin deletes orders"
on public.orders
for delete
to authenticated
using ((select public.is_super_admin()));

create policy "Customers read own invoices"
on public.invoices
for select
to authenticated
using (
  customer_email = (select public.current_user_email())
  or (select public.is_admin())
);

create policy "Admins create invoices"
on public.invoices
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins update invoices"
on public.invoices
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Super admin deletes invoices"
on public.invoices
for delete
to authenticated
using ((select public.is_super_admin()));

create policy "Blog posts are publicly readable"
on public.blog_posts
for select
to anon, authenticated
using (true);

create policy "Admins manage blog posts"
on public.blog_posts
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Blog likes are publicly readable"
on public.blog_likes
for select
to anon, authenticated
using (true);

create policy "Customers add own blog likes"
on public.blog_likes
for insert
to authenticated
with check (user_email = (select public.current_user_email()));

create policy "Customers remove own blog likes"
on public.blog_likes
for delete
to authenticated
using (
  user_email = (select public.current_user_email())
  or (select public.is_admin())
);

create policy "Blog comments are publicly readable"
on public.blog_comments
for select
to anon, authenticated
using (true);

create policy "Customers add own blog comments"
on public.blog_comments
for insert
to authenticated
with check (user_email = (select public.current_user_email()));

create policy "Customers remove own blog comments"
on public.blog_comments
for delete
to authenticated
using (
  user_email = (select public.current_user_email())
  or (select public.is_admin())
);

create policy "Approved reviews are publicly readable"
on public.product_reviews
for select
to anon, authenticated
using (
  status = 'approved'
  or customer_email = (select public.current_user_email())
  or (select public.is_admin())
);

create policy "Customers add own product reviews"
on public.product_reviews
for insert
to authenticated
with check (
  customer_email = (select public.current_user_email())
  and status = 'pending'
  and exists (
    select 1
    from public.orders
    where id = order_id
      and customer_email = (select public.current_user_email())
      and exists (
        select 1
        from jsonb_array_elements(items) as order_item
        where order_item ->> 'id' = product_local_id
      )
  )
);

create policy "Admins update product reviews"
on public.product_reviews
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins delete product reviews"
on public.product_reviews
for delete
to authenticated
using ((select public.is_admin()));

drop policy if exists "Public read DotProject images" on storage.objects;
drop policy if exists "Public upload DotProject images" on storage.objects;
drop policy if exists "Public update DotProject images" on storage.objects;
drop policy if exists "Public delete DotProject images" on storage.objects;

create policy "DotProject images are publicly readable"
on storage.objects
for select
to public
using (bucket_id in ('product-images', 'profile-images', 'blog-images'));

create policy "Admins upload catalog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('product-images', 'blog-images')
  and (select public.is_admin())
);

create policy "Admins update catalog images"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('product-images', 'blog-images')
  and (select public.is_admin())
)
with check (
  bucket_id in ('product-images', 'blog-images')
  and (select public.is_admin())
);

create policy "Admins delete catalog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('product-images', 'blog-images')
  and (select public.is_admin())
);

create policy "Customers upload own profile images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = (select public.current_user_email())
);

create policy "Customers update own profile images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-images'
  and (
    (storage.foldername(name))[1] = (select public.current_user_email())
    or (select public.is_admin())
  )
)
with check (
  bucket_id = 'profile-images'
  and (
    (storage.foldername(name))[1] = (select public.current_user_email())
    or (select public.is_admin())
  )
);

create policy "Customers delete own profile images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-images'
  and (
    (storage.foldername(name))[1] = (select public.current_user_email())
    or (select public.is_admin())
  )
);
