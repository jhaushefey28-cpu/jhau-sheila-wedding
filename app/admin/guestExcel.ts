/* Guest-list Excel helpers (pure logic, no browser / xlsx imports so it can
   be tested on its own).

   buildWorkbookSpec()  -> describes a 3-sheet workbook with LIVE formulas:
       "Guest List"  Name | Role | Table | Status | Guests Confirmed | Meal
                     (Status/Guests/Meal are formulas that look each guest up
                      in the "RSVP Replies" sheet — Yes / No / Pending)
       "RSVP Replies" the raw replies from the website
       "Summary"     Yes / No / Pending counts + a per-table breakdown,
                     all COUNTIF / SUMIF formulas
   Every formula cell also carries a pre-computed value, so viewers that do
   not recalculate (phone previews, etc.) still show the right numbers.

   parseGuestRows() / mergeGuests() -> read a filled-in Guest List sheet back
   into the website's guest list. */

export type GuestRow = { name: string; role: string; table?: string };
export type ReplyRow = {
  name: string;
  role: string | null;
  attending: 'yes' | 'no';
  guests: number | null;
  meal: string | null;
  song: string | null;
  message: string | null;
  created_at: string;
};
export type RoleOption = { value: string; label: string };
export type Cell = { v?: string | number; f?: string };
export type SheetSpec = { name: string; rows: Cell[][]; widths: number[] };

// Formulas look at rows 2..MAX_ROW, so up to 1,999 guests / replies.
const MAX_ROW = 2000;
const MIN_ROWS = 300; // guest-list rows that always get formulas

export function norm(s: unknown): string {
  return String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function tableValue(t: string | undefined): string | number {
  const s = (t ?? '').trim();
  return /^\d+$/.test(s) ? Number(s) : s;
}

function tableKey(t: string | number): string {
  return String(t).toLowerCase();
}

export function buildWorkbookSpec(
  guests: GuestRow[],
  replies: ReplyRow[],
  roles: RoleOption[],
  formatDate: (iso: string) => string
): SheetSpec[] {
  const roleLabel = (r: string | null | undefined) =>
    roles.find((o) => o.value === r)?.label || r || '';

  // Newest reply first, so a guest who answered twice is judged by their
  // latest answer (the lookup formulas take the first match).
  const sorted = [...replies].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const RC = `'RSVP Replies'!`;
  const GC = `'Guest List'!`;
  const rng = (sheet: string, col: string) => `${sheet}$${col}$2:$${col}$${MAX_ROW}`;

  /* ---------- RSVP Replies ---------- */
  const guestKeys = new Set(guests.filter((g) => norm(g.name)).map((g) => norm(g.name)));
  const repliesRows: Cell[][] = [[
    { v: 'Name' }, { v: 'Role' }, { v: 'Attending' }, { v: 'Number of Guests' },
    { v: 'Meal Choice' }, { v: 'Song Request' }, { v: 'Message' }, { v: 'Submitted At' },
    { v: 'On guest list?' }, { v: 'Key (helper)' },
  ]];
  sorted.forEach((r, i) => {
    const n = i + 2;
    repliesRows.push([
      { v: r.name },
      { v: roleLabel(r.role || 'guest') },
      { v: r.attending === 'yes' ? 'Yes' : 'No' },
      { v: r.attending === 'yes' ? r.guests || 1 : 0 },
      { v: r.meal || '' },
      { v: r.song || '' },
      { v: r.message || '' },
      { v: formatDate(r.created_at) },
      {
        f: `IF(ISNUMBER(MATCH(J${n},${rng(GC, 'G')},0)),"Yes","Not on list")`,
        v: guestKeys.has(norm(r.name)) ? 'Yes' : 'Not on list',
      },
      { f: `LOWER(TRIM(A${n}))`, v: norm(r.name) },
    ]);
  });

  // First (= newest) reply per guest, for cached values.
  const latest = new Map<string, ReplyRow>();
  for (const r of sorted) if (!latest.has(norm(r.name))) latest.set(norm(r.name), r);

  /* ---------- Guest List ---------- */
  const guestRows: Cell[][] = [[
    { v: 'Name' }, { v: 'Role' }, { v: 'Table' },
    { v: 'Status (auto)' }, { v: 'Guests Confirmed (auto)' }, { v: 'Meal (auto)' },
    { v: 'Key (helper)' },
  ]];
  const status: (string | null)[] = [];
  const seats: number[] = [];
  // Formulas are pre-filled for at least MIN_ROWS rows so new names typed
  // into Excel get their Status / Guests columns automatically.
  const total = Math.max(guests.length, MIN_ROWS);
  for (let i = 0; i < total; i++) {
    const g: GuestRow | undefined = guests[i];
    const n = i + 2;
    const hasName = !!(g && norm(g.name));
    const rep = hasName ? latest.get(norm(g!.name)) : undefined;
    const st = !hasName ? '' : rep ? (rep.attending === 'yes' ? 'Yes' : 'No') : 'Pending';
    const seat = st === 'Yes' ? rep!.guests || 1 : 0;
    status.push(st);
    seats.push(seat);
    const match = `MATCH(G${n},${rng(RC, 'J')},0)`;
    guestRows.push([
      g ? { v: g.name } : {},
      g ? { v: roleLabel(g.role) } : {},
      g ? { v: tableValue(g.table) } : {},
      { f: `IF(A${n}="","",IFERROR(INDEX(${rng(RC, 'C')},${match}),"Pending"))`, v: st },
      { f: `IF(A${n}="","",IF(D${n}="Yes",IFERROR(INDEX(${rng(RC, 'D')},${match}),0),0))`, v: hasName ? seat : '' },
      { f: `IF(A${n}="","",IFERROR(INDEX(${rng(RC, 'E')},${match})&"",""))`, v: hasName && st === 'Yes' ? rep!.meal || '' : '' },
      { f: `IF(A${n}="","",LOWER(TRIM(A${n})))`, v: hasName ? norm(g!.name) : '' },
    ]);
  }
  // Blank cells for Table (so empty tables stay truly empty)
  for (const row of guestRows.slice(1)) if (row[2].v === '') delete row[2].v;

  /* ---------- Summary ---------- */
  const named = guests.filter((g) => norm(g.name));
  const cnt = (s: string) => status.filter((x) => x === s).length;
  const totalSeats = seats.reduce((a, b) => a + b, 0);
  const repYes = sorted.filter((r) => r.attending === 'yes');
  const repHeadcount = repYes.reduce((a, r) => a + (r.guests || 1), 0);
  const notOnList = sorted.filter((r) => !guestKeys.has(norm(r.name))).length;

  const GA = rng(GC, 'A'), GCc = rng(GC, 'C'), GD = rng(GC, 'D'), GE = rng(GC, 'E');
  const summary: Cell[][] = [
    [{ v: 'GUEST LIST STATUS (updates by itself)' }],
    [{ v: 'Guests on the list' }, { f: `COUNTIF(${GA},"?*")`, v: named.length }],
    [{ v: 'Coming (Yes)' }, { f: `COUNTIF(${GD},"Yes")`, v: cnt('Yes') }],
    [{ v: 'Not coming (No)' }, { f: `COUNTIF(${GD},"No")`, v: cnt('No') }],
    [{ v: 'No reply yet (Pending)' }, { f: `COUNTIF(${GD},"Pending")`, v: cnt('Pending') }],
    [{ v: 'Total seats confirmed (headcount)' }, { f: `SUM(${GE})`, v: totalSeats }],
    [],
    [{ v: 'ALL REPLIES RECEIVED (includes repeats and people not on the list)' }],
    [{ v: 'Replies received' }, { f: `COUNTA(${rng(RC, 'A')})`, v: sorted.length }],
    [{ v: 'Replies saying Yes' }, { f: `COUNTIF(${rng(RC, 'C')},"Yes")`, v: repYes.length }],
    [{ v: 'Replies saying No' }, { f: `COUNTIF(${rng(RC, 'C')},"No")`, v: sorted.length - repYes.length }],
    [{ v: 'Headcount from Yes replies' }, { f: `SUMIF(${rng(RC, 'C')},"Yes",${rng(RC, 'D')})`, v: repHeadcount }],
    [{ v: 'Replies whose name is not on the guest list' }, { f: `COUNTIF(${rng(RC, 'I')},"Not on list")`, v: notOnList }],
    [],
    [{ v: 'PER TABLE' }],
    [{ v: 'Table' }, { v: 'Guests assigned' }, { v: 'Yes' }, { v: 'No' }, { v: 'Pending' }, { v: 'Seats confirmed' }],
  ];

  const tableSet = new Map<string, string | number>();
  for (const g of named) {
    const t = tableValue(g.table);
    if (t !== '') tableSet.set(tableKey(t), t);
  }
  const tables = [...tableSet.values()].sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (typeof a === 'number') return -1;
    if (typeof b === 'number') return 1;
    return String(a).localeCompare(String(b), undefined, { numeric: true });
  });
  const inTable = (t: string | number) =>
    guests.map((g, i) => ({ g, i })).filter(({ g }) => norm(g.name) && tableKey(tableValue(g.table)) === tableKey(t));
  const tCell = (t: string | number): Cell => ({ v: t });
  const tRef = (rowNo: number) => `$A${rowNo}`;
  for (const t of tables) {
    const rowNo = summary.length + 1;
    const members = inTable(t);
    summary.push([
      tCell(t),
      { f: `COUNTIF(${GCc},${tRef(rowNo)})`, v: members.length },
      { f: `COUNTIFS(${GCc},${tRef(rowNo)},${GD},"Yes")`, v: members.filter(({ i }) => status[i] === 'Yes').length },
      { f: `COUNTIFS(${GCc},${tRef(rowNo)},${GD},"No")`, v: members.filter(({ i }) => status[i] === 'No').length },
      { f: `COUNTIFS(${GCc},${tRef(rowNo)},${GD},"Pending")`, v: members.filter(({ i }) => status[i] === 'Pending').length },
      { f: `SUMIF(${GCc},${tRef(rowNo)},${GE})`, v: members.reduce((a, { i }) => a + seats[i], 0) },
    ]);
  }
  const noTable = guests
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => norm(g.name) && tableValue(g.table) === '');
  summary.push([
    { v: '(no table yet)' },
    { f: `COUNTIFS(${GA},"?*",${GCc},"")`, v: noTable.length },
    { f: `COUNTIFS(${GA},"?*",${GCc},"",${GD},"Yes")`, v: noTable.filter(({ i }) => status[i] === 'Yes').length },
    { f: `COUNTIFS(${GA},"?*",${GCc},"",${GD},"No")`, v: noTable.filter(({ i }) => status[i] === 'No').length },
    { f: `COUNTIFS(${GA},"?*",${GCc},"",${GD},"Pending")`, v: noTable.filter(({ i }) => status[i] === 'Pending').length },
    { f: `SUMIFS(${GE},${GA},"?*",${GCc},"")`, v: noTable.reduce((a, { i }) => a + seats[i], 0) },
  ]);

  /* ---------- How to use ---------- */
  const help: Cell[][] = [
    [{ v: 'HOW TO USE THIS WORKBOOK' }],
    [{ v: '1. Fill the "Guest List" sheet: Name, Role and Table (columns A-C). Formulas are ready for the first 300 rows; for more, copy the formulas in columns D-G down (max 1,999).' }],
    [{ v: '2. In the website admin: Edit Wedding Details > Guest list > "Import from Excel", pick this file, then press Save changes.' }],
    [{ v: '3. Role can be: Ninong, Ninang, Principal Sponsor, Secondary Sponsor, Entourage, Family or Guest.' }],
    [{ v: '4. Status, Guests Confirmed and the Summary sheet are formulas — they fill in by themselves from the "RSVP Replies" sheet. Do not type over them.' }],
    [{ v: '5. To refresh the Yes / No numbers, download a new workbook from the admin page (it brings in the latest replies).' }],
    [{ v: '6. A guest is matched to their reply by name (capital letters and extra spaces are ignored). Check "RSVP Replies" > "On guest list?" for replies that did not match.' }],
  ];

  return [
    { name: 'Guest List', rows: guestRows, widths: [28, 18, 10, 16, 22, 18, 26] },
    { name: 'RSVP Replies', rows: repliesRows, widths: [26, 18, 11, 16, 18, 24, 36, 20, 16, 26] },
    { name: 'Summary', rows: summary, widths: [46, 16, 8, 8, 10, 16] },
    { name: 'How to use', rows: help, widths: [140] },
  ];
}

/* ------------------------------ import ------------------------------ */

const roleKey = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

export type ParseResult = {
  guests: GuestRow[];
  skippedBlank: number;
  unknownRoles: string[];
};

export function parseGuestRows(rows: unknown[][], roles: RoleOption[]): ParseResult {
  const cell = (r: unknown[], i: number) => (i >= 0 && i < r.length ? r[i] : '');
  let headerRow = -1;
  let nameCol = 0, roleCol = 1, tableCol = 2;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cols = (rows[i] || []).map((c) => String(c ?? '').toLowerCase());
    const n = cols.findIndex((c) => /\bname\b|pangalan/.test(c));
    if (n >= 0) {
      headerRow = i;
      nameCol = n;
      const r = cols.findIndex((c) => /role|tungkulin/.test(c));
      const t = cols.findIndex((c) => /table|mesa|seat/.test(c));
      roleCol = r;
      tableCol = t;
      break;
    }
  }

  const lookup = new Map<string, string>();
  for (const o of roles) {
    lookup.set(roleKey(o.value), o.value);
    lookup.set(roleKey(o.label), o.value);
  }
  lookup.set('sponsor', 'principal-sponsor');

  const out: GuestRow[] = [];
  const unknown = new Set<string>();
  let skippedBlank = 0;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const name = String(cell(r, nameCol) ?? '').trim();
    if (!name) {
      if (r.some((c) => String(c ?? '').trim())) skippedBlank++;
      continue;
    }
    const rawRole = String(cell(r, roleCol) ?? '').trim();
    // Blank role stays '' (so a merge keeps the guest's existing role);
    // an unrecognised role becomes a plain guest and is reported back.
    let role = '';
    if (rawRole) {
      const found = lookup.get(roleKey(rawRole));
      if (found) role = found;
      else {
        role = 'guest';
        unknown.add(rawRole);
      }
    }
    const rawTable = cell(r, tableCol);
    const table = typeof rawTable === 'number' ? String(rawTable) : String(rawTable ?? '').trim();
    out.push({ name, role, table });
  }
  return { guests: out, skippedBlank, unknownRoles: [...unknown] };
}

export function mergeGuests(
  existing: GuestRow[],
  incoming: GuestRow[],
  replace: boolean
): { list: GuestRow[]; added: number; updated: number } {
  if (replace) {
    const seen = new Set<string>();
    const list: GuestRow[] = [];
    for (const g of incoming) {
      const k = norm(g.name);
      if (seen.has(k)) continue;
      seen.add(k);
      list.push({ ...g, role: g.role || 'guest' });
    }
    return { list, added: list.length, updated: 0 };
  }
  const list = existing.map((g) => ({ ...g }));
  const index = new Map<string, number>();
  list.forEach((g, i) => index.set(norm(g.name), i));
  let added = 0, updated = 0;
  for (const g of incoming) {
    const k = norm(g.name);
    const at = index.get(k);
    if (at === undefined) {
      index.set(k, list.length);
      list.push({ ...g, role: g.role || 'guest' });
      added++;
    } else {
      const cur = list[at];
      list[at] = { ...cur, role: g.role || cur.role, table: g.table ? g.table : cur.table || '' };
      updated++;
    }
  }
  return { list, added, updated };
}
