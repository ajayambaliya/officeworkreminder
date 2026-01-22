# Government-Grade Task Reminder & Audit System

A production-ready, secure, and highly auditable task management system designed for Indian government office workflows. Built with Next.js, Supabase, and Telegram integration.

## 🚀 Key Features

- **Government-Grade Security**: Admin-only access with strict RLS policies.
- **Audit-Ready**: Every action (create, update, delete, login) is logged with old/new data snapshots.
- **Task Versioning**: complete history of changes for every task.
- **Automated Telegram Reminders**: Dynamic engine based on JSON rules (Daily, X days before, On Due Date).
- **Bulk Operations**: Excel import/export for large-scale data migration.
- **Mobile-First Design**: premium, modern interface with dark mode support.
- **Soft Delete**: Data is preserved for audit compliance even when removed from view.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Notifications**: Telegram Bot API
- **Scheduler**: GitHub Actions
- **Parsing**: XLSX.js

## ⚙️ Environment Variables

Required variables for deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=your_channel_or_group_id

CRON_SECRET=random_long_string
SITE_URL=https://your-app.vercel.app
```

## 🏗 Setup Instructions

### 1. Supabase Initialization
- Create a new Supabase project.
- Run the provided `supabase_schema.sql` in the SQL Editor.
- Enable Email/Password auth (disable signup if desired, but first user needs to be created).

### 2. Create First Admin
Since public signup is disabled for security:
1. Go to **Authentication > Users** in Supabase and click **"Add User"**.
2. Copy the **User UID** of the newly created user.
3. Go to **SQL Editor** and run the following (replacing the placeholder):
   ```sql
   -- REPLACE 'your-user-uuid-here' with the actual UID from step 2
   INSERT INTO profiles (id, role) 
   VALUES ('your-user-uuid-here', 'ADMIN');
   ```

### 3. Apply RLS Fix (If experiencing Login errors)
If you get "Admin record not found", ensure the RLS policies in `supabase_schema.sql` are applied correctly. The updated policy allows users to see their own profile to verify their role during sign-in.

### 3. Telegram Bot Setup
1. Create a bot using [@BotFather](https://t.me/BotFather).
2. Create a private channel/group and add the bot as an Admin.
3. Get the Channel ID (use [@username_to_id_bot](https://t.me/username_to_id_bot)).

### 4. Deployment
- Deploy the project to **Vercel**.
- Add all environment variables.
- Add `CRON_SECRET` and `SITE_URL` to **GitHub Repository Secrets**.

## 📅 Detailed Deployment & Cron Setup

### 1. Vercel Deployment
1. Connect your GitHub repo to **Vercel**.
2. Add the following **Environment Variables** in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHANNEL_ID`
   - `CRON_SECRET` (Generate a long random string)
   - `SITE_URL` (Your Vercel deployment URL, e.g., `https://officeworkreminder.vercel.app`)

### 2. GitHub Actions (Cron Job)
The system is configured to trigger reminders via GitHub Actions.
1. Go to your GitHub Repository **Settings > Secrets and variables > Actions**.
2. Add these **Repository Secrets**:
   - `SITE_URL`: Your full Vercel URL (e.g., `https://officeworkreminder.vercel.app`)
   - `CRON_SECRET`: Must **EXACTLY MATCH** the `CRON_SECRET` you set in Vercel.
3. The job is defined in `.github/workflows/daily-reminders.yml`.
4. It is scheduled for **09:00 AM IST** (03:30 AM UTC) daily.
5. **Manual Test**: Go to the **Actions** tab in GitHub, select "Daily Task Reminders", and click **Run workflow**.

### 4. Manual Verification (Important)
If you want to trigger the reminder manually from your terminal, you **must** use the `-L` flag to follow HTTPS redirects:
```bash
curl -L -X POST "https://your-site.vercel.app/api/cron/reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
*If you see "Redirecting...", it means you forgot the `-L` flag or used `http` instead of `https`.*

---
**Maintained for 5+ Years Reliability**
