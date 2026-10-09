'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

// Same project the public RSVP form writes to (public/site/config.js).
// The anon key only allows inserting/reading rows in the rsvps table —
// it is not a secret credential.
const SUPABASE_URL = 'https://uizyibmeltqzwyuyfpvv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpenlpYm1lbHRxend5dXlmcHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzM4NzcsImV4cCI6MjEwNjkwOTg3N30.UQzfwQOIdkjRWu--2E__vjPgt3zL7_LxZGX7W777xf8';

// Change this to whatever you like — it only protects this page from
// casual visitors, guests never see it.
const ADMIN_PASSWORD = 'JhauSheila2026';

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

const ROLE_LABELS: Record<string, string> = {
  ninong: 'Ninong',
  ninang: 'Ninang',
  'principal-sponsor': 'Principal Sponsor',
  'secondary-sponsor': 'Secondary Sponsor',
  entourage: 'Entourage',
  family: 'Family',
  guest: 'Guest',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [rows, setRows] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      if (sessionStorage.getItem('wedding-admin-unlocked') === '1') {
        setUnlocked(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (unlocked) fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

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

  async function fetchRows() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/rsvps?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      const data = await res.json();
      setRows(data);
    } catch (err) {
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

  if (!unlocked) {
    return (
      <main style={styles.lockScreen}>
        <form onSubmit={tryUnlock} style={styles.lockBox}>
          <h1 style={styles.lockTitle}>Jhau &amp; Sheila — RSVP Admin</h1>
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
          <button type="submit" style={styles.primaryBtn}>
            Unlock
          </button>
        </form>
      </main>
    );
  }

  const attendingYes = rows.filter((r) => r.attending === 'yes');
  const totalHeadcount = attendingYes.reduce(
    (sum, r) => sum + (r.guests || 1),
    0
  );

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <a href="/" style={styles.back}>
          &larr; Back to invitation
        </a>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>RSVP replies</p>
            <h1 style={styles.h1}>Jhau &amp; Sheila</h1>
          </div>
          <div style={styles.headerActions}>
            <button onClick={fetchRows} style={styles.secondaryBtn}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={downloadExcel}
              style={styles.primaryBtn}
              disabled={rows.length === 0}
            >
              Download Excel (.xlsx)
            </button>
          </div>
        </header>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{rows.length}</span>
            <span style={styles.statLabel}>Total replies</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{attendingYes.length}</span>
            <span style={styles.statLabel}>Attending</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{rows.length - attendingYes.length}</span>
            <span style={styles.statLabel}>Not attending</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{totalHeadcount}</span>
            <span style={styles.statLabel}>Total headcount</span>
          </div>
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
                <tr>
                  <td style={styles.emptyCell} colSpan={8}>
                    No RSVPs yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.name}</td>
                  <td style={styles.td}>
                    {ROLE_LABELS[r.role || 'guest'] || r.role || ''}
                  </td>
                  <td style={styles.td}>
                    {r.attending === 'yes' ? 'Yes' : 'No'}
                  </td>
                  <td style={styles.td}>
                    {r.attending === 'yes' ? r.guests || 1 : 0}
                  </td>
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
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  lockScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f6f1e7',
    fontFamily: 'Georgia, serif',
    padding: 24,
  },
  lockBox: {
    background: '#fff',
    padding: '40px 36px',
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,.08)',
    width: '100%',
    maxWidth: 360,
    textAlign: 'center',
  },
  lockTitle: { margin: '0 0 8px', fontSize: 22, color: '#2d2722' },
  lockSub: { margin: '0 0 20px', fontSize: 14, color: '#6b6258' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd3c2',
    fontSize: 15,
    marginBottom: 12,
  },
  page: {
    minHeight: '100vh',
    background: '#faf7f0',
    fontFamily: 'Georgia, serif',
    padding: '32px 20px 80px',
  },
  wrap: { maxWidth: 1100, margin: '0 auto' },
  back: {
    display: 'inline-block',
    marginBottom: 20,
    color: '#8a7a5c',
    textDecoration: 'none',
    fontSize: 14,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  eyebrow: {
    margin: 0,
    fontSize: 13,
    letterSpacing: '.04em',
    color: '#a88f5f',
  },
  h1: { margin: '4px 0 0', fontSize: 32, color: '#2d2722' },
  headerActions: { display: 'flex', gap: 10 },
  primaryBtn: {
    background: '#2d2722',
    color: '#f6f1e7',
    border: 'none',
    borderRadius: 8,
    padding: '12px 20px',
    fontSize: 14,
    cursor: 'pointer',
  },
  secondaryBtn: {
    background: '#fff',
    color: '#2d2722',
    border: '1px solid #ddd3c2',
    borderRadius: 8,
    padding: '12px 20px',
    fontSize: 14,
    cursor: 'pointer',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 14,
    marginBottom: 26,
  },
  statCard: {
    background: '#fff',
    border: '1px solid #ede4d2',
    borderRadius: 10,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statNum: { fontSize: 28, color: '#2d2722' },
  statLabel: { fontSize: 13, color: '#8a7a5c' },
  errorText: { color: '#a23b3b', fontSize: 14 },
  tableWrap: {
    background: '#fff',
    border: '1px solid #ede4d2',
    borderRadius: 10,
    overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    borderBottom: '1px solid #ede4d2',
    color: '#8a7a5c',
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f2ebdd',
    color: '#2d2722',
    verticalAlign: 'top',
  },
  emptyCell: {
    padding: '28px 14px',
    textAlign: 'center',
    color: '#a89a82',
  },
};
