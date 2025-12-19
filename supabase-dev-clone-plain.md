## How to make a development copy of your Supabase project (Free plan, plain English)

This guide tells you exactly where to click and what to run so you can create a dev-only Supabase project that mirrors your current one. It keeps things Free-plan friendly and uses simple, repeatable steps.

### What you need before starting
- Free plan allows **up to two active projects**. Make sure you have room for one more.
- The current project’s database password (you can reset it in the dashboard if you forgot it).
- A computer with PostgreSQL tools installed (`pg_dump`, `pg_restore`). Any technical teammate can install these for free.
- Your Supabase URLs and keys (find them in **Settings → API** in each project).

### Step-by-step (do these in order)

#### 1) Create the new development project
1. Open https://supabase.com and sign in.
2. Click **New Project**.
3. Choose the **same region** as your live project (keeps latency similar).
4. Enter a strong **Database Password** and click **Create new project**.
5. After it finishes, go to **Settings → Database → Connection string**, click **Reset password**, and set a password you control (you’ll need it for restore).

#### 2) Prepare connection details (both projects)
1. In the **live (production)** project:
   - Go to **Settings → Database → Connection string** and copy the **Session pooler** connection URL (it’s fine for dumps).
2. In the **new (development)** project:
   - Do the same: **Settings → Database → Connection string**, copy the Session pooler URL.
3. Keep both URLs handy; you’ll paste them into the commands below.

#### 3) Copy the database + logins (one export, one import)
Ask any technical teammate to run these two commands on their machine (they come from Supabase’s own guidance). Replace the passwords/hosts in the URLs you copied.
1. **Export from production**
   ```
   pg_dump "postgresql://postgres:<PROD_PASSWORD>@<PROD_HOST>:5432/postgres?sslmode=require" --format=custom --file=prod.dump
   ```
2. **Import into the new dev project**
   ```
   pg_restore --single-transaction \
     -d "postgresql://postgres:<DEV_PASSWORD>@<DEV_HOST>:5432/postgres?sslmode=require" prod.dump
   ```

What this copies: all tables, data, user accounts (Auth), security rules (RLS), functions, triggers, and storage bucket settings. If you want structure only (no data), add `--schema-only` to the `pg_dump` command.

After the import, go to **Settings → API → JWT secret** in the new project. If you paste the same secret as production, existing sessions stay valid; if you leave it as-is, users will just log in again.

#### 4) Copy the storage files (the DB dump does **not** include actual files)
Bucket names and rules came over in the DB, but files must be copied once. Two simple ways:
- **Short script using Supabase keys (recommended):**
  - Use the **service role key** and **URL** from both projects.
  - A small script lists files in each bucket, downloads, then uploads to the new project. Any developer can run this with the `@supabase/supabase-js` library.
- **S3-style tool (e.g., rclone):**
  - Set up both projects as S3-compatible endpoints in rclone.
  - Run `rclone copy old:bucket new:bucket` for each bucket.

After copying, open a few images/files in the new project to confirm they load.

#### 5) Turn on Realtime in the new project
1. In the new project, go to **Settings → Realtime**.
2. Enable Realtime for the same schemas/tables you use in production.
3. Save. This keeps live updates working in your dev app.

#### 6) Point your app to the dev project
1. In your app’s **development** environment settings, update:
   - `NEXT_PUBLIC_SUPABASE_URL` → new dev project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → new dev anon key
   - `SUPABASE_SERVICE_ROLE_KEY` → new dev service role key
2. Do **not** change production values; keep them for live users.

#### 7) Quick tests (takes 5 minutes)
- Sign up or sign in a test user in dev.
- Create a test booking and read it back.
- Upload a test file and download it.
- If something is blocked, check Row Level Security rules; they were copied with the DB.

### Refreshing dev later (optional)
- Re-run the same two commands (`pg_dump`, then `pg_restore`) to refresh the database copy.
- Re-run the storage copy script/tool if you need newer files.

### Common gotchas to avoid
- The dashboard’s one-click clone is **paid-only**; on Free you must dump/restore + copy files.
- The DB dump copies bucket settings but **not the files**; you must copy files separately.
- If you change the JWT secret in dev, old tokens stop working—users just log in again.
- Stay within Free limits: 500 MB database, 1 GB storage. Delete old test data/files if you get close.

### Executive Summary
- Create a second Free-plan project. Export your production DB, import it into the new project, then copy storage files.
- Reuse the JWT secret if you want current sessions to keep working; otherwise users just log in again.
- Turn on Realtime in the new project, point your dev environment variables to it, and run a few smoke tests (login, booking, upload/download) to confirm all is healthy.
