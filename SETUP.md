# Jhau & Sheila — Wedding Invitation Site

Phase 1 of the plan: the cinematic door experience (scratch → reveal → open),
then Welcome → Ceremony → Reception (+ schedule, attire, FAQ) → RSVP.

The site itself is plain HTML/CSS/JS — no build step of its own — but it
lives inside a small Next.js app so it deploys cleanly on Vercel. The files
that matter to you:

- `public/site/index.html` — the whole site (markup, styling, and behavior)
- `public/site/config.js` — **the only file you edit** to change names, date,
  venues, schedule, colors, FAQ, and how RSVP replies are delivered
- `public/site/photos/` — your photos (door background, couple photo, etc.)
- `app/page.tsx` — loads `public/site/index.html` full-screen; you shouldn't
  need to touch this

## 1. Edit `config.js`

Open `public/site/config.js` in any text editor (or right on GitHub — click
the pencil icon). Fill in your real details: venue names and addresses, the
schedule, your attire colors, and how you want RSVP replies to reach you
(see below). Everything is commented, so it should be self-explanatory.

## 2. RSVP delivery — pick one

Set `rsvp.mode` in `config.js` to one of:

- **`"email"`** (default, easiest) — set `rsvp.email` to your address.
  When a guest submits, their email app opens with the reply pre-filled;
  they just hit send. No setup needed beyond your email address.
- **`"webhook"`** — replies get POSTed as JSON to a URL you control (for
  example, a Google Apps Script tied to a Google Sheet). Set `rsvp.webhookUrl`.
- **`"supabase"`** — replies are saved straight into a Supabase table. Fill
  in `rsvp.supabase.url`, `rsvp.supabase.anonKey`, and `rsvp.supabase.table`.
  Say the word and I can provision this table and wire it up properly —
  this is what Phase 4 in the plan covers.

## 3. Deploying

`jhau-sheila-wedding-live` is already linked to this repo on Vercel, so any
push to the `main` branch redeploys it automatically — no manual steps on
Vercel's side needed. I can push changes directly for you going forward.

## What's next (per the phase plan)

Phase 1 (this drop): doors, scratch reveal, welcome, ceremony, reception,
RSVP form — all data-driven from `config.js`, nothing hard-coded in the HTML.
Tell me what to adjust — pacing of the door animation, the photo frame, the
palette, copy — and I'll refine before we move to Phase 2 (polish) and
Phase 3+ (admin dashboard, real database, personalized guest links).
