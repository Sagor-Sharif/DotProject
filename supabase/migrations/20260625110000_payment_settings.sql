create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values (
  'payment_methods',
  '{
    "card": {"enabled": true},
    "bkash": {"enabled": true, "number": "0175047924"},
    "nagad": {"enabled": true, "number": "0175047924"},
    "cod": {"enabled": true}
  }'::jsonb
)
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant insert, update on table public.site_settings to authenticated;

create policy "Site settings are publicly readable"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Admins create site settings"
on public.site_settings
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins update site settings"
on public.site_settings
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create or replace function public.validate_customer_payment_method()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings jsonb;
begin
  if (select auth.uid()) is null or (select public.is_admin()) then
    return new;
  end if;

  select value
  into v_settings
  from public.site_settings
  where key = 'payment_methods';

  if not coalesce((v_settings -> new.payment_method ->> 'enabled')::boolean, false) then
    raise exception 'The selected payment method is currently unavailable';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_customer_payment_method_before_insert on public.orders;
create trigger validate_customer_payment_method_before_insert
  before insert on public.orders
  for each row execute function public.validate_customer_payment_method();
