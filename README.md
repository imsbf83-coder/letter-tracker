# Letter & File Tracking System

An internal e-office style tool to track letters/files from 80+ schools as
they move desk to desk in your office — from receiving to final disposal.

- Receiving desk logs each letter (diary no, date, school, sender, subject,
  who it's marked to first)
- Any desk holding a letter can **mark it forward** to another desk with
  remarks, or **close/dispose** it
- Full movement history is kept for every letter
- Search/filter by school, status, diary number, subject
- Login accounts per desk, plus an Admin role that manages schools, desks,
  and users and can see everything office-wide

## 1. What you need before deploying

- A free [GitHub](https://github.com) account
- A free [Vercel](https://vercel.com) account (you can sign up with GitHub)
- A Postgres database. Easiest free options, pick one:
  - [Neon](https://neon.tech) (recommended, generous free tier)
  - [Vercel Postgres](https://vercel.com/storage/postgres) (built into Vercel)
  - [Supabase](https://supabase.com)

## 2. Push this code to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial letter tracking system"
```

Then create a new empty repository on GitHub (no README/license — this
folder already has code), and push:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 3. Create your database

1. Create a new Postgres database on Neon (or your chosen provider).
2. Copy the connection string it gives you — it looks like:
   `postgresql://user:password@host/dbname?sslmode=require`

## 4. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub
   repo you just pushed.
2. Before deploying, open **Environment Variables** and add:
   - `DATABASE_URL` — the connection string from step 3
   - `AUTH_SECRET` — any long random string (generate one locally with
     `openssl rand -base64 32`, or use a password generator)
3. Deploy. Vercel will run `npm install` (which runs `prisma generate`
   automatically) and `next build`.

## 5. Set up the database tables

The first time, you need to create the tables in your new database and add
your first admin login. From your own computer (with Node installed):

```bash
npm install
# Point this at the SAME database you set up in Vercel:
echo 'DATABASE_URL="paste-your-connection-string-here"' > .env
echo 'AUTH_SECRET="same-value-you-put-in-vercel"' >> .env

npx prisma migrate deploy   # creates all tables
npx prisma db seed          # creates your first admin login
```

The seed script prints a username and password (defaults: `admin` /
`changeme123` — you can override with `SEED_ADMIN_USERNAME` and
`SEED_ADMIN_PASSWORD` environment variables before running it).

## 6. First login

1. Open your Vercel URL and log in with the admin account from step 5.
2. Go to **Admin → Desks** and add every designation letters get marked to
   (e.g. "Section Officer", "Deputy Director").
3. Go to **Admin → Schools** and add your 80+ schools (send me the list any
   time and I can help you bulk-import it via a script instead of typing
   each one).
4. Go to **Admin → Users** and create one login per desk.
5. Start logging letters from **New Letter**.

## Local development

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Notes on scope

- Diary numbers are entered manually (not auto-generated), matching your
  existing register.
- A letter always moves to exactly one desk at a time.
- File attachments (scanned copies) aren't included yet — flagged as a
  "maybe later" — but can be added on top of this without a redesign.
