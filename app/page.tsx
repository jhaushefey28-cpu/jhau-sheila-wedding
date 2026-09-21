'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Heart, Settings2, Sparkles } from 'lucide-react';

const guestProfiles: Record<string, { role?: string; maxGuests: number }> = {
  'juan dela cruz': { role: 'Ninong', maxGuests: 1 },
  'maria santos': { role: 'Ninang', maxGuests: 1 },
};

function formatName(value: string) {
  return value.trim().replace(/\s+/g, ' ').replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}

export default function Home() {
  const [stage, setStage] = useState<'door' | 'welcome' | 'guest' | 'rsvp'>('door');
  const [scratched, setScratched] = useState(0);
  const [doorOpened, setDoorOpened] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [name, setName] = useState('');
  const [guest, setGuest] = useState<{ name: string; role?: string; maxGuests: number } | null>(null);
  const [rsvp, setRsvp] = useState<'idle' | 'attending' | 'declined'>('idle');
  const [message, setMessage] = useState('');
  const [sitePhoto, setSitePhoto] = useState<string | null>(null);
  const [siteTheme, setSiteTheme] = useState({ bg: '#f3ecdf', accent: '#b99559', text: '#2d2722', door: '#e9dcc5' });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const checkRef = useRef(false);

  useEffect(() => {
    try {
      const savedPhoto = localStorage.getItem('jhau-wedding-photo');
      const savedTheme = localStorage.getItem('jhau-wedding-theme');
      if (savedPhoto) setSitePhoto(savedPhoto);
      if (savedTheme) setSiteTheme(JSON.parse(savedTheme));
    } catch {}
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stage !== 'door') return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#eadfca';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalAlpha = .94;
      ctx.fillStyle = '#c8aa72';
      ctx.font = '600 11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText('KASKASIN DITO', rect.width / 2, rect.height / 2 - 4);
      ctx.globalAlpha = 1;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [stage]);

  function scratch(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current || stage !== 'door') return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    if (!checkRef.current) {
      checkRef.current = true;
      setTimeout(() => {
        checkRef.current = false;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = 0;
        const step = 16;
        for (let i = 3; i < data.length; i += 4 * step) if (data[i] < 50) transparent++;
        const total = Math.ceil(data.length / (4 * step));
        const percent = Math.round((transparent / total) * 100);
        setScratched(percent);
        if (percent >= 34) {
          setDoorOpened(true);
          setTimeout(() => setStage('welcome'), 2200);
        }
      }, 80);
    }
  }

  function changeStage(next: 'door' | 'welcome' | 'guest' | 'rsvp') {
    if (transitioning || stage === next) return;
    setTransitioning(true);
    setDoorOpened(false);
    setTimeout(() => { setStage(next); setTransitioning(false); }, 1200);
  }

  function continueToGuest() {
    if (!name.trim()) return;
    const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ');
    const profile = guestProfiles[normalized];
    setGuest({ name: formatName(name), role: profile?.role, maxGuests: profile?.maxGuests ?? 1 });
    changeStage('rsvp');
  }

  return (
    <main className="wedding-app">
      <div className="ambient-noise" />
      <div className={`transition-doors ${transitioning ? 'closing' : ''}`} aria-hidden="true"><div className="transition-door transition-left"/><div className="transition-door transition-right"/></div>

      {stage === 'door' && (
        <section className="door-stage">
          <div className="door-arch">
            <div className="door-floral floral-left">✦<span>❀</span>✦</div>
            <div className="door-floral floral-right">✦<span>❀</span>✦</div>
            <div className="lantern lantern-left">◉</div>
            <div className="lantern lantern-right">◉</div>

            <div className="couple-reveal">
              <div className="couple-photo">
                <div className="photo-placeholder">
                  <span className="photo-monogram">J <i>&amp;</i> S</span>
                  <small>YOUR COUPLE PHOTO</small>
                </div>
              </div>
              <div className="reveal-caption">
                <span>Jhau &amp; Sheila</span>
                <small>27 · 12 · 2026</small>
              </div>
            </div>

            <div className={`grand-door left-door ${doorOpened ? "door-open" : ""}`}>
              <div className="door-panel" />
              <span className="door-handle">◈</span>
            </div>
            <div className={`grand-door right-door ${doorOpened ? "door-open" : ""}`}>
              <div className="door-panel" />
              <span className="door-handle">◈</span>
            </div>

            <canvas
              ref={canvasRef}
              style={{ opacity: doorOpened ? 0 : 1 }}
              className="scratch-layer"
              onPointerDown={(e) => { drawingRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }}
              onPointerMove={scratch}
              onPointerUp={() => { drawingRef.current = false; }}
              onPointerCancel={() => { drawingRef.current = false; }}
            />

            <div className="scratch-guide">
              <span className="scratch-hand">✧</span>
              <strong>Scratch the center</strong>
              <small>Reveal the couple to open the door</small>
              <div className="scratch-progress"><span style={{ width: `${Math.min(scratched, 100)}%` }} /></div>
            </div>
          </div>
          <div className="door-footer">
            <p>A little invitation to something beautiful</p>
            <span>December 27, 2026</span>
          </div>
        </section>
      )}

      {stage === 'welcome' && (
        <section className="welcome-stage">
          <div className="welcome-photo">
            <div className="photo-placeholder large">
              <span className="photo-monogram">J <i>&amp;</i> S</span>
              <small>YOUR COUPLE PHOTO</small>
            </div>
          </div>
          <div className="welcome-copy">
            <p className="eyebrow">The doors are open</p>
            <h1>Jhau <em>&amp;</em> Sheila</h1>
            <p className="date-large">27 · 12 · 2026</p>
            <p>Welcome to the beginning of our forever.</p>
            <button className="gold-button" onClick={() => changeStage('guest')}>Enter our invitation <ArrowRight size={17} /></button>
          </div>
          <div className="petals" aria-hidden="true">✦　·　✧　·　✦</div>
        </section>
      )}

      {stage === 'guest' && (
        <section className="guest-stage">
          <div className="guest-decoration"><Heart size={18} fill="currentColor" /></div>
          <p className="eyebrow">A personal invitation</p>
          <h1>May we know<br />who we’re welcoming?</h1>
          <p className="lead">Enter your name and we’ll make this invitation a little more personal.</p>
          <div className="guest-form">
            <label htmlFor="guest-name">Your name</label>
            <div className="guest-input">
              <input id="guest-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && continueToGuest()} placeholder="Juan Dela Cruz" />
              <button onClick={continueToGuest} aria-label="Continue"><ArrowRight /></button>
            </div>
          </div>
          <p className="hint">Try: Juan Dela Cruz or Maria Santos</p>
        </section>
      )}

      {stage === 'rsvp' && guest && (
        <section className="rsvp-stage">
          <div className="rsvp-glow" />
          <div className="rsvp-card">
            <p className="eyebrow">Dear {guest.name}</p>
            {guest.role ? (
              <>
                <p className="question-intro">Jhau &amp; Sheila have one little question for you…</p>
                <h1>Will you be our <em>{guest.role}?</em></h1>
              </>
            ) : (
              <>
                <p className="question-intro">We’d love to celebrate this beautiful day with you.</p>
                <h1>Can we save you a seat?</h1>
              </>
            )}
            {rsvp === 'idle' ? (
              <div className="rsvp-actions">
                <button className="rsvp-yes" onClick={() => setRsvp('attending')}>I’d be honored <Heart size={17} /></button>
                <button className="rsvp-no" onClick={() => setRsvp('declined')}>I’ll be cheering from afar <Sparkles size={17} /></button>
              </div>
            ) : (
              <div className="response-box">
                <p>{rsvp === 'attending' ? 'We’re so happy you’ll be there. 🤍' : 'We’ll miss celebrating with you in person.'}</p>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave Jhau & Sheila a little message (optional)" />
                <button className="gold-button" onClick={() => changeStage('welcome')}>{rsvp === 'attending' ? 'Confirm my RSVP' : 'Send my response'} <Check size={17} /></button>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
