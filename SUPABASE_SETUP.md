# Supabase setup for Jonogon accounts

Jonogon uses Supabase Auth for accounts, Postgres for profiles, feedback, and notifications, and Supabase Storage for profile photos.

## Current project setup

- Supabase project: `vzharjvoihptapvjqcdi`
- The accounts, feedback, notifications, and avatar-storage migration has been applied to the hosted project.
- Email confirmation is enabled.
- The hosted Auth site URL is `https://jonogon.vercel.app`.
- Allowed confirmation callbacks include `http://localhost:3000/auth/callback` and `https://jonogon.vercel.app/auth/callback`.
- Local development credentials are saved in the ignored `.env.local` file. Do not commit that file or add a `service_role` key to the Next.js app.

## Connect a local checkout

Copy `.env.example` to `.env.local`, then set `NEXT_PUBLIC_SUPABASE_URL` to `https://vzharjvoihptapvjqcdi.supabase.co` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the publishable key from Supabase **Project Settings → API Keys**. Restart the Next.js server after changing environment variables.

PowerShell commands for the Supabase CLI use `npx.cmd` so they work when the PowerShell script execution policy blocks `npx.ps1`:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref vzharjvoihptapvjqcdi
npx.cmd supabase db push --dry-run --remote
npx.cmd supabase db push --remote
```

The migration is `supabase/migrations/202611190001_accounts_feedback.sql`. It creates the required tables, the public avatar bucket, and row-level security policies. Users can read and update their own profile; the database-assigned `owner` role can read all profiles and feedback.

## Configure Vercel

The local `.env.local` file does not configure the deployed Vercel site. In Vercel, open the Jonogon project and go to **Settings → Environment Variables**. Add these variables for Production (and Preview if you use preview deployments):

```text
NEXT_PUBLIC_SUPABASE_URL=https://vzharjvoihptapvjqcdi.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<the project's publishable key>
```

Redeploy after saving them. Use only the publishable key in these browser-visible variables; never put a `service_role` key here. The Vercel CLI is not linked or authenticated in this workspace, so these deployed environment variables still need to be set in the Vercel dashboard.

## Create the owner account

The owner email does not have a Jonogon Auth account yet. Sign up at `https://jonogon.vercel.app/signup`, then open the confirmation email. After the confirmed account exists, run this in the Supabase SQL Editor, replacing the placeholder with the owner's exact email:

```sql
update public.profiles as p
set role = 'owner'
from auth.users as u
where p.user_id = u.id
  and lower(u.email) = lower('your-owner-email@example.com')
  and u.email_confirmed_at is not null
returning p.email, p.role;
```

The query returns the updated row when the account exists and its email has been confirmed. Then sign in and open `/owner`. The role cannot be assigned through the public website; the owner page and database policies enforce it.

## Email delivery

Email confirmation is on, but no custom SMTP provider is configured. Supabase's built-in sender is for testing: it only sends to addresses belonging to the project's organization and has a low project-wide rate limit. Configure a production SMTP sender under the Supabase Auth email settings before public registration. Keep SMTP credentials in the Supabase Dashboard, not in this repository.

## Feedback replies and profile photos

The owner panel can send replies into a user's Jonogon notification center. Its Gmail button opens a prefilled Gmail compose window for the owner to review and send. Profile photos use a public avatar bucket; profile fields, feedback, and notifications remain restricted by database policies.
