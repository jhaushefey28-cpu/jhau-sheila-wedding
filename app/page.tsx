'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Check, Heart, MapPin, Music2, Sparkles } from 'lucide-react';

const guestProfiles: Record<string, { role?: string; maxGuests: number }> = {
  'juan dela cruz': { role: 'Ninong', maxGuests: 1 },
  'maria santos': { role: 'Ninang', maxGuests: 1 },
};

function formatName(value: string) {
  return value.trim().replace(/\s+/g, ' ').replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}

export default function Home() {
  const [name, setName] = useState('');
  const [guest, setGuest] = useState<{ name: string; role?: string; maxGuests: number } | null>(null);
  const [rsvp, setRsvp] = useState<'idle' | 'attending' | 'declined'>('idle');
  const [bringingGuest, setBringingGuest] = useState(false);
  const [companion, setCompanion] = useState('');
  const [message, setMessage] = useState('');

  const normalized = useMemo(() => name.toLowerCase().trim().replace(/\s+/g, ' '), [name]);

  function continueToInvitation() {
    if (!name.trim()) return;
    const profile = guestProfiles[normalized];
    setGuest({ name: formatName(name), role: profile?.role, maxGuests: profile?.maxGuests ?? 1 });
    document.getElementById('personal')?.scrollIntoView({ behavior: 'smooth' });
  }

  function chooseAttendance(value: 'attending' | 'declined') {
    setRsvp(value);
    document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' });
  }

  const countdown = 'December 27, 2026';

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <section className="hero" id="home">
        <div className="grain" />
        <div className="hero-copy" data-hero>
          <p className="eyebrow hero-eyebrow">A little invitation to something beautiful</p>
          <h1 className="hero-title">Jhau <span>&amp;</span> Sheila</h1>
          <p className="date hero-date">27 · 12 · 2026</p>
          <p className="hero-note hero-note-animated">We would love for you to be part of the day our forever begins.</p>
          <a className="scroll-cue" href="#welcome" aria-label="Scroll to open invitation">Scroll to open <ArrowDown size={16} /></a>
        </div>
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-spark spark-one" aria-hidden="true">✦</div>
        <div className="hero-spark spark-two" aria-hidden="true">✦</div>
        <div className="hero-spark spark-three" aria-hidden="true">·</div>
        <div className="hero-botanical botanical-left" aria-hidden="true">✦</div>
        <div className="hero-botanical botanical-right" aria-hidden="true">✦</div>
      </section>

      <section className="opening section" id="welcome">
        <div className="section-inner narrow center" data-reveal>
          <p className="eyebrow">Dear friend,</p>
          <h2>Some moments are meant to be shared.</h2>
          <p className="lead">On December 27, 2026, we are gathering the people who have made our story special. We hope you can celebrate this new chapter with us.</p>
          <div className="ornament"><span>J</span><Heart size={15} fill="currentColor" /><span>S</span></div>
        </div>
      </section>

      <section className="personal section" id="personal">
        <div className="section-inner narrow" data-reveal>
          <p className="eyebrow">Make it personal</p>
          <h2>May we know who we’re welcoming?</h2>
          <p className="muted">Enter your name and we’ll make this invitation a little more personal.</p>
          <div className="name-card">
            <label htmlFor="guest-name">Your name</label>
            <div className="name-row">
              <input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && continueToInvitation()} placeholder="Juan Dela Cruz" />
              <button onClick={continueToInvitation} aria-label="Continue"><ArrowRight /></button>
            </div>
          </div>
        </div>
      </section>

      {guest && (
        <section className="question section">
          <div className="section-inner narrow center reveal" data-reveal>
            <p className="eyebrow">A little something from us</p>
            <p className="hello">Dear {guest.name},</p>
            {guest.role ? (
              <>
                <p className="question-intro">Jhau &amp; Sheila have one little question for you…</p>
                <h2>Will you be our <em>{guest.role}?</em></h2>
              </>
            ) : (
              <>
                <p className="question-intro">We’d love to celebrate this beautiful day with you.</p>
                <h2>Can we save you a seat?</h2>
              </>
            )}
            <div className="choice-grid">
              <button className="choice primary" onClick={() => chooseAttendance('attending')}><span>{guest.role ? 'I’d be honored' : 'Yes, save my seat'}</span><Heart size={17} /></button>
              <button className="choice soft" onClick={() => chooseAttendance('declined')}><span>I’ll be cheering from afar</span><Sparkles size={17} /></button>
            </div>
          </div>
        </section>
      )}

      <section className="details section" id="details">
        <div className="section-inner" data-reveal>
          <div className="section-heading"><p className="eyebrow">The day</p><h2>Let’s make a memory.</h2></div>
          <div className="details-grid">
            <article><span className="icon"><Sparkles /></span><p className="label">Date</p><h3>{countdown}</h3><p>Sunday · Save the date</p></article>
            <article><span className="icon"><MapPin /></span><p className="label">Venue</p><h3>Details coming soon</h3><p>The ceremony and reception details will be added here.</p></article>
            <article><span className="icon"><Music2 /></span><p className="label">Dress code</p><h3>Your best dressed self</h3><p>Final palette and attire notes will be announced.</p></article>
          </div>
        </div>
      </section>

      {guest && rsvp !== 'idle' && (
        <section className="rsvp section">
          <div className="section-inner narrow center" data-reveal>
            {rsvp === 'attending' ? (
              <>
                <p className="eyebrow">Almost there</p>
                <h2>We’re so happy you’ll be there. 🤍</h2>
                {guest.maxGuests > 1 ? (
                  <div className="attendance-box">
                    <p className="label">Will you be bringing someone?</p>
                    <div className="mini-choice"><button className={bringingGuest ? 'selected' : ''} onClick={() => setBringingGuest(true)}>Yes, I’ll bring a guest</button><button className={!bringingGuest ? 'selected' : ''} onClick={() => { setBringingGuest(false); setCompanion(''); }}>Just me</button></div>
                    {bringingGuest && <input value={companion} onChange={(e) => setCompanion(e.target.value)} placeholder="Guest’s name" />}
                  </div>
                ) : <p className="muted">This invitation is reserved for {guest.name}.</p>}
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave Jhau & Sheila a little message (optional)" />
                <button className="confirm" onClick={() => document.getElementById('confirmed')?.scrollIntoView({ behavior: 'smooth' })}>Confirm my RSVP <Check size={17} /></button>
              </>
            ) : (
              <>
                <p className="eyebrow">Thank you for letting us know</p>
                <h2>We’ll miss celebrating with you in person.</h2>
                <p className="lead">Your love and support already mean so much to us. 🤍</p>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave us a little message (optional)" />
                <button className="confirm" onClick={() => document.getElementById('confirmed')?.scrollIntoView({ behavior: 'smooth' })}>Send my response <ArrowRight size={17} /></button>
              </>
            )}
          </div>
        </section>
      )}

      <section className="confirmed section" id="confirmed">
        <div className="section-inner narrow center" data-reveal>
          <div className="seal">J <span>&amp;</span> S</div>
          <p className="eyebrow">With love</p>
          <h2>See you on our wedding day.</h2>
          <p className="date-large">27 · 12 · 2026</p>
          <p className="signature">Jhau &amp; Sheila</p>
        </div>
      </section>
    </main>
  );
}
