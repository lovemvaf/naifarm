# Deploy NaiFarm Live to a staging Preview

This runbook is for a **staging/QA Supabase project and a staging LiveKit project only**. Do not copy the `.env` project into Vercel until its owner confirms it is not production. Do not use `vercel --prod` for this rollout.

## Current deployment status

- `https://naifarm.vercel.app/api/live` currently returns `503` because the deployed app has not enabled NaiFarm Live.
- The Supabase project URL in the local `.env` matches the connected Supabase project, but its QA/production purpose has not been confirmed.
- The livestream migrations are present in that project's migration history. The hosted project has no `pg_cron`/`pg_net` extension or reconcile job yet.
- `vercel whoami` reports an invalid token, and this repository has no `.vercel/project.json`. No Preview or production deployment was created.
- The current worktree contains changes outside the livestream module. Do not deploy the entire dirty worktree. First prepare and review an isolated commit/worktree containing the approved livestream dependency closure; keep the existing working tree intact.

## 1. Prepare a staging deployment

1. Confirm that the Supabase URL and LiveKit project are dedicated to QA/staging. Use separate provider projects/keys from production.
2. Confirm the hosted migration history contains `202611250002_livestream`, `202611250003_live_realtime`, and `202611250004_live_camera_angle`. Do not rerun `0001_init.sql` or `0002_seed.sql` on a project with existing data.
3. Review the isolated deployment diff and ensure it contains only the approved livestream changes and their required dependencies. Build that exact commit before deploying.
4. On a trusted workstation, authenticate the Vercel CLI and link it to the **staging Vercel project**:

   ```powershell
   vercel login
   vercel link
   ```

   Choose the existing staging project when prompted. Do not paste a Vercel token into chat or commit `.vercel` files.

## 2. Configure Vercel Preview variables

In **Vercel → staging project → Settings → Environment Variables**, add the following to the **Preview** environment only. Use values from the staging projects; never print secrets in terminal output or commit them.

| Variable | Value |
|---|---|
| `NAIFARM_LIVE_ENABLED` | `1` |
| `LIVE_SUPABASE_URL` | Staging Supabase project URL |
| `LIVE_SUPABASE_PUBLISHABLE_KEY` | Staging Supabase publishable/anon key |
| `LIVE_SUPABASE_SECRET_KEY` | Staging Supabase service-role/secret key |
| `LIVEKIT_URL` | Staging LiveKit Cloud WebSocket URL |
| `LIVEKIT_API_KEY` | Staging LiveKit API key |
| `LIVEKIT_API_SECRET` | Staging LiveKit API secret |
| `CRON_SECRET` | A fresh, high-entropy random value shared only with the staging scheduler |

The `LIVE_SUPABASE_*` set takes precedence for livestream requests; other NaiFarm modules continue using their existing `SUPABASE_*` variables. `LIVEKIT_API_SECRET`, `LIVE_SUPABASE_SECRET_KEY`, and `CRON_SECRET` must remain server-side secrets. The browser config endpoint is expected to return only the Supabase URL and publishable key.

From that isolated, reviewed worktree, create a **Preview deployment** so the variables take effect:

```powershell
vercel deploy
```

The default command creates a Preview deployment; `--prod` targets production. See [Vercel's CLI deployment guide](https://vercel.com/docs/projects/deploy-from-cli). Do not add `--prod` or promote it to production.

## 3. Configure and verify LiveKit webhook delivery

In the staging LiveKit Cloud project, configure the webhook URL:

```text
https://<staging-preview-host>/api/webhooks/livekit
```

Select the staging API key that corresponds to `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`. Enable room/participant/track lifecycle events used by reconciliation. The endpoint must be reachable by LiveKit Cloud without a human browser login; Preview Deployment Protection can block provider delivery, so verify an actual delivery and its HTTP response before treating this step as complete.

In LiveKit Cloud, confirm delivery succeeds. Then verify the event is recorded once, duplicate delivery remains idempotent, and a provider event reconciles only its matching room. A locally signed payload test does not prove provider-to-Preview connectivity.

## 4. Configure Supabase cleanup/reconciliation scheduler

Use a stable staging URL, not a temporary `trycloudflare.com` tunnel. In the staging Supabase project:

1. Enable **Cron (`pg_cron`)**, **`pg_net`**, and **Vault** if they are not already enabled.
2. Store two Vault secrets:
   - `naifarm_live_staging_url`: the stable staging Preview base URL, without a trailing slash.
   - `naifarm_live_cron_secret`: the same value as Vercel Preview `CRON_SECRET`.
3. In SQL Editor, schedule the authenticated reconcile endpoint every 30 seconds:

   ```sql
   select cron.schedule('naifarm-live-reconcile', '30 seconds', $job$
     select net.http_get(
       url := rtrim(endpoint.decrypted_secret, '/') || '/api/live/reconcile',
       headers := jsonb_build_object('Authorization', 'Bearer ' || worker.decrypted_secret),
       timeout_milliseconds := 15000
     )
     from vault.decrypted_secrets endpoint
     cross join vault.decrypted_secrets worker
     where endpoint.name = 'naifarm_live_staging_url'
       and worker.name = 'naifarm_live_cron_secret';
   $job$);
   ```

4. Check `cron.job_run_details` for successful calls and confirm the endpoint returns HTTP 200 with the bearer secret. Test an abandoned start and a failed room deletion, verify the room is retained and a retry is scheduled, then verify a later retry removes it.

If the Preview host changes, update the Vault URL. To stop the staging job:

```sql
select cron.unschedule('naifarm-live-reconcile');
```

Do not point the scheduler at production or at a temporary local tunnel.

## 5. Preview smoke test and release gate

From a browser without authentication, verify:

```text
GET https://<staging-preview-host>/api/live/config  -> 200, URL + publishable key only
GET https://<staging-preview-host>/api/live         -> 200, session list
GET https://<staging-preview-host>/live              -> 200
GET https://<staging-preview-host>/live/studio       -> 200
GET https://<staging-preview-host>/api/live/reconcile -> 401 without bearer
```

Then create staging-only host/chat pilot accounts and run the full matrix in [README.md](README.md) and [TEST_PLAN.md](TEST_PLAN.md) on laptop and real mobile devices. Verify the LiveKit room count returns to zero after ending the session and after cleanup retries.

Do not declare staging verified until provider webhook delivery, scheduled reconciliation, camera/microphone on a physical laptop and phone, and the two-viewer shared-angle test all pass. Production remains disabled until a separate production approval and production-specific credential/configuration review.
