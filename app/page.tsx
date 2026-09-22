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

  const transitionTo = (next: Stage) => {
    if (closing || stage === next) return;
    setClosing(true);
    setOpen(false);
    window.setTimeout(() => {
      setStage(next);
      window.setTimeout(() => setClosing(false), 800);
    }, 900);
  };

  useEffect(() => {
    if (!open || stage !== 'door' || closing) return;
    const t = window.setTimeout(() => transitionTo('welcome'), 1100);
    return () => window.clearTimeout(t);
  }, [open, stage, closing]);

  const reveal = (amount = 8) => {
    if (open || closing) return;
    setScratched(v => {
      const next = Math.min(100, v + amount);
      if (next >= 100) setOpen(true);
      return next;
    });
  };

  const scratch = (e: PointerEvent<HTMLButtonElement>) => {
    if (open || closing) return;
    if (e.pointerType !== 'touch' && e.buttons !== 1) return;
    reveal(4);
  };

  return (
    <main className="wedding">
      <style>{`
        *{box-sizing:border-box}
        .wedding{min-height:100dvh;overflow:hidden;position:relative;background:#f5ede1;color:#44352a;font-family:Arial,sans-serif}
        .paper{position:absolute;inset:0;opacity:.35;pointer-events:none;background-image:radial-gradient(#9b7a4a33 .7px,transparent .8px);background-size:8px 8px}
        .stage{min-height:100dvh;display:grid;place-items:center;padding:20px}
        .scene{width:min(1180px,100%);height:min(94dvh,900px);position:relative;display:grid;place-items:center}
        .glow{position:absolute;inset:4%;border-radius:48% 48% 18px 18px;background:radial-gradient(circle at 50% 40%,#fffdf8,#efe0ca 58%,#d4ba8c);box-shadow:0 35px 100px #60472c25}
        .arch{position:absolute;inset:4% 14%;border:2px solid #b89458;border-radius:50% 50% 16px 16px/34% 34% 16px 16px;background:#ead8b9;box-shadow:inset 0 0 0 9px #fff9ee66,0 0 0 8px #d7bc8b55;overflow:hidden}
        .archin{position:absolute;inset:15px;border:1px solid #c7a56b;border-radius:50% 50% 10px 10px/34% 34% 10px 10px;overflow:hidden;background:#f7eee2}
        .back{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,#fffdf9,#ead7ba)}
        .back img{width:min(43%,350px);aspect-ratio:3/4;object-fit:cover;border-radius:50% 50% 14px 14px;border:6px solid #fffaf1;box-shadow:0 20px 50px #52361f30}
        .door{position:absolute;top:0;width:50%;height:100%;z-index:5;background:linear-gradient(95deg,#d5ba88,#f8f0e4 45%,#e5cca2);transition:transform 1.55s cubic-bezier(.76,0,.18,1);box-shadow:inset 0 0 0 1px #ad8248}
        .door-left{left:0;transform-origin:left}.door-right{right:0;transform-origin:right}
        .door:before{content:"";position:absolute;inset:5% 8% 12%;border:1px solid #b58d52;border-radius:48% 48% 8px 8px/29% 29% 8px 8px;box-shadow:inset 0 0 0 7px #fff9ed55}
        .door:after{content:"❧   ❀   ❧";position:absolute;top:24%;left:50%;transform:translateX(-50%);font:26px Georgia,serif;letter-spacing:9px;color:#b08a52;white-space:nowrap}
        .panel{position:absolute;inset:17% 17% 25%;border:1px solid #c09a5d;border-radius:40% 40% 8px 8px/24% 24% 8px 8px;box-shadow:inset 0 0 0 5px #fff8e933}
        .handle{position:absolute;top:51%;width:20px;height:66px;border:2px solid #9e7540;border-radius:14px;background:linear-gradient(#d8b36e,#896232);z-index:8}
        .door-left .handle{right:7px}.door-right .handle{left:7px}
        .open .door-left{transform:translateX(-101%)}.open .door-right{transform:translateX(101%)}
        .flowers{position:absolute;z-index:9;top:2%;bottom:4%;width:25%;pointer-events:none;color:#6b7658}
        .flowers.left{left:0}.flowers.right{right:0;transform:scaleX(-1)}
        .flowers:before{content:"✿  ❀  ❁  ✦";position:absolute;top:2%;left:0;font-size:clamp(28px,4vw,58px);transform:rotate(-15deg);text-shadow:0 8px 20px #49351e22}
        .flowers:after{content:"❀  ✿  ❁";position:absolute;bottom:4%;left:-4%;font-size:clamp(30px,4vw,62px);transform:rotate(13deg)}
        .lantern{position:absolute;z-index:10;top:29%;width:40px;height:72px;border:2px solid #9b7441;border-radius:11px;background:#fff9e844;box-shadow:0 0 28px #e9b85c66}
        .lantern.left{left:12%}.lantern.right{right:12%}
        .lantern:after{content:"";position:absolute;inset:13px 7px;background:#ffe2a766;border-radius:8px;box-shadow:0 0 22px #f1c66f}
        .ornament{position:absolute;z-index:12;top:4%;left:50%;transform:translateX(-50%);font:16px Georgia,serif;letter-spacing:6px;color:#9e7848;white-space:nowrap}
        .plaque{position:absolute;z-index:12;bottom:6%;left:50%;transform:translateX(-50%);text-align:center;white-space:nowrap;color:#6c543a}
        .plaque strong{display:block;font:500 clamp(28px,4.5vw,52px)/1 Georgia,serif}.plaque small{font-size:9px;letter-spacing:5px;color:#987648}
        .scratch{position:absolute;z-index:20;left:50%;top:54%;transform:translate(-50%,-50%);width:clamp(94px,13vw,140px);height:clamp(94px,13vw,140px);border-radius:50%;border:1px solid #c19d63;overflow:hidden;cursor:pointer;touch-action:none;background:#d4bd92;box-shadow:0 12px 35px #51351e30,inset 0 0 0 7px #fff8eb99}
        .photo{position:absolute;inset:0;background:url('/couple-photo.png') center/cover;clip-path:circle(calc(12% + ${scratched * 0.88}%) at 50% 50%);transition:clip-path .15s linear}
        .veil{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#f7ecd6,#c7a66d);opacity:${Math.max(0,1-scratched/100*.94)};transition:opacity .2s}
        .veil span{font:600 8px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:white;text-align:center;text-shadow:0 1px 3px #59401e}
        .ring{position:absolute;inset:7px;border:1px dashed #fff8e2aa;border-radius:50%;pointer-events:none}
        .hint{position:absolute;z-index:21;top:calc(54% + 78px);left:50%;transform:translateX(-50%);font:9px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#7e603b;white-space:nowrap}
        .pct{position:absolute;z-index:21;top:calc(54% + 96px);left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:1px;color:#a27c49}
        .transition{position:fixed;z-index:100;inset:0;display:flex;pointer-events:none}.transition div{width:50%;height:100%;background:linear-gradient(95deg,#d5ba88,#f8f0e4 45%,#e5cca2);transition:transform .9s cubic-bezier(.76,0,.18,1)}.transition .l{transform:translateX(-101%)}.transition .r{transform:translateX(101%)}.transition.closed .l,.transition.closed .r{transform:translateX(0)}
        .card{width:min(960px,94vw);min-height:min(720px,88dvh);position:relative;display:grid;place-items:center;text-align:center;padding:clamp(44px,8vw,90px);background:#fbf6ed;border:1px solid #c9aa72;box-shadow:0 35px 100px #5c422521}.card:before{content:"";position:absolute;inset:14px;border:1px solid #d8bf93;pointer-events:none}.card:after{content:"❦";position:absolute;top:23px;left:50%;transform:translateX(-50%);font:28px Georgia,serif;color:#b08b52}
        .eyebrow{font:10px Arial,sans-serif;letter-spacing:5px;text-transform:uppercase;color:#997647}.card h1{font:500 clamp(54px,9vw,108px)/.86 Georgia,serif;margin:16px 0;color:#49382c}.card h1 em{font-style:italic;color:#b08c52}.card p{max-width:620px;margin:14px auto;color:#776656;line-height:1.8}.date{font:12px Arial,sans-serif;letter-spacing:6px;color:#967347;margin-top:25px}.btn{margin-top:28px;border:1px solid #b18b53;background:#b18b53;color:white;padding:14px 25px;border-radius:999px;font-size:12px;letter-spacing:1px;cursor:pointer}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;width:min(760px,100%);margin:30px auto}.detail{padding:26px 18px;border:1px solid #d7bf96;background:#fffaf3}.detail h3{font:500 25px Georgia,serif;margin:8px 0;color:#55402f}.detail p{font-size:12px;margin:5px auto}
        .fields{width:min(480px,100%);margin:25px auto;text-align:left}.fields label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#876a49}.fields input{width:100%;margin-top:8px;padding:15px;border:1px solid #cdb58c;background:#fffdf9;outline:none;font:15px Arial;color:#3d3026}
        @media(max-width:700px){.scene{height:92dvh}.arch{inset:7% 5%}.flowers{width:29%}.lantern{width:30px;height:58px}.lantern.left{left:5%}.lantern.right{right:5%}.grid{grid-template-columns:1fr}.card{min-height:82dvh;padding:50px 28px}.back img{width:46%}.plaque strong{font-size:30px}}
      `}</style>

      <div className="paper" />
      <div className={`transition ${closing ? 'closed' : ''}`} aria-hidden="true"><div className="l"/><div className="r"/></div>

      {stage === 'door' && (
        <section className="stage">
          <div className={`scene ${open ? 'open' : ''}`}>
            <div className="glow"/>
            <div className="arch">
              <div className="archin">
                <div className="back"><img src="/couple-photo.png" alt="Jhau and Sheila"/></div>
                <div className="door door-left"><div className="panel"/><span className="handle"/></div>
                <div className="door door-right"><div className="panel"/><span className="handle"/></div>
              </div>
            </div>
            <div className="flowers left"/><div className="flowers right"/>
            <div className="lantern left"/><div className="lantern right"/>
            <div className="ornament">❦  JHAU &amp; SHEILA  ❦</div>
            {!open && <><button className="scratch" aria-label="Scratch to reveal our photo" onPointerMove={scratch} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);reveal(12)}}><span className="photo"/><span className="veil"><span>Scratch<br/>to reveal</span></span><span className="ring"/></button><div className="hint">Scratch the circle to open the doors</div><div className="pct">{Math.round(scratched)}%</div></>}
            <div className="plaque"><strong>Jhau &amp; Sheila</strong><small>DECEMBER 27, 2026</small></div>
          </div>
        </section>
      )}

      {stage === 'welcome' && <section className="stage"><div className="card"><div><div className="eyebrow">Together with our families</div><h1>Jhau <em>&amp;</em> Sheila</h1><p>We invite you to witness the beginning of our forever and celebrate a day filled with love, family, and beautiful memories.</p><div className="date">DECEMBER 27 · 2026</div><button className="btn" onClick={()=>transitionTo('details')}>Continue to our invitation →</button></div></div></section>}

      {stage === 'details' && <section className="stage"><div className="card"><div><div className="eyebrow">The celebration</div><h1>Our <em>day</em></h1><div className="grid"><div className="detail"><div className="eyebrow">Ceremony</div><h3>Wedding Ceremony</h3><p>December 27, 2026</p><p>Ceremony Location</p></div><div className="detail"><div className="eyebrow">Reception</div><h3>Wedding Reception</h3><p>Following the ceremony</p><p>Reception Venue Location</p></div></div><button className="btn" onClick={()=>transitionTo('guest')}>Continue →</button></div></div></section>}

      {stage === 'guest' && <section className="stage"><div className="card"><div><div className="eyebrow">A personal invitation</div><h1>Welcome, <em>dear guest.</em></h1><p>Tell us your name so we can make your invitation personal.</p><div className="fields"><label htmlFor="guest-name">Your name</label><input id="guest-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Juan Dela Cruz"/></div><button className="btn" onClick={()=>alert(name ? `Welcome, ${name}!` : 'Please enter your name.')}>Continue →</button></div></div></section>}
    </main>
  );
}
