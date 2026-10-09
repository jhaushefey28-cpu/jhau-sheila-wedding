'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

// Same project the public site reads from / writes to
// (public/site/config.js and public/site/index.html).
// The anon key only allows reading/writing this wedding's own rows —
// it is not a secret credential.
const SUPABASE_URL = 'https://uizyibmeltqzwyuyfpvv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpenlpYm1lbHRxend5dXlmcHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzM4NzcsImV4cCI6MjEwNjkwOTg3N30.UQzfwQOIdkjRWu--2E__vjPgt3zL7_LxZGX7W777xf8';

// Change this to whatever you like — it only protects this page from
// casual visitors, guests never see it.
const ADMIN_PASSWORD = 'JhauSheila2026';

const THEMES = [
  { value: 'classic-ivory', label: 'Classic Ivory' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'romantic-blush', label: 'Romantic Blush' },
  { value: 'emerald-garden', label: 'Emerald Garden' },
  { value: 'vintage-sepia', label: 'Vintage Sepia' },
  { value: 'midnight-silver', label: 'Midnight Silver' },
];

const ROLE_OPTIONS = [
  { value: 'ninong', label: 'Ninong' },
  { value: 'ninang', label: 'Ninang' },
  { value: 'principal-sponsor', label: 'Principal Sponsor' },
  { value: 'secondary-sponsor', label: 'Secondary Sponsor' },
  { value: 'entourage', label: 'Entourage' },
  { value: 'family', label: 'Family' },
  { value: 'guest', label: 'Guest' },
];

type ScheduleItem = { time: string; title: string; note: string };
type Venue = { label: string; name: string; address: string; time: string; mapUrl: string };
type PaletteItem = { name: string; hex: string };
type FaqItem = { q: string; a: string };
type GuestItem = { name: string; role: string };

type WeddingConfig = {
  partner1: string;
  partner2: string;
  familiesLine: string;
  inviteLine: string;
  date: string;
  dateEnd: string;
  locationShort: string;
  hashtag: string;
  theme: string;
  welcomeTitle: string;
  welcomeMessage: string[];
  scheduleTitle: string;
  scheduleLede: string;
  schedule: ScheduleItem[];
  venuesTitle: string;
  venuesLede: string;
  venues: Venue[];
  attireTitle: string;
  attireLede: string;
  attireText: string;
  attireNote: string;
  palette: PaletteItem[];
  faqTitle: string;
  faqLede: string;
  faq: FaqItem[];
  contact: { name: string; phone: string; email: string };
  rsvp: {
    title: string;
    lede: string;
    deadline: string;
    maxGuests: number;
    mealOptions: string[];
    askSongRequest: boolean;
  };
  guestList: GuestItem[];
};

const EMPTY_CONFIG: WeddingConfig = {
  partner1: '', partner2: '', familiesLine: '', inviteLine: '',
  date: '', dateEnd: '', locationShort: '', hashtag: '', theme: 'classic-ivory',
  welcomeTitle: '', welcomeMessage: [''],
  scheduleTitle: '', scheduleLede: '', schedule: [],
  venuesTitle: '', venuesLede: '',
  venues: [
    { label: 'Ceremony', name: '', address: '', time: '', mapUrl: '' },
    { label: 'Reception', name: '', address: '', time: '', mapUrl: '' },
  ],
  attireTitle: '', attireLede: '', attireText: '', attireNote: '', palette: [],
  faqTitle: '', faqLede: '', faq: [],
  contact: { name: '', phone: '', email: '' },
  rsvp: { title: '', lede: '', deadline: '', maxGuests: 4, mealOptions: [], askSongRequest: true },
  guestList: [],
};

type Rsvp = {
  id: string;
  created_at: string;
  name: string;
  role: string | null;
  attending: 'yes' | 'no';
  guests: number | null;
  meal: string | null;
  song: string | null;
  message: string | null;
};

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label])
);

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function sb(path: string, init?: RequestInit) {
  return fetch(SUPABASE_URL + path, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...(init?.headers || {}),
    },
  });
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [tab, setTab] = useState<'rsvps' | 'details'>('rsvps');

  useEffect(() => {
    try {
      if (sessionStorage.getItem('wedding-admin-unlocked') === '1') setUnlocked(true);
    } catch {}
  }, []);

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPasswordError('');
      try {
        sessionStorage.setItem('wedding-admin-unlocked', '1');
      } catch {}
    } else {
      setPasswordError('Incorrect password.');
    }
  }

  if (!unlocked) {
    return (
      <main style={styles.lockScreen}>
        <form onSubmit={tryUnlock} style={styles.lockBox}>
          <h1 style={styles.lockTitle}>Jhau &amp; Sheila — Admin</h1>
          <p style={styles.lockSub}>Enter the admin password to continue.</p>
          <input
            type="password"
            autoFocus
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            style={styles.input}
          />
          {passwordError && <p style={styles.errorText}>{passwordError}</p>}
          <button type="submit" style={styles.primaryBtn}>Unlock</button>
        </form>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <a href="/" style={styles.back}>&larr; Back to invitation</a>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Wedding admin</p>
            <h1 style={styles.h1}>Jhau &amp; Sheila</h1>
          </div>
        </header>

        <div style={styles.tabs}>
          <button
            onClick={() => setTab('rsvps')}
            style={tab === 'rsvps' ? styles.tabActive : styles.tab}
          >
            RSVP Replies
          </button>
          <button
            onClick={() => setTab('details')}
            style={tab === 'details' ? styles.tabActive : styles.tab}
          >
            Edit Wedding Details
          </button>
        </div>

        {tab === 'rsvps' ? <RsvpTab /> : <DetailsTab />}
      </div>
    </main>
  );
}

/* ----------------------------- RSVP tab ----------------------------- */

function RsvpTab() {
  const [rows, setRows] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    setError('');
    try {
      const res = await sb('/rest/v1/rsvps?select=*&order=created_at.desc');
      if (!res.ok) throw new Error(String(res.status));
      setRows(await res.json());
    } catch {
      setError('Could not load RSVPs. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }

  function downloadExcel() {
    const data = rows.map((r) => ({
      Name: r.name,
      Role: ROLE_LABELS[r.role || 'guest'] || r.role || '',
      Attending: r.attending === 'yes' ? 'Yes' : 'No',
      'Number of Guests': r.attending === 'yes' ? r.guests || 1 : 0,
      'Meal Choice': r.meal || '',
      'Song Request': r.song || '',
      Message: r.message || '',
      'Submitted At': formatDate(r.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 24 }, { wch: 18 }, { wch: 10 }, { wch: 16 },
      { wch: 18 }, { wch: 24 }, { wch: 36 }, { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RSVPs');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `jhau-sheila-rsvps-${today}.xlsx`);
  }

  const attendingYes = rows.filter((r) => r.attending === 'yes');
  const totalHeadcount = attendingYes.reduce((sum, r) => sum + (r.guests || 1), 0);

  return (
    <div>
      <div style={styles.headerActions}>
        <button onClick={fetchRows} style={styles.secondaryBtn}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        <button onClick={downloadExcel} style={styles.primaryBtn} disabled={rows.length === 0}>
          Download Excel (.xlsx)
        </button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}><span style={styles.statNum}>{rows.length}</span><span style={styles.statLabel}>Total replies</span></div>
        <div style={styles.statCard}><span style={styles.statNum}>{attendingYes.length}</span><span style={styles.statLabel}>Attending</span></div>
        <div style={styles.statCard}><span style={styles.statNum}>{rows.length - attendingYes.length}</span><span style={styles.statLabel}>Not attending</span></div>
        <div style={styles.statCard}><span style={styles.statNum}>{totalHeadcount}</span><span style={styles.statLabel}>Total headcount</span></div>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Attending</th>
              <th style={styles.th}>Guests</th>
              <th style={styles.th}>Meal</th>
              <th style={styles.th}>Song</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td style={styles.emptyCell} colSpan={8}>No RSVPs yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={styles.td}>{r.name}</td>
                <td style={styles.td}>{ROLE_LABELS[r.role || 'guest'] || r.role || ''}</td>
                <td style={styles.td}>{r.attending === 'yes' ? 'Yes' : 'No'}</td>
                <td style={styles.td}>{r.attending === 'yes' ? r.guests || 1 : 0}</td>
                <td style={styles.td}>{r.meal || ''}</td>
                <td style={styles.td}>{r.song || ''}</td>
                <td style={styles.td}>{r.message || ''}</td>
                <td style={styles.td}>{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------- Details tab ----------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function DetailsTab() {
  const [cfg, setCfg] = useState<WeddingConfig>(EMPTY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<string>('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await sb('/rest/v1/wedding_config?id=eq.default&select=data');
      if (!res.ok) throw new Error(String(res.status));
      const rows = await res.json();
      if (rows[0]?.data) {
        setCfg({ ...EMPTY_CONFIG, ...rows[0].data });
      }
    } catch {
      setError('Could not load current details.');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await sb('/rest/v1/wedding_config?id=eq.default', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ data: cfg, updated_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSavedAt(new Date().toLocaleTimeString('en-PH'));
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof WeddingConfig>(key: K, value: WeddingConfig[K]) {
    setCfg((c) => ({ ...c, [key]: value }));
  }

  if (loading) return <p style={styles.statLabel}>Loading current details…</p>;

  const ceremony = cfg.venues[0] || { label: 'Ceremony', name: '', address: '', time: '', mapUrl: '' };
  const reception = cfg.venues[1] || { label: 'Reception', name: '', address: '', time: '', mapUrl: '' };

  function setVenue(i: number, v: Venue) {
    const next = [...cfg.venues];
    next[i] = v;
    set('venues', next);
  }

  return (
    <div>
      <div style={styles.saveBar}>
        <button onClick={save} style={styles.primaryBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {savedAt && <span style={styles.statLabel}>Saved at {savedAt} — live on the site now.</span>}
        {error && <span style={styles.errorText}>{error}</span>}
      </div>

      <Section title="The couple">
        <Row>
          <Field label="Partner 1 name"><input style={styles.input} value={cfg.partner1} onChange={(e) => set('partner1', e.target.value)} /></Field>
          <Field label="Partner 2 name"><input style={styles.input} value={cfg.partner2} onChange={(e) => set('partner2', e.target.value)} /></Field>
        </Row>
        <Field label="Families line"><input style={styles.input} value={cfg.familiesLine} onChange={(e) => set('familiesLine', e.target.value)} /></Field>
        <Field label="Invite line"><input style={styles.input} value={cfg.inviteLine} onChange={(e) => set('inviteLine', e.target.value)} /></Field>
        <Row>
          <Field label="Ceremony start (date &amp; time)">
            <input type="datetime-local" style={styles.input} value={toLocalInput(cfg.date)} onChange={(e) => set('date', fromLocalInput(e.target.value))} />
          </Field>
          <Field label="Event ends (for Add to calendar)">
            <input type="datetime-local" style={styles.input} value={toLocalInput(cfg.dateEnd)} onChange={(e) => set('dateEnd', fromLocalInput(e.target.value))} />
          </Field>
        </Row>
        <Row>
          <Field label="City / Province (shown on cover)"><input style={styles.input} value={cfg.locationShort} onChange={(e) => set('locationShort', e.target.value)} /></Field>
          <Field label="Hashtag (optional)"><input style={styles.input} value={cfg.hashtag} onChange={(e) => set('hashtag', e.target.value)} placeholder="#JhauAndSheila" /></Field>
        </Row>
        <Field label="Theme">
          <select style={styles.input} value={cfg.theme} onChange={(e) => set('theme', e.target.value)}>
            {THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Welcome message">
        <Field label="Title"><input style={styles.input} value={cfg.welcomeTitle} onChange={(e) => set('welcomeTitle', e.target.value)} /></Field>
        <Field label="Message (one paragraph per line)">
          <textarea
            style={{ ...styles.input, minHeight: 90 }}
            value={cfg.welcomeMessage.join('\n')}
            onChange={(e) => set('welcomeMessage', e.target.value.split('\n'))}
          />
        </Field>
      </Section>

      <Section title="Schedule">
        <Row>
          <Field label="Section title"><input style={styles.input} value={cfg.scheduleTitle} onChange={(e) => set('scheduleTitle', e.target.value)} /></Field>
          <Field label="Subtitle"><input style={styles.input} value={cfg.scheduleLede} onChange={(e) => set('scheduleLede', e.target.value)} /></Field>
        </Row>
        {cfg.schedule.map((item, i) => (
          <RepeatRow key={i} onRemove={() => set('schedule', cfg.schedule.filter((_, j) => j !== i))}>
            <input style={{ ...styles.input, maxWidth: 110 }} placeholder="2:00 PM" value={item.time} onChange={(e) => set('schedule', patch(cfg.schedule, i, { ...item, time: e.target.value }))} />
            <input style={styles.input} placeholder="Guests arrive" value={item.title} onChange={(e) => set('schedule', patch(cfg.schedule, i, { ...item, title: e.target.value }))} />
            <input style={styles.input} placeholder="Note (optional)" value={item.note} onChange={(e) => set('schedule', patch(cfg.schedule, i, { ...item, note: e.target.value }))} />
          </RepeatRow>
        ))}
        <AddButton onClick={() => set('schedule', [...cfg.schedule, { time: '', title: '', note: '' }])}>+ Add schedule item</AddButton>
      </Section>

      <Section title="Venues">
        <Field label="Section title"><input style={styles.input} value={cfg.venuesTitle} onChange={(e) => set('venuesTitle', e.target.value)} /></Field>
        <Field label="Subtitle"><input style={styles.input} value={cfg.venuesLede} onChange={(e) => set('venuesLede', e.target.value)} /></Field>
        <VenueBox label="Ceremony" venue={{ ...ceremony, label: 'Ceremony' }} onChange={(v) => setVenue(0, v)} />
        <VenueBox label="Reception" venue={{ ...reception, label: 'Reception' }} onChange={(v) => setVenue(1, v)} />
      </Section>

      <Section title="Attire">
        <Row>
          <Field label="Title"><input style={styles.input} value={cfg.attireTitle} onChange={(e) => set('attireTitle', e.target.value)} /></Field>
          <Field label="Subtitle"><input style={styles.input} value={cfg.attireLede} onChange={(e) => set('attireLede', e.target.value)} /></Field>
        </Row>
        <Field label="Description"><textarea style={{ ...styles.input, minHeight: 60 }} value={cfg.attireText} onChange={(e) => set('attireText', e.target.value)} /></Field>
        <Field label="Note (e.g. colors to avoid)"><input style={styles.input} value={cfg.attireNote} onChange={(e) => set('attireNote', e.target.value)} /></Field>
        <span style={styles.fieldLabel}>Color palette</span>
        {cfg.palette.map((c, i) => (
          <RepeatRow key={i} onRemove={() => set('palette', cfg.palette.filter((_, j) => j !== i))}>
            <input style={styles.input} placeholder="Color name" value={c.name} onChange={(e) => set('palette', patch(cfg.palette, i, { ...c, name: e.target.value }))} />
            <input type="color" style={{ ...styles.input, maxWidth: 60, padding: 4 }} value={/^#([0-9a-f]{6})$/i.test(c.hex) ? c.hex : '#cccccc'} onChange={(e) => set('palette', patch(cfg.palette, i, { ...c, hex: e.target.value }))} />
            <input style={{ ...styles.input, maxWidth: 110 }} placeholder="#2F4A3E" value={c.hex} onChange={(e) => set('palette', patch(cfg.palette, i, { ...c, hex: e.target.value }))} />
          </RepeatRow>
        ))}
        <AddButton onClick={() => set('palette', [...cfg.palette, { name: '', hex: '#2F4A3E' }])}>+ Add color</AddButton>
      </Section>

      <Section title="Frequently asked questions">
        <Row>
          <Field label="Section title"><input style={styles.input} value={cfg.faqTitle} onChange={(e) => set('faqTitle', e.target.value)} /></Field>
          <Field label="Subtitle"><input style={styles.input} value={cfg.faqLede} onChange={(e) => set('faqLede', e.target.value)} /></Field>
        </Row>
        {cfg.faq.map((item, i) => (
          <div key={i} style={styles.faqEditRow}>
            <input style={styles.input} placeholder="Question" value={item.q} onChange={(e) => set('faq', patch(cfg.faq, i, { ...item, q: e.target.value }))} />
            <textarea style={{ ...styles.input, minHeight: 50 }} placeholder="Answer" value={item.a} onChange={(e) => set('faq', patch(cfg.faq, i, { ...item, a: e.target.value }))} />
            <button style={styles.removeBtn} onClick={() => set('faq', cfg.faq.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <AddButton onClick={() => set('faq', [...cfg.faq, { q: '', a: '' }])}>+ Add question</AddButton>
      </Section>

      <Section title="Contact">
        <Row>
          <Field label="Name"><input style={styles.input} value={cfg.contact.name} onChange={(e) => set('contact', { ...cfg.contact, name: e.target.value })} /></Field>
          <Field label="Phone"><input style={styles.input} value={cfg.contact.phone} onChange={(e) => set('contact', { ...cfg.contact, phone: e.target.value })} /></Field>
          <Field label="Email"><input style={styles.input} value={cfg.contact.email} onChange={(e) => set('contact', { ...cfg.contact, email: e.target.value })} /></Field>
        </Row>
      </Section>

      <Section title="RSVP form">
        <Row>
          <Field label="Title"><input style={styles.input} value={cfg.rsvp.title} onChange={(e) => set('rsvp', { ...cfg.rsvp, title: e.target.value })} /></Field>
          <Field label="Reply deadline"><input type="date" style={styles.input} value={cfg.rsvp.deadline} onChange={(e) => set('rsvp', { ...cfg.rsvp, deadline: e.target.value })} /></Field>
          <Field label="Max guests per reply"><input type="number" min={1} style={styles.input} value={cfg.rsvp.maxGuests} onChange={(e) => set('rsvp', { ...cfg.rsvp, maxGuests: Number(e.target.value) || 1 })} /></Field>
        </Row>
        <Field label="Message"><input style={styles.input} value={cfg.rsvp.lede} onChange={(e) => set('rsvp', { ...cfg.rsvp, lede: e.target.value })} /></Field>
        <Field label="Meal choices (comma-separated, leave blank to hide)">
          <input style={styles.input} value={cfg.rsvp.mealOptions.join(', ')} onChange={(e) => set('rsvp', { ...cfg.rsvp, mealOptions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="Beef, Fish, Vegetarian" />
        </Field>
        <label style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={cfg.rsvp.askSongRequest} onChange={(e) => set('rsvp', { ...cfg.rsvp, askSongRequest: e.target.checked })} />
          Ask guests for a song request
        </label>
      </Section>

      <Section title="Guest list (for the Ninong / Ninang wording)">
        <p style={styles.statLabel}>
          Add every guest whose invitation should mention a role (Ninong, Ninang, sponsor, entourage). Anyone not listed still gets the normal RSVP question.
        </p>
        {cfg.guestList.map((g, i) => (
          <RepeatRow key={i} onRemove={() => set('guestList', cfg.guestList.filter((_, j) => j !== i))}>
            <input style={styles.input} placeholder="Full name" value={g.name} onChange={(e) => set('guestList', patch(cfg.guestList, i, { ...g, name: e.target.value }))} />
            <select style={styles.input} value={g.role} onChange={(e) => set('guestList', patch(cfg.guestList, i, { ...g, role: e.target.value }))}>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </RepeatRow>
        ))}
        <AddButton onClick={() => set('guestList', [...cfg.guestList, { name: '', role: 'guest' }])}>+ Add guest</AddButton>
      </Section>

      <div style={styles.saveBar}>
        <button onClick={save} style={styles.primaryBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {savedAt && <span style={styles.statLabel}>Saved at {savedAt} — live on the site now.</span>}
      </div>
    </div>
  );
}

function VenueBox({ label, venue, onChange }: { label: string; venue: Venue; onChange: (v: Venue) => void }) {
  return (
    <div style={styles.venueBox}>
      <b>{label}</b>
      <Row>
        <Field label="Name"><input style={styles.input} value={venue.name} onChange={(e) => onChange({ ...venue, name: e.target.value })} /></Field>
        <Field label="Time"><input style={styles.input} value={venue.time} onChange={(e) => onChange({ ...venue, time: e.target.value })} /></Field>
      </Row>
      <Field label="Full address"><input style={styles.input} value={venue.address} onChange={(e) => onChange({ ...venue, address: e.target.value })} /></Field>
      <Field label="Google Maps link (optional)"><input style={styles.input} value={venue.mapUrl} onChange={(e) => onChange({ ...venue, mapUrl: e.target.value })} /></Field>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={styles.row}>{children}</div>;
}

function RepeatRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div style={styles.repeatRow}>
      {children}
      <button style={styles.removeBtn} onClick={onRemove}>Remove</button>
    </div>
  );
}

function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button style={styles.addBtn} onClick={onClick}>{children}</button>;
}

function patch<T>(arr: T[], i: number, value: T): T[] {
  const next = [...arr];
  next[i] = value;
  return next;
}

function toLocalInput(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string) {
  if (!local) return '';
  // Treat the picked time as Philippine time (+08:00), matching the site.
  return local + ':00+08:00';
}

/* ------------------------------- styles -------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  lockScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f1e7', fontFamily: 'Georgia, serif', padding: 24 },
  lockBox: { background: '#fff', padding: '40px 36px', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,.08)', width: '100%', maxWidth: 360, textAlign: 'center' },
  lockTitle: { margin: '0 0 8px', fontSize: 22, color: '#2d2722' },
  lockSub: { margin: '0 0 20px', fontSize: 14, color: '#6b6258' },
  input: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd3c2', fontSize: 14, fontFamily: 'inherit', marginBottom: 0 },
  page: { minHeight: '100vh', background: '#faf7f0', fontFamily: 'Georgia, serif', padding: '32px 20px 100px' },
  wrap: { maxWidth: 900, margin: '0 auto' },
  back: { display: 'inline-block', marginBottom: 20, color: '#8a7a5c', textDecoration: 'none', fontSize: 14 },
  header: { marginBottom: 20 },
  eyebrow: { margin: 0, fontSize: 13, letterSpacing: '.04em', color: '#a88f5f' },
  h1: { margin: '4px 0 0', fontSize: 32, color: '#2d2722' },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #ede4d2' },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '10px 4px', marginRight: 20, fontSize: 15, color: '#8a7a5c', cursor: 'pointer', fontFamily: 'inherit' },
  tabActive: { background: 'none', border: 'none', borderBottom: '2px solid #2d2722', padding: '10px 4px', marginRight: 20, fontSize: 15, color: '#2d2722', cursor: 'pointer', fontFamily: 'inherit' },
  headerActions: { display: 'flex', gap: 10, marginBottom: 20 },
  primaryBtn: { background: '#2d2722', color: '#f6f1e7', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, cursor: 'pointer' },
  secondaryBtn: { background: '#fff', color: '#2d2722', border: '1px solid #ddd3c2', borderRadius: 8, padding: '12px 20px', fontSize: 14, cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 26 },
  statCard: { background: '#fff', border: '1px solid #ede4d2', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 },
  statNum: { fontSize: 28, color: '#2d2722' },
  statLabel: { fontSize: 13, color: '#8a7a5c' },
  errorText: { color: '#a23b3b', fontSize: 14 },
  tableWrap: { background: '#fff', border: '1px solid #ede4d2', borderRadius: 10, overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid #ede4d2', color: '#8a7a5c', fontWeight: 'normal', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #f2ebdd', color: '#2d2722', verticalAlign: 'top' },
  emptyCell: { padding: '28px 14px', textAlign: 'center', color: '#a89a82' },
  saveBar: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  section: { background: '#fff', border: '1px solid #ede4d2', borderRadius: 10, padding: '20px 22px', marginBottom: 18 },
  sectionTitle: { margin: '0 0 16px', fontSize: 18, color: '#2d2722' },
  row: { display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' },
  field: { flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: '#8a7a5c' },
  repeatRow: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 },
  faqEditRow: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f2ebdd' },
  removeBtn: { background: 'none', border: '1px solid #e2cfcf', color: '#a23b3b', borderRadius: 6, padding: '8px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
  addBtn: { background: 'none', border: '1px dashed #c9b893', color: '#8a7a5c', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', marginTop: 4 },
  venueBox: { background: '#faf7f0', border: '1px solid #f2ebdd', borderRadius: 8, padding: 16, marginBottom: 14 },
};
