# Deploy Checklist

Use this checklist before every push to keep production stable.

## 0) Launch target (community testing)

- Expected test traffic: around 200-300 users, mostly login and basic booking flow.
- Hosting stack: Vercel (app) + Neon (PostgreSQL).
- This level is usually safe for this stack, but only if the checks below pass.

## 1) Local validation

- Run from project root:
  - `npm install` (only if dependencies changed)
  - `npm run build` (must pass)
  - `npx prisma validate` (must pass)
- Optional quick run:
  - `npm run dev`

## 2) Environment variables

- Never hardcode secrets in code.
- Keep required variables in Vercel Project Settings -> Environment Variables.
- If you add a new env var in code, add it in Vercel before deploy.
- Current required variable:
  - `DATABASE_URL`

Neon notes:
- Use your Neon pooled connection string for runtime traffic.
- Keep secrets only in Vercel env settings and local `.env` (never hardcode in source).

## 3) Prisma / database changes

- Update schema in `prisma/schema.prisma`.
- Create migration locally:
  - `npx prisma migrate dev --name your_change_name`
- Validate schema:
  - `npx prisma validate`
- Commit migration files in `prisma/migrations`.
- If data is needed for setup:
  - `npm run db:seed`

For production deploys:
- Run migrations against production DB before or during release window:
  - `npx prisma migrate deploy`

## 4) Git safety check

- Confirm changed files are intended:
  - `git status`
- Commit with clear message.
- Push to `main`.

## 5) Vercel deploy checks

- Framework: Next.js
- Root Directory: `.`
- Build command: `npm run build`
- Ensure `DATABASE_URL` is set for Production.
- Deploy latest commit.

Traffic readiness:
- Confirm latest deployment is `Ready` before sharing link.
- Keep Vercel logs and Neon dashboard open during first 30-60 minutes.
- If error rate rises, rollback immediately to previous stable deployment.

## 6) Post-deploy smoke test

- Test homepage.
- Test booking flow.
- Test admin login.
- Test booking list in admin page.

Load confidence check (recommended before public share):
- Run a small burst test (for example 30-50 concurrent login attempts).
- Verify no major increase in 5xx responses or DB connection errors.

Go / no-go rule:
- GO: build passes, prisma validate passes, smoke test passes, deployment is healthy.
- NO-GO: login errors, repeated 5xx, or DB connection failures in logs.

## 7) Rollback if needed

- In Vercel Deployments, pick the previous successful deployment and rollback/promote it.
- Fix code locally, re-run `npm run build`, then redeploy.
