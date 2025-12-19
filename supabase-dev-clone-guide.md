## Clone your Supabase project to a dev copy (Free plan, plain-English guide)

Goal: make a second Supabase project (Free plan) that behaves like your current one, so you can test safely. You want the same database, login accounts, storage files, and realtime updates.

### Before you start
- Free plan allows **two active projects** total. Make sure you have room for one more.
- The one-click “Restore to new project” is paid-only. On Free you must: copy the database, then copy the storage files.
- The database export already includes tables, security rules, and bucket settings, but **not the actual files** in storage.
- If you keep the same **JWT secret** in the new project, existing logged-in users can keep using their tokens; if you change it, they will simply log in again.

### Step 1 — Create the new (dev) project
1) In Supabase Dashboard, create a new project in the **same region** as production. Set a strong database password.
2) In that new project, go to **Settings → Database → Connection string** and click **Reset password** so you own it.

### Step 2 — Copy the database and logins
Ask a technical teammate to run the two safe commands below on their computer (they come from Supabase’s own docs and work on Free):
```bash
# Make a full backup from production
pg_dump "postgresql://postgres:<PROD_DB_PASSWORD>@<PROD_HOST>:5432/postgres?sslmode=require" --format=custom --file=prod.dump

# Restore that backup into the new dev project
pg_restore --single-transaction \
  -d "postgresql://postgres:<DEV_DB_PASSWORD>@<DEV_HOST>:5432/postgres?sslmode=require" prod.dump
```
That brings over your data, accounts, security rules, and bucket settings. If you want an empty copy (no data), they can add `--schema-only` to the first command.

Afterwards: in the new project, go to **Settings → API → JWT secret** and paste the same secret as production if you want current sessions to stay valid.

### Step 3 — Copy storage files (pictures, PDFs, etc.)
Bucket names and rules already moved with the database, but the files did not. You must copy them once:
- Easiest: use a short script with the Supabase keys for old and new projects to **download then upload** each file. (Any developer can run this; it uses the official `@supabase/supabase-js` library.)
- Alternative: use an S3-compatible tool like **rclone** to copy from the old storage endpoint to the new one.
After copying, open a few files in the new project to confirm they load.

### Step 4 — Realtime
In the new project, open **Settings → Realtime** and enable it for the same schemas/tables you use in production. This keeps live updates working in dev.

### Step 5 — Point the app at the dev project
In your app’s environment settings for development, replace the Supabase URL and keys with the **dev** project values (anon key for the browser, service key for server tasks). Keep production values untouched for live users.

### Step 6 — Quick checks
- Sign up or sign in a test user in dev.
- Make a test booking and read it back.
- Upload a test file and download it.
- If something is blocked, check the Row Level Security policies; they came over with the database.

### Ongoing hygiene
- When the production database changes, you can repeat the two commands to refresh dev, and re-run the storage copy if needed.
- Stay within Free limits (DB size 500 MB, storage 1 GB). Delete old test data if you get close.

### Executive Summary
- Create a second Free-plan project. Export production database, import into the new project, then copy storage **files** separately.
- Reuse the JWT secret if you want existing sessions to keep working; otherwise users just log in again.
- Turn on Realtime in the new project and point your app’s dev environment to the new URL and keys.
- Run a few simple tests (login, booking, file upload/download) to confirm the dev copy is healthy.
