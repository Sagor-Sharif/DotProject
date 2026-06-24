drop policy if exists "Super admin grants admin access" on public.admin_access;
drop policy if exists "Super admin updates admin access" on public.admin_access;
drop policy if exists "Approved reviews are publicly readable" on public.product_reviews;
drop policy if exists "Admins manage blog posts" on public.blog_posts;
drop policy if exists "Admins upload catalog images" on storage.objects;
drop policy if exists "Admins update catalog images" on storage.objects;
drop policy if exists "Admins delete catalog images" on storage.objects;

create policy "Super admin grants admin access"
on public.admin_access
for insert
to authenticated
with check (
  (select public.is_super_admin())
  and not is_super_admin
);

create policy "Super admin updates admin access"
on public.admin_access
for update
to authenticated
using (
  (select public.is_super_admin())
  and not is_super_admin
)
with check (
  (select public.is_super_admin())
  and not is_super_admin
);

create policy "Approved reviews are publicly readable"
on public.product_reviews
for select
to anon, authenticated
using (
  status = 'approved'
  or (
    (select public.current_user_email()) <> ''
    and customer_email = (select public.current_user_email())
  )
  or (select public.is_admin())
);

create policy "Super admin manages blog posts"
on public.blog_posts
for all
to authenticated
using ((select public.is_super_admin()))
with check ((select public.is_super_admin()));

create policy "Admins upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

create policy "Admins update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

create policy "Admins delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

create policy "Super admin uploads blog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and (select public.is_super_admin())
);

create policy "Super admin updates blog images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and (select public.is_super_admin())
)
with check (
  bucket_id = 'blog-images'
  and (select public.is_super_admin())
);

create policy "Super admin deletes blog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and (select public.is_super_admin())
);
