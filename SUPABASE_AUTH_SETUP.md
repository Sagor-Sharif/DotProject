# Supabase Auth Setup

## Redirect URLs

In Supabase, open Authentication > URL Configuration and set:

- Site URL: your deployed site URL, for example `https://your-project.vercel.app`
- Redirect URLs:
  - `http://localhost:3000`
  - `http://localhost:3000/`
  - your Vercel production URL
  - your Vercel production URL with trailing slash

## Gmail SMTP

In Supabase, open Authentication > Emails > SMTP Settings and enable custom SMTP.

Use:

- Host: `smtp.gmail.com`
- Port: `587`
- Username: your Gmail address
- Password: your Gmail app password
- Sender email: your Gmail address
- Sender name: `DotProject`

Do not commit the Gmail app password to GitHub, `.env.local`, or frontend code.

## Email Features Used By The App

The storefront uses Supabase Auth for:

- Email and password sign up with an email verification code
- Email and password sign in
- Magic link sign in
- Password reset email
- Password update after recovery link

## Signup Code Email Template

In Supabase, open Authentication > Emails > Magic Link.

Make sure the email body includes the token, for example:

```html
Your DotProject verification code is: {{ .Token }}
```

The app asks the user to enter this code after signup.

Run `supabase-schema.sql` after pulling this change so:

- `customer_profiles.auth_user_id` exists
- every new Supabase Auth user automatically creates a `customer_profiles` row
- existing Auth users are backfilled into `customer_profiles`
