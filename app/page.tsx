'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

type Stage = 'door' | 'welcome' | 'details' | 'guest';

export default function Home() {
  const [stage, setStage] = useState<Stage>('door');
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchedRef = useRef(0);
  const openedRef = useRef(false);

  const go = (next: Stage) => {
    if (closing || stage === next) return;
    setClosing(true);
    setOpen(false);
    window.setTimeout(() => {
      setStage(next);
      window.setTimeout(() => setClosing(false), 850);
    }, 900);
  };

  const finishScratch = () => {
    if (openedRef.current) return;
    openedRef.current = true;
    setOpen(true);
  };

  useEffect(() => {
    if (!open || stage !== 'door' || closing) return;
    const t = window.setTimeout(() => go('welcome'), 2500);
    return () => window.clearTimeout(t);
  }, [open, stage, closing]);

  useEffect(() => {
    if (stage !== 'door') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = Math.min(96, Math.max(76, window.innerWidth * 0.19));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const g = ctx.createRadialGradient(size * .32, size * .25, 2, size * .5, size * .5, size * .62);
    g.addColorStop(0, '#f4e5c7');
    g.addColorStop(.55, '#c49b62');
    g.addColorStop(1, '#9b713d');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255,248,231,.92)';
    ctx.font = '600 7px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH', size / 2, size / 2 - 5);
    ctx.fillText('TO REVEAL', size / 2, size / 2 + 6);

    scratchedRef.current = 0;
    openedRef.current = false;
  }, [stage]);

  const scratch = (event: PointerEvent<HTMLCanvasElement>) => {
    if (open || closing || openedRef.current) return;

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dpr = canvas.width / rect.width;
    const px = x * dpr;
    const py = y * dpr;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(px, py, 13 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    scratchedRef.current += 2.7;

    if (scratchedRef.current >= 100) finishScratch();
  };

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    scratch(event);
  };

  return (
    <main className="site">
      <style>{`
        *{box-sizing:border-box}
        html,body{margin:0;padding:0}
        body{background:#f4eee5}
        button,input{font:inherit}
        .site{min-height:100dvh;overflow:hidden;color:#4a382b;background:#f4eee5}
        .door-stage{min-height:100dvh}
        .entrance{position:relative;width:100%;height:100dvh;overflow:hidden;background:#eadcc8}
        .door-photo{position:absolute;inset:0;background:url("/door.webp") center/cover no-repeat}
        .couple-reveal{position:absolute;inset:0;z-index:1;background:url("/couple-photo.png") center/cover no-repeat;opacity:0;transition:opacity .7s ease}
        .entrance.open .couple-reveal{opacity:1}
        .door-half{position:absolute;top:0;width:50%;height:100%;z-index:5;background-image:url("/door.webp");background-size:200% 100%;background-repeat:no-repeat;transition:transform 1.8s cubic-bezier(.76,0,.16,1)}
        .door-half.left{left:0;background-position:left center;transform-origin:left}
        .door-half.right{right:0;background-position:right center;transform-origin:right}
        .entrance.open .door-half.left{transform:translateX(-101%)}
        .entrance.open .door-half.right{transform:translateX(101%)}
        .shade{position:absolute;inset:0;z-index:6;background:linear-gradient(180deg,#2d21140a,#2d211425);pointer-events:none}
        .top-mark{position:absolute;z-index:15;top:5%;left:50%;transform:translateX(-50%);text-align:center;color:#fff9ef;text-shadow:0 2px 10px #4c321e80;letter-spacing:4px;font:10px Arial,sans-serif;white-space:nowrap}
        .top-mark strong{display:block;font:500 20px Georgia,serif;letter-spacing:7px;margin-bottom:5px}
        .scratch-wrap{position:absolute;z-index:30;left:50%;top:76%;transform:translate(-50%,-50%);width:110px;height:110px;display:grid;place-items:center}
        .scratch-photo{position:absolute;width:96px;height:96px;border-radius:50%;background:url("/couple-photo.png") center/cover no-repeat;border:1px solid #c19a60;box-shadow:0 12px 35px #38231355}
        .scratch-canvas{position:absolute;border-radius:50%;cursor:crosshair;touch-action:none;box-shadow:inset 0 0 0 5px #fffaf0aa,0 0 0 1px #c19a60;z-index:2}
        .scratch-ring{position:absolute;width:106px;height:106px;border:1px solid #fff8e3cc;border-radius:50%;pointer-events:none;z-index:3}
        .scratch-label{position:absolute;z-index:31;top:calc(76% + 63px);left:50%;transform:translateX(-50%);color:white;text-shadow:0 2px 8px #392312;letter-spacing:3px;font:9px Arial,sans-serif;text-transform:uppercase;white-space:nowrap}
        .transition{position:fixed;z-index:100;inset:0;display:flex;pointer-events:none}
        .transition div{width:50%;height:100%;background:linear-gradient(100deg,#eadbc6,#fffaf1 52%,#e2c99d);transition:transform .9s cubic-bezier(.76,0,.16,1)}
        .transition .l,.transition .r{transform:translateX(-101%)}
        .transition .r{transform:translateX(101%)}
        .transition.closed .l,.transition.closed .r{transform:translateX(0)}
        .page{min-height:100dvh;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 50% 20%,#fffdf8,#f2e8d8 70%,#e0cda9)}
        .invitation{position:relative;width:min(1000px,94vw);min-height:min(760px,88dvh);display:grid;place-items:center;text-align:center;padding:70px 7%;background:#fffaf1;border:1px solid #b9955e;box-shadow:0 30px 90px #513a2222}
        .invitation:before{content:"";position:absolute;inset:14px;border:1px solid #d7bd91;pointer-events:none}
        .eyebrow{font:9px Arial,sans-serif;letter-spacing:5px;text-transform:uppercase;color:#947044}
        h1{font:500 clamp(52px,8vw,100px)/.9 Georgia,serif;color:#4e3a2c;margin:17px 0}
        h1 em{font-style:italic;color:#ae8650}
        .copy{max-width:650px;color:#776454;line-height:1.9;margin:0 auto}
        .date{margin-top:25px;font:11px Arial,sans-serif;letter-spacing:6px;color:#957144}
        .button{margin-top:30px;border:1px solid #ae8750;border-radius:999px;background:#ae8750;color:white;padding:13px 25px;cursor:pointer;font-size:11px;letter-spacing:1px}
        .details{display:grid;grid-template-columns:1fr 1fr;gap:18px;width:min(760px,100%);margin:30px auto}
        .detail{padding:27px 18px;border:1px solid #d9c19a;background:#fffdf8}
        .detail h2{font:500 25px Georgia,serif;color:#57402f;margin:8px}
        .detail p{font-size:12px;color:#776454;margin:6px}
        .field{width:min(480px,100%);text-align:left;margin:25px auto}
        .field label{display:block;font:9px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#876846}
        .field input{width:100%;margin-top:8px;padding:14px;border:1px solid #ccb38a;background:white;outline:none;color:#4b392c}
        @media(max-width:700px){
          .top-mark strong{font-size:15px}
          .scratch-wrap{top:75%}
          .scratch-label{top:calc(75% + 59px)}
          .details{grid-template-columns:1fr}
          .invitation{min-height:82dvh;padding:55px 25px}
        }
      `}</style>

      <div className={`transition ${closing?'closed':''}`} aria-hidden="true"><div className="l"/><div className="r"/></div>

      {stage==='door'&&(
        <section className="door-stage">
          <div className={`entrance ${open?'open':''}`}>
            <div className="door-photo"/>
            <div className="couple-reveal"/>
            <div className="door-half left"/>
            <div className="door-half right"/>
            <div className="shade"/>
            <div className="top-mark"><strong>JHAU &amp; SHEILA</strong>DECEMBER 27 · 2026</div>

            {!open&&(
              <>
                <div className="scratch-wrap">
                  <div className="scratch-photo"/>
                  <canvas ref={canvasRef} className="scratch-canvas" aria-label="Scratch to reveal our photo" onPointerDown={pointerDown} onPointerMove={scratch}/>
                  <div className="scratch-ring"/>
                </div>
                <div className="scratch-label">Scratch to reveal</div>
              </>
            )}
          </div>
        </section>
      )}

      {stage==='welcome'&&(
        <section className="page"><div className="invitation"><div>
          <div className="eyebrow">Together with our families</div>
          <h1>Jhau <em>&amp;</em> Sheila</h1>
          <p className="copy">We invite you to witness the beginning of our forever and celebrate a day filled with love, family, and beautiful memories.</p>
          <div className="date">DECEMBER 27 · 2026</div>
          <button className="button" onClick={()=>go('details')}>Continue to our invitation →</button>
        </div></div></section>
      )}

      {stage==='details'&&(
        <section className="page"><div className="invitation"><div>
          <div className="eyebrow">The celebration</div>
          <h1>Our <em>day</em></h1>
          <div className="details">
            <div className="detail"><div className="eyebrow">Ceremony</div><h2>Wedding Ceremony</h2><p>December 27, 2026</p><p>Ceremony Location</p></div>
            <div className="detail"><div className="eyebrow">Reception</div><h2>Wedding Reception</h2><p>Following the ceremony</p><p>Reception Venue Location</p></div>
          </div>
          <button className="button" onClick={()=>go('guest')}>Continue →</button>
        </div></div></section>
      )}

      {stage==='guest'&&(
        <section className="page"><div className="invitation"><div>
          <div className="eyebrow">A personal invitation</div>
          <h1>Welcome, <em>dear guest.</em></h1>
          <p className="copy">Tell us your name so we can make your invitation personal.</p>
          <div className="field"><label htmlFor="guest-name">Your name</label><input id="guest-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Juan Dela Cruz"/></div>
          <button className="button" onClick={()=>alert(name?`Welcome, ${name}!`:'Please enter your name.')}>Continue →</button>
        </div></div></section>
      )}
    </main>
  );
}
