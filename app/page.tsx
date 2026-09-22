'use client';

import { useEffect, useState } from 'react';
import type { PointerEvent } from 'react';

type Stage = 'door' | 'welcome' | 'details' | 'guest';

export default function Home() {
  const [stage, setStage] = useState<Stage>('door');
  const [reveal, setReveal] = useState(0);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState('');

  const nextStage = (next: Stage) => {
    if (closing || stage === next) return;
    setClosing(true);
    setOpen(false);
    window.setTimeout(() => {
      setStage(next);
      window.setTimeout(() => setClosing(false), 850);
    }, 900);
  };

  useEffect(() => {
    if (!open || stage !== 'door' || closing) return;
    const timer = window.setTimeout(() => nextStage('welcome'), 1250);
    return () => window.clearTimeout(timer);
  }, [open, stage, closing]);

  const scratch = (amount: number) => {
    if (open || closing) return;
    setReveal(current => {
      const value = Math.min(100, current + amount);
      if (value >= 100) setOpen(true);
      return value;
    });
  };

  const onScratch = (event: PointerEvent<HTMLButtonElement>) => {
    if (open || closing) return;
    if (event.pointerType !== 'touch' && event.buttons !== 1) return;
    scratch(4);
  };

  return (
    <main className="site">
      <style>{`
        *{box-sizing:border-box}
        html,body{margin:0;padding:0}
        body{background:#eee4d5}
        button,input{font:inherit}

        .site{min-height:100dvh;overflow:hidden;background:#f5eee3;color:#4d3b2e}
        .grain{position:fixed;inset:0;pointer-events:none;z-index:80;opacity:.2;background-image:radial-gradient(#7a5a3520 .7px,transparent .8px);background-size:9px 9px}

        .door-page{min-height:100dvh;display:grid;place-items:center;padding:14px}
        .entrance{position:relative;width:min(1500px,100%);height:min(96dvh,900px);overflow:hidden;background:
          radial-gradient(circle at 50% 38%,#fffaf0 0,#f3e4cd 43%,#d5bd94 100%);
          box-shadow:0 30px 90px #4d382326;border:1px solid #c9ad7d}

        .curtain{position:absolute;z-index:8;top:-5%;width:22%;height:110%;
          background:linear-gradient(90deg,#fffdf8 0,#eadbc6 48%,#fffaf1 100%);
          filter:drop-shadow(0 10px 20px #5b432425)}
        .curtain:before,.curtain:after{content:"";position:absolute;top:0;bottom:0;width:45%;
          background:repeating-linear-gradient(90deg,#fffaf2 0 14px,#eadac4 18px,#fffdf8 31px);opacity:.72}
        .curtain:before{left:0;transform:skewY(7deg)}
        .curtain:after{right:0;transform:skewY(-7deg)}
        .curtain.left{left:-5%;transform:rotate(3deg)}
        .curtain.right{right:-5%;transform:scaleX(-1) rotate(3deg)}

        .greenery{position:absolute;z-index:7;top:0;width:32%;height:100%;pointer-events:none}
        .greenery.left{left:0}.greenery.right{right:0;transform:scaleX(-1)}
        .greenery:before{content:"❀  ✿  ❁  ✿  ❀";position:absolute;left:1%;top:3%;
          color:#fffaf1;font:clamp(30px,4vw,62px) Georgia;letter-spacing:5px;text-shadow:0 8px 15px #3f332122}
        .greenery:after{content:"❀  ❁  ✿  ❀";position:absolute;left:0;bottom:4%;
          color:#fffaf1;font:clamp(34px,4.5vw,68px) Georgia;letter-spacing:3px;text-shadow:0 8px 15px #3f332122}
        .leaf-cluster{position:absolute;inset:0;background:
          radial-gradient(ellipse at 9% 18%,#647353 0 2%,transparent 2.4%),
          radial-gradient(ellipse at 17% 28%,#7c8b69 0 2.3%,transparent 2.7%),
          radial-gradient(ellipse at 8% 43%,#5d704e 0 2.5%,transparent 2.9%),
          radial-gradient(ellipse at 20% 67%,#7b8b67 0 2.4%,transparent 2.8%),
          radial-gradient(ellipse at 10% 80%,#607052 0 2.7%,transparent 3.1%);
          opacity:.85}

        .lantern{position:absolute;z-index:10;top:23%;width:44px;height:90px;border:2px solid #9b7542;
          border-radius:10px;background:#fff8e733;box-shadow:0 0 30px #e7b85c88}
        .lantern:before{content:"";position:absolute;left:50%;top:-18px;width:12px;height:18px;border:2px solid #9b7542;border-bottom:0;transform:translateX(-50%)}
        .lantern:after{content:"";position:absolute;inset:15px 8px;background:#ffe4a76e;border-radius:6px;box-shadow:0 0 24px #efbd5e}
        .lantern.left{left:18%}.lantern.right{right:18%}

        .arch{position:absolute;z-index:2;left:50%;top:5%;width:min(63%,850px);height:91%;transform:translateX(-50%);
          border:8px solid #efe1cb;border-bottom-width:5px;border-radius:48% 48% 8px 8px;
          box-shadow:0 0 0 2px #b9945a,0 0 0 15px #fffaf055,0 28px 55px #513a2322;
          background:#f9f0e2;overflow:hidden}
        .arch:before{content:"";position:absolute;inset:14px;border:2px solid #b99359;border-radius:47% 47% 5px 5px;box-shadow:inset 0 0 0 7px #fffaf055}
        .inside{position:absolute;inset:24px;background:#fff8ee;overflow:hidden}
        .couple{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,#fffdf8,#e8d5b8)}
        .couple img{width:43%;max-width:330px;aspect-ratio:3/4;object-fit:cover;border:7px solid #fffaf0;border-radius:48% 48% 12px 12px;box-shadow:0 20px 45px #4f382622}

        .door{position:absolute;z-index:5;top:0;width:50%;height:100%;
          background:linear-gradient(100deg,#eadbc6,#fffaf1 52%,#e2c99d);
          transition:transform 1.65s cubic-bezier(.76,0,.16,1);box-shadow:inset 0 0 0 1px #b99358}
        .door.left{left:0;transform-origin:left}
        .door.right{right:0;transform-origin:right}
        .open .door.left{transform:translateX(-101%)}
        .open .door.right{transform:translateX(101%)}
        .door:before{content:"";position:absolute;inset:7% 10% 23%;border:2px solid #b88e50;border-radius:48% 48% 5px 5px/29% 29% 5px 5px;box-shadow:inset 0 0 0 7px #fff8ea55}
        .door:after{content:"";position:absolute;inset:12% 17% 29%;border:1px solid #d1b17a;border-radius:45% 45% 5px 5px/25% 25% 5px 5px}
        .vine{position:absolute;top:15%;bottom:28%;width:30%;color:#a17c49;font:clamp(24px,3vw,42px) Georgia;line-height:1.8;text-align:center}
        .door.left .vine{right:16%}.door.right .vine{left:16%}
        .knob{position:absolute;top:48%;width:17px;height:65px;border:2px solid #98703a;border-radius:12px;background:linear-gradient(#e4c17d,#956a35);z-index:8}
        .door.left .knob{right:7px}.door.right .knob{left:7px}

        .brand{position:absolute;z-index:12;top:4%;left:50%;transform:translateX(-50%);white-space:nowrap;text-align:center;
          color:#8e6b3e;letter-spacing:4px;font:11px Arial,sans-serif}
        .brand strong{display:block;font:500 18px Georgia,serif;letter-spacing:7px;color:#705333;margin-bottom:5px}

        .scratch{position:absolute;z-index:20;left:50%;top:64%;width:92px;height:92px;transform:translate(-50%,-50%);
          border-radius:50%;border:1px solid #b58b50;background:#cbb17f;overflow:hidden;cursor:pointer;touch-action:none;
          box-shadow:0 10px 30px #4b351f35,inset 0 0 0 5px #fff8eaaa}
        .scratch-photo{position:absolute;inset:0;background:url("/couple-photo.png") center/cover;
          clip-path:circle(calc(8% + ${reveal * .92}%) at 50% 50%);transition:clip-path .14s linear}
        .scratch-cover{position:absolute;inset:0;display:grid;place-items:center;
          background:radial-gradient(circle at 35% 25%,#efe0c6,#b18a51);opacity:${1-reveal/100*.96};transition:opacity .2s}
        .scratch-cover span{font:600 7px Arial,sans-serif;letter-spacing:1.5px;color:white;text-transform:uppercase;text-align:center}
        .scratch-ring{position:absolute;inset:6px;border:1px dashed #fff8e0aa;border-radius:50%;pointer-events:none}
        .scratch-label{position:absolute;z-index:21;top:calc(64% + 58px);left:50%;transform:translateX(-50%);
          color:#8e6c43;font:9px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;white-space:nowrap}

        .transition{position:fixed;inset:0;z-index:100;display:flex;pointer-events:none}
        .transition div{width:50%;height:100%;background:linear-gradient(100deg,#eadbc6,#fffaf1 52%,#e2c99d);
          transition:transform .9s cubic-bezier(.76,0,.16,1)}
        .transition .l{transform:translateX(-101%)}.transition .r{transform:translateX(101%)}
        .transition.closed .l,.transition.closed .r{transform:translateX(0)}

        .page{min-height:100dvh;display:grid;place-items:center;padding:22px;background:
          radial-gradient(circle at 50% 20%,#fffdf8,#f2e8d8 70%,#e0cda9)}
        .invitation{position:relative;width:min(1000px,94vw);min-height:min(760px,88dvh);display:grid;place-items:center;text-align:center;
          padding:70px 7%;background:#fffaf1;border:1px solid #b9955e;box-shadow:0 30px 90px #513a2222}
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
          .entrance{height:94dvh}.arch{width:88%;top:7%;height:86%}.curtain{width:30%}.greenery{width:38%}
          .lantern{width:32px;height:65px}.lantern.left{left:8%}.lantern.right{right:8%}
          .brand strong{font-size:14px}.scratch{width:82px;height:82px}.scratch-label{top:calc(64% + 52px)}
          .details{grid-template-columns:1fr}.invitation{min-height:82dvh;padding:55px 25px}
        }
      `}</style>

      <div className="grain" />

      <div className={`transition ${closing ? 'closed' : ''}`} aria-hidden="true">
        <div className="l" /><div className="r" />
      </div>

      {stage === 'door' && (
        <section className="door-page">
          <div className={`entrance ${open ? 'open' : ''}`}>
            <div className="curtain left" /><div className="curtain right" />
            <div className="greenery left"><div className="leaf-cluster" /></div>
            <div className="greenery right"><div className="leaf-cluster" /></div>
            <div className="lantern left" /><div className="lantern right" />

            <div className="arch">
              <div className="inside">
                <div className="couple">
                  <img src="/couple-photo.png" alt="Jhau and Sheila" />
                </div>
                <div className="door left"><div className="vine">❧<br/>✿<br/>❁<br/>❧</div><span className="knob" /></div>
                <div className="door right"><div className="vine">❧<br/>✿<br/>❁<br/>❧</div><span className="knob" /></div>
              </div>
            </div>

            <div className="brand">
              <strong>JHAU &amp; SHEILA</strong>
              DECEMBER 27 · 2026
            </div>

            {!open && (
              <>
                <button className="scratch" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); scratch(12); }} onPointerMove={onScratch} aria-label="Scratch to reveal">
                  <span className="scratch-photo" />
                  <span className="scratch-cover"><span>Scratch<br/>to reveal</span></span>
                  <span className="scratch-ring" />
                </button>
                <div className="scratch-label">Scratch the circle to open</div>
              </>
            )}
          </div>
        </section>
      )}

      {stage === 'welcome' && (
        <section className="page"><div className="invitation"><div>
          <div className="eyebrow">Together with our families</div>
          <h1>Jhau <em>&amp;</em> Sheila</h1>
          <p className="copy">We invite you to witness the beginning of our forever and celebrate a day filled with love, family, and beautiful memories.</p>
          <div className="date">DECEMBER 27 · 2026</div>
          <button className="button" onClick={() => nextStage('details')}>Continue to our invitation →</button>
        </div></div></section>
      )}

      {stage === 'details' && (
        <section className="page"><div className="invitation"><div>
          <div className="eyebrow">The celebration</div>
          <h1>Our <em>day</em></h1>
          <div className="details">
            <div className="detail"><div className="eyebrow">Ceremony</div><h2>Wedding Ceremony</h2><p>December 27, 2026</p><p>Ceremony Location</p></div>
            <div className="detail"><div className="eyebrow">Reception</div><h2>Wedding Reception</h2><p>Following the ceremony</p><p>Reception Venue Location</p></div>
          </div>
          <button className="button" onClick={() => nextStage('guest')}>Continue →</button>
        </div></div></section>
      )}

      {stage === 'guest' && (
        <section className="page"><div className="invitation"><div>
          <div className="eyebrow">A personal invitation</div>
          <h1>Welcome, <em>dear guest.</em></h1>
          <p className="copy">Tell us your name so we can make your invitation personal.</p>
          <div className="field"><label htmlFor="guest-name">Your name</label><input id="guest-name" value={name} onChange={e => setName(e.target.value)} placeholder="Juan Dela Cruz" /></div>
          <button className="button" onClick={() => alert(name ? `Welcome, ${name}!` : 'Please enter your name.')}>Continue →</button>
        </div></div></section>
      )}
    </main>
  );
}
