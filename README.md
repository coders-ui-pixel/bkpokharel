# bkpokharel — MCQ Exam Platform

A chapter-wise MCQ practice and live-exam platform: course enrollment, PDF study notes, unlimited
chapter-wise MCQ practice, scheduled live exams with a synced leaderboard, flashcards, a study
planner, gamification (XP/streaks/badges), coupons, and a full admin panel.

## Stack

- **Client**: React + Vite + TypeScript, React Query, React Router
- **Server**: Node.js + Express + TypeScript, Prisma ORM, Socket.IO
- **Database**: MySQL

## Project layout

```
client/   React app (Vite)
server/   Express API + Prisma schema/migrations
```

## Local development

Requires Node.js 18+ and a running MySQL server.

```bash
npm install
cp .env.example server/.env      # then fill in real values
cp .env.example client/.env      # VITE_ vars only
npm run prisma:migrate --workspace server
npm run dev                      # runs client (5173) + server (4000) together
```

## Production build

```bash
npm run build
```

This builds `client/dist` (static assets) and compiles the server to `server/dist`.

## Deploying

- **Server**: run `node server/dist/server.js` (after `npm run build`) behind your host's Node.js
  process manager, with `server/.env` configured for the production database and secrets.
- **Client**: serve `client/dist` as static files (e.g. from the same domain, reverse-proxying
  `/api` to the Node server).
- **Database**: run `npx prisma migrate deploy` from `server/` against the production database
  before starting the server for the first time.
- Uploaded files (`server/uploads`, `server/secure-uploads`) are not part of this repo — they're
  created automatically on first upload and should live on persistent storage on the host.
