'use client';

import { useEffect, useState } from 'react';
import type { PointerEvent } from 'react';

type Stage = 'door' | 'welcome' | 'details' | 'guest';

export default function Home() {
  const [stage, setStage] = useState<Stage>('door');
  const [scratched, setScratched] = useState(0);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open || stage !== 'door' || closing) return;
    const timer = window.setTimeout(() => transitionTo('welcome'), 900);
    return () => window.clearTimeout(timer);
  }, [open, stage, closing]);

  const transitionTo = (next: Stage) => {
    if (closing || stage === next) return;
    setClosing(true);
    setOpen(false);
    window.setTimeout(() => {
      setStage(next);
      window.setTimeout(() => setClosing(false), 650);
    }, 850);
  };

  const addScratch = (amount = 8) => {
    if (open || closing) return;
    setScratched((current) => {
      const next = Math.min(100, current + amount);
      if (next >= 100) setOpen(true);
      return next;
    });
  };

  const scratch = (event: PointerEvent<HTMLDivElement>) => {
    if (open || closing) return;
    if (event.pointerType !== 'touch' && event.buttons !== 1) return;
    addScratch(5);
  };

  return (
    <main className="stable-wedding">
      <style>{`
        .stable-wedding{min-height:100dvh;background:radial-gradient(circle at 50% 35%,#fffdf8 0,#f2e7d5 58%,#dfcfb4 100%);color:#302923;font-family:Arial,sans-serif;overflow:hidden;position:relative}
        .stable-noise{position:absolute;inset:0;pointer-events:none;opacity:.08;background-image:radial-gradient(#765f40 .7px,transparent .8px);background-size:7px 7px}
        .stable-stage{min-height:100dvh;display:grid;place-items:center;padding:24px;position:relative}
        .stable-arch{width:min(88vw,680px);height:min(86vh,780px);position:relative;border:1px solid #c8aa72;border-radius:340px 340px 24px 24px;background:#eadcc5;box-shadow:0 30px 80px #5a432522,inset 0 0 0 8px #fffaf055;overflow:hidden}
        .stable-arch:before{content:"";position:absolute;inset:18px;border:1px solid #c8aa72;border-radius:320px 320px 18px 18px;pointer-events:none;z-index:10}
        .stable-photo{position:absolute;inset:14% 14% 10%;display:grid;place-items:center;background:radial-gradient(circle,#fffaf0,#d8c3a0);text-align:center}
        .stable-monogram{font:600 clamp(58px,10vw,100px)/1 Georgia,serif;color:#9a7845;letter-spacing:-6px}
        .stable-monogram em{font-size:.6em;color:#b7955d;font-style:normal}
        .stable-photo small{display:block;margin-top:16px;font-size:9px;letter-spacing:4px;color:#876c43}
        .stable-door{position:absolute;top:0;width:50%;height:100%;z-index:5;background:linear-gradient(90deg,#d7bf94,#f7efe2 48%,#dec59a);transition:transform 1.45s cubic-bezier(.76,0,.18,1)}
        .stable-left{left:0;transform-origin:left}.stable-right{right:0;transform-origin:right}
        .stable-door:after{content:"";position:absolute;inset:11% 10%;border:1px solid #b89458;border-radius:260px 260px 10px 10px;box-shadow:inset 0 0 0 8px #fff8e922}
        .stable-left .stable-handle{right:9px}.stable-right .stable-handle{left:9px}
        .stable-handle{position:absolute;top:50%;color:#a17d48;font-size:22px}
        .stable-open .stable-left{transform:translateX(-101%)}.stable-open .stable-right{transform:translateX(101%)}
        .stable-scratch{position:absolute;z-index:7;inset:37% 27% 31%;display:grid;place-items:center;cursor:crosshair;border:1px solid #b89458;background:linear-gradient(135deg,#e8d7b7,#c8aa72);color:#fff;transition:opacity .5s}
        .stable-scratch strong{font:600 12px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;text-align:center;text-shadow:0 1px 3px #59401e66}
        .stable-scratch small{font-size:9px;letter-spacing:1px;opacity:.9}
        .stable-progress{position:absolute;left:15%;right:15%;bottom:14%;height:3px;background:#ffffff66}.stable-progress span{display:block;height:100%;background:#fff;transition:width .15s}
        .stable-copy{position:absolute;z-index:20;text-align:center;bottom:8%;left:10%;right:10%;font-family:Georgia,serif;color:#59452f}
        .stable-copy b{display:block;font-size:28px;font-weight:500}.stable-copy small{letter-spacing:4px;font:10px Arial,sans-serif}
        .stable-content{width:min(900px,94vw);text-align:center;background:#fffaf2e8;border:1px solid #d4c09c;padding:clamp(34px,7vw,72px);box-shadow:0 30px 80px #5a43251f}
        .stable-content h1{font:500 clamp(52px,8vw,96px)/.9 Georgia,serif;margin:10px 0 20px}.stable-content h1 em{color:#b18c52;font-style:italic}
        .stable-content p{color:#766756;line-height:1.7}.stable-eyebrow{font:10px Arial,sans-serif;letter-spacing:4px;text-transform:uppercase;color:#a17d48}
        .stable-button{border:1px solid #b18c52;background:#b18c52;color:#fff;padding:14px 22px;border-radius:999px;margin-top:22px;cursor:pointer}
        .stable-fields{max-width:520px;margin:28px auto 0;text-align:left}.stable-fields label{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7359}.stable-fields input{width:100%;margin-top:8px;padding:15px;border:1px solid #d4c09c;background:#fff;border-radius:4px;outline:none}
        .stable-transition{position:fixed;z-index:100;inset:0;pointer-events:none;display:flex}.stable-transition div{width:50%;height:100%;background:linear-gradient(90deg,#d7bf94,#f7efe2,#dec59a);transition:transform .85s cubic-bezier(.76,0,.18,1)}.stable-transition .l{transform:translateX(-101%)}.stable-transition .r{transform:translateX(101%)}.stable-transition.closed .l,.stable-transition.closed .r{transform:translateX(0)}
        @media(max-width:600px){.stable-arch{width:94vw;height:78vh}.stable-scratch{inset:36% 22% 31%}.stable-copy b{font-size:24px}}
      `}</style>

      <div className="stable-noise" />

      <div className={`stable-transition ${closing ? 'closed' : ''}`} aria-hidden="true">
        <div className="l" /><div className="r" />
      </div>

      {stage === 'door' && (
        <section className={`stable-stage ${open ? 'stable-open' : ''}`}>
          <div className="stable-arch">
            <div className="stable-photo">
              <div>
                <div className="stable-monogram">J <em>&amp;</em> S</div>
                <small>JHAU &amp; SHEILA · OUR SPECIAL DAY</small>
              </div>
            </div>
            <div className="stable-door stable-left"><span className="stable-handle">◈</span></div>
            <div className="stable-door stable-right"><span className="stable-handle">◈</span></div>
            {!open && (
              <div className="stable-scratch" onPointerMove={scratch} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); addScratch(8); }}>
                <div>
                  <strong>Scratch the center</strong><br />
                  <small>Reveal Jhau &amp; Sheila to open the doors</small>
                </div>
                <div className="stable-progress"><span style={{width: `${scratched}%`}} /></div>
              </div>
            )}
            <div className="stable-copy"><b>Jhau &amp; Sheila</b><small>DECEMBER 27, 2026</small></div>
          </div>
        </section>
      )}

      {stage === 'welcome' && (
        <section className="stable-stage">
          <div className="stable-content">
            <div className="stable-eyebrow">The doors are open</div>
            <h1>Jhau <em>&amp;</em> Sheila</h1>
            <p>Welcome to the beginning of our forever.</p>
            <div className="stable-eyebrow">27 · 12 · 2026</div>
            <button className="stable-button" onClick={() => transitionTo('details')}>Enter our invitation →</button>
          </div>
        </section>
      )}

      {stage === 'details' && (
        <section className="stable-stage">
          <div className="stable-content">
            <div className="stable-eyebrow">The celebration</div>
            <h1>Join us <em>on our day.</em></h1>
            <p>Wedding Ceremony · Ceremony Location</p>
            <p>Wedding Reception · Reception Venue Location</p>
            <button className="stable-button" onClick={() => transitionTo('guest')}>Continue →</button>
          </div>
        </section>
      )}

      {stage === 'guest' && (
        <section className="stable-stage">
          <div className="stable-content">
            <div className="stable-eyebrow">A personal invitation</div>
            <h1>May we know <em>who we're welcoming?</em></h1>
            <p>Enter your name and we’ll make this invitation personal.</p>
            <div className="stable-fields">
              <label htmlFor="guest-name">Your name</label>
              <input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" />
            </div>
            <button className="stable-button" onClick={() => alert(name ? `Welcome, ${name}!` : 'Please enter your name.')}>Continue →</button>
          </div>
        </section>
      )}
    </main>
  );
}
