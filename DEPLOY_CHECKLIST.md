# Deploy Checklist

Use this checklist before every push to keep production stable.

## 1) Local validation

- Run from project root:
  - `npm install` (only if dependencies changed)
  - `npm run build` (must pass)
- Optional quick run:
  - `npm run dev`

## 2) Environment variables

- Never hardcode secrets in code.
- Keep required variables in Vercel Project Settings -> Environment Variables.
- If you add a new env var in code, add it in Vercel before deploy.
- Current required variable:
  - `DATABASE_URL`

## 3) Prisma / database changes

- Update schema in `prisma/schema.prisma`.
- Create migration locally:
  - `npx prisma migrate dev --name your_change_name`
- Validate schema:
  - `npx prisma validate`
- Commit migration files in `prisma/migrations`.
- If data is needed for setup:
  - `npm run db:seed`

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

## 6) Post-deploy smoke test

- Test homepage.
- Test booking flow.
- Test admin login.
- Test booking list in admin page.

## 7) Rollback if needed

- In Vercel Deployments, pick the previous successful deployment and rollback/promote it.
- Fix code locally, re-run `npm run build`, then redeploy.
