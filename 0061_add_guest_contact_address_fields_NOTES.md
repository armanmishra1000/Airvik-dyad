# Notes for Supabase migration: `0061_add_guest_contact_address_fields.sql`

This file explains, in plain English, what will happen when you run the migration `supabase/migrations/0061_add_guest_contact_address_fields.sql` in the Supabase **SQL Editor**, and what risks (if any) it has for a **live production** project.

## 1) What this migration changes

This migration makes **two** changes in your database.

### A) Adds 4 new guest columns (no new table)

It adds these columns to the existing table `public.guests`:

- `address` (text)
- `pincode` (text)
- `city` (text)
- `country` (text)

Important details:

- These columns are **optional** (they can be empty / NULL).
- Existing guests will not be changed — they will just have these values as **empty**.
- No rows are deleted or modified.

### B) Creates a new helper function for booking: `get_or_create_booking_guest`

It creates (or replaces) a database function named:

`public.get_or_create_booking_guest(...)`

This function:

- Accepts guest details (first name, last name, phone, email, address, pincode, city, country).
- Treats an empty email like “no email” (it converts empty strings to NULL).
- If email is **missing**, it creates a **new guest** row.
- If email is **present**, it inserts-or-updates the guest based on `email` (because `email` is unique).

It also grants permission so it can be called from the public website via Supabase RPC:

- Allowed for `anon` and `authenticated`

This is the same general pattern used by your existing booking guest helper function.

## 2) Will running this migration break existing booking in production?

### Honest answer

I cannot promise **100%** certainty, because I cannot see every external script, integration, or unusual edge case that might exist in your production environment.

### Practical answer (based on what the SQL actually does)

If you run **only this SQL migration** in Supabase, your existing booking flow should **not break**, because:

1. It **does not remove or rename** anything.
2. It **does not change** the old function `get_or_create_guest`.
3. Adding optional columns does not change how existing queries work.

In other words: running this migration by itself mainly **adds new capability**, it does not change the behavior of current code unless your app is updated to use the new function/columns.

## 3) What *could* cause issues (real risks)

Even though this migration is low-risk, these are the realistic things that can cause problems:

### Risk A: Deploy order (the main one)

If you deploy application code that calls `get_or_create_booking_guest` **before** this migration is run, booking can fail because the function won’t exist yet.

Safe order:

1) Run this migration in Supabase
2) Deploy the app code

### Risk B: Short lock while adding columns

Postgres may take a brief lock on `public.guests` while adding columns.

Usually it is very short, but on a live site it could cause a small “blip” if something is writing to guests at the exact moment.

Recommendation:

- Run it during off-peak time.

### Risk C: Any old/unknown SQL that inserts into `guests` without specifying columns

If you have *any* external SQL like:

```sql
INSERT INTO public.guests VALUES (...)
```

that kind of query can break when columns are added.

Most modern code (including Supabase inserts) uses named columns and is safe.

## 4) What will NOT happen

Running this migration will **NOT**:

- Delete any guest
- Delete any booking/reservation
- Change pricing or availability
- Disable your old booking flow automatically
- Force the website to start requiring or not requiring email

## 5) Recommended quick production safety check

After running the SQL in Supabase SQL Editor, you can quickly confirm the migration succeeded:

### Check the columns exist

Run:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'guests'
  and column_name in ('address','pincode','city','country');
```

### Check the function exists

Run:

```sql
select proname
from pg_proc
join pg_namespace n on n.oid = pg_proc.pronamespace
where n.nspname = 'public'
  and proname = 'get_or_create_booking_guest';
```

## 6) Final decision guide (simple)

- If you run this migration first, and deploy code after, the risk of breaking existing booking is **very low**.
- If you deploy the new code first (without migration), booking can break.
