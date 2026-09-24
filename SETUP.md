# Jhau & Sheila — Wedding Invitation Site

Phase 1 of the plan: the cinematic door experience (scratch → reveal → open),
then Welcome → Ceremony → Reception (+ schedule, attire, FAQ) → RSVP.

This is a plain static site — no build step, no framework. Two files:

- `index.html` — the whole site (markup, styling, and behavior)
- `config.js` — **the only file you edit** to change names, date, venues,
  schedule, colors, FAQ, and how RSVP replies are delivered

## 1. Edit `config.js`

Open it in any text editor (or right on GitHub — click the pencil icon).
Fill in your real details: venue names and addresses, the schedule, your
attire colors, and how you want RSVP replies to reach you (see below).
Everything is commented, so it should be self-explanatory.

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

## 3. Push to your existing repo and let Vercel deploy it

```
git clone https://github.com/jhaushefey28-cpu/jhau-sheila-wedding.git
cd jhau-sheila-wedding
# remove old files, then copy in index.html and config.js from this folder
git add -A
git commit -m "Rebuild: cinematic doors + scratch reveal, phase 1"
git push
```

Since `jhau-sheila-wedding-live` is already linked to this repo on Vercel,
pushing to the main branch redeploys it automatically — no manual steps on
Vercel's side.

A note on how I'm helping right now: I can create and edit files here and
manage your Vercel project directly, but I don't have write access to push
commits into your GitHub repo from this chat. If you'd rather I push the
code myself end-to-end, connect a GitHub tool for this conversation and
I'll commit and let Vercel auto-deploy — just say so and I'll show the
connector option.

## What's next (per the phase plan)

Phase 1 (this drop): doors, scratch reveal, welcome, ceremony, reception,
RSVP form — all data-driven from `config.js`, nothing hard-coded in the HTML.
Tell me what to adjust — pacing of the door animation, the photo frame, the
palette, copy — and I'll refine before we move to Phase 2 (polish) and
Phase 3+ (admin dashboard, real database, personalized guest links).
