with latest_profile_images as (
  select
    lower(split_part(name, '/', 1)) as email,
    name,
    row_number() over (
      partition by lower(split_part(name, '/', 1))
      order by created_at desc
    ) as image_rank
  from storage.objects
  where bucket_id = 'profile-images'
    and name like '%/%'
)
update public.customer_profiles as profile
set
  photo = 'https://vchepsgmwogfvpiwldxo.supabase.co/storage/v1/object/public/profile-images/'
    || latest.name,
  metadata = coalesce(profile.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'photo',
      'https://vchepsgmwogfvpiwldxo.supabase.co/storage/v1/object/public/profile-images/'
        || latest.name
    )
from latest_profile_images as latest
where latest.image_rank = 1
  and lower(profile.email) = latest.email
  and coalesce(profile.photo, '') = '';
