## Why your dev project shows 0 Functions (and how to add them)

What happened: When you restored the database into the dev project, only database objects moved. **Edge Functions are not stored in the database dump**, so the dev project has 0 functions until you deploy them there.

Goal: redeploy the same 3 Edge Functions from your Live project into the new Dev project (Free plan), in simple, click-by-click steps.

### Before you start
- You already created the Dev project and copied the JWT secret—good.
- You need the function code. Ideally it lives in your repo under `supabase/functions/<function-name>/index.ts`. If you only built them in the dashboard, open each function in Live and copy its code into matching local folders.
- Install Supabase CLI (one-time): https://supabase.com/docs/guides/cli

### Step-by-step: deploy the missing functions to Dev
1) **Open your project folder** (where your code lives) on your computer.

2) **Sign in with the CLI** (once):
   ```
   supabase login
   ```
   Paste your Supabase access token when asked (find it in Supabase → Account → Access Tokens).

3) **Link the CLI to the Dev project**:
   - In the Supabase dashboard, open the Dev project, go to **Project Settings → General**, copy the **Project Reference (Project ID)**.
   - In your terminal, run:
     ```
     supabase link --project-ref <DEV_PROJECT_ID>
     ```

4) **Make sure the function code is present locally**:
   - Each function should be in `supabase/functions/<name>/index.ts`.
   - If you only have code in Live’s dashboard: open each function in Live, copy the code, and paste it into matching folders/files locally (e.g., `supabase/functions/create-user/index.ts`).

5) **(If your functions use secrets)** set them for Dev:
   ```
   supabase secrets set KEY=value ANOTHER=value
   ```
   Or from a file: `supabase secrets set --env-file .env` (with the needed keys inside).

6) **Deploy all functions to Dev**:
   ```
   supabase functions deploy
   ```
   This pushes every function in `supabase/functions` to the linked Dev project.

7) **Verify in the Dev dashboard**:
   - Open the Dev project in Supabase.
   - Click **Edge Functions** (left menu). You should see your 3 functions listed. The Functions count on the overview should now show 3.

8) **Quick test (optional but recommended)**:
   - From the Dev dashboard, open a function → click **Test** → send a simple request.
   - Or use curl with the Dev project URL and anon key:
     ```
     curl -H "Authorization: Bearer <DEV_ANON_KEY>" \
          https://<DEV_PROJECT_ID>.supabase.co/functions/v1/<function-name>
     ```

### If you prefer Dashboard-only (no CLI)
You can recreate each function directly in the Dev dashboard:
1) Open Dev project → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2) Paste the code you copied from the Live function.
3) Click **Deploy function**. Repeat for all 3 functions.
4) Add any required secrets under **Edge Functions → Secrets** in the Dev project.

### Why this works
- Database restores don’t include Edge Functions; they must be deployed separately.
- Deploying via CLI (or recreating via dashboard) publishes the code to the Dev project, so it shows up in the Functions count and can be invoked.

### Executive Summary
- Your Dev project shows 0 functions because Edge Functions are not in the database dump.
- To add them: get the function code, link the CLI to the Dev project, run `supabase functions deploy` (and set secrets if needed), then confirm the 3 functions appear in the Dev dashboard.
