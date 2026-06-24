# Supabase Auth Setup

## Redirect URLs

The hosted project is configured for:

- Site URL: `https://dot-project-drab.vercel.app`
- Redirect URLs:
  - `https://dot-project-drab.vercel.app/auth/callback`
  - `https://dot-project-drab.vercel.app/auth/reset-password`
  - `http://localhost:3000/**`
  - `https://dot-project-*.vercel.app/**`

Auth email links are validated by `/auth/callback`. Valid recovery and invite
sessions continue to `/auth/reset-password`; other successful flows continue to
`/auth/result`.

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

In Supabase, open Authentication > Emails > Confirm signup.

The confirmation email includes both a code and a secure link:

```html
<p>Your DotProject verification code is: <strong>{{ .Token }}</strong></p>
<p><a href="{{ .ConfirmationURL }}">Confirm email address</a></p>
```

The user can enter the code in the signup form or follow the confirmation link.

Run `supabase-schema.sql` after pulling this change so:

- `customer_profiles.auth_user_id` exists
- every new Supabase Auth user automatically creates a `customer_profiles` row
- existing Auth users are backfilled into `customer_profiles`
