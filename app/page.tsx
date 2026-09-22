'use client';

import { useEffect, useState } from 'react';
import type { PointerEvent } from 'react';

type Stage = 'door' | 'welcome' | 'details' | 'guest';

export default function Home() {
  const [stage,setStage]=useState<Stage>('door');
  const [reveal,setReveal]=useState(0);
  const [open,setOpen]=useState(false);
  const [closing,setClosing]=useState(false);
  const [name,setName]=useState('');

  const go=(next:Stage)=>{
    if(closing||stage===next)return;
    setClosing(true);
    setOpen(false);
    window.setTimeout(()=>{setStage(next);window.setTimeout(()=>setClosing(false),800)},900);
  };

  useEffect(()=>{
    if(!open||stage!=='door'||closing)return;
    const t=window.setTimeout(()=>go('welcome'),1400);
    return()=>window.clearTimeout(t);
  },[open,stage,closing]);

  const scratch=(amount:number)=>{
    if(open||closing)return;
    setReveal(v=>{
      const n=Math.min(100,v+amount);
      if(n>=100)setOpen(true);
      return n;
    });
  };

  const pointerScratch=(e:PointerEvent<HTMLButtonElement>)=>{
    if(open||closing)return;
    if(e.pointerType!=='touch'&&e.buttons!==1)return;
    scratch(4);
  };

  return <main className="site">
    <style>{`
      *{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#f4eee5}button,input{font:inherit}
      .site{min-height:100dvh;overflow:hidden;color:#4a382b;background:#f4eee5}
      .door-stage{min-height:100dvh;display:grid;place-items:center;padding:0}
      .entrance{position:relative;width:100%;height:100dvh;overflow:hidden;background:#eadcc8}
      .door-photo{position:absolute;inset:0;background:url("/door.webp") center/cover no-repeat}
      .couple-reveal{position:absolute;inset:0;background:url("/couple-photo.webp") center/cover no-repeat;transform:scale(1.02)}
      .door-half{position:absolute;top:0;width:50%;height:100%;z-index:5;background-image:url("/door.webp");background-size:200% 100%;background-repeat:no-repeat;transition:transform 1.7s cubic-bezier(.76,0,.16,1)}
      .door-half.left{left:0;background-position:left center;transform-origin:left}
      .door-half.right{right:0;background-position:right center;transform-origin:right}
      .entrance.open .door-half.left{transform:translateX(-101%)}
      .entrance.open .door-half.right{transform:translateX(101%)}
      .shade{position:absolute;inset:0;z-index:6;background:linear-gradient(180deg,#2d21140a,#2d211425)}
      .top-mark{position:absolute;z-index:15;top:5%;left:50%;transform:translateX(-50%);text-align:center;color:#fff9ef;text-shadow:0 2px 10px #4c321e80;letter-spacing:4px;font:10px Arial,sans-serif;white-space:nowrap}
      .top-mark strong{display:block;font:500 20px Georgia,serif;letter-spacing:7px;margin-bottom:5px}
      .scratch{position:absolute;z-index:25;left:50%;top:77%;width:92px;height:92px;transform:translate(-50%,-50%);padding:0;border-radius:50%;border:1px solid #c19a60;overflow:hidden;cursor:pointer;touch-action:none;box-shadow:0 12px 35px #38231355,inset 0 0 0 5px #fffaf0aa}
      .scratch-photo{position:absolute;inset:0;background:url("/couple-photo.webp") center/cover no-repeat;clip-path:circle(calc(7% + ${reveal*.93}%) at 50% 50%);transition:clip-path .12s linear}
      .scratch-cover{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 35% 25%,#f0dfc0,#ad8045);opacity:${Math.max(0,1-reveal/100*.97)};transition:opacity .2s}
      .scratch-cover span{color:white;font:600 7px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;text-shadow:0 1px 4px #4b3018}
      .scratch-ring{position:absolute;inset:6px;border:1px dashed #fff8e3bb;border-radius:50%;pointer-events:none}
      .scratch-label{position:absolute;z-index:26;top:calc(77% + 59px);left:50%;transform:translateX(-50%);color:white;text-shadow:0 2px 8px #392312;letter-spacing:3px;font:9px Arial,sans-serif;text-transform:uppercase;white-space:nowrap}
      .transition{position:fixed;z-index:100;inset:0;display:flex;pointer-events:none}.transition div{width:50%;height:100%;background:linear-gradient(100deg,#eadbc6,#fffaf1 52%,#e2c99d);transition:transform .9s cubic-bezier(.76,0,.16,1)}.transition .l{transform:translateX(-101%)}.transition .r{transform:translateX(101%)}.transition.closed .l,.transition.closed .r{transform:translateX(0)}
      .page{min-height:100dvh;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 50% 20%,#fffdf8,#f2e8d8 70%,#e0cda9)}
      .invitation{position:relative;width:min(1000px,94vw);min-height:min(760px,88dvh);display:grid;place-items:center;text-align:center;padding:70px 7%;background:#fffaf1;border:1px solid #b9955e;box-shadow:0 30px 90px #513a2222}
      .invitation:before{content:"";position:absolute;inset:14px;border:1px solid #d7bd91;pointer-events:none}
      .eyebrow{font:9px Arial,sans-serif;letter-spacing:5px;text-transform:uppercase;color:#947044}
      h1{font:500 clamp(52px,8vw,100px)/.9 Georgia,serif;color:#4e3a2c;margin:17px 0}h1 em{font-style:italic;color:#ae8650}
      .copy{max-width:650px;color:#776454;line-height:1.9;margin:0 auto}.date{margin-top:25px;font:11px Arial,sans-serif;letter-spacing:6px;color:#957144}
      .button{margin-top:30px;border:1px solid #ae8750;border-radius:999px;background:#ae8750;color:white;padding:13px 25px;cursor:pointer;font-size:11px;letter-spacing:1px}
      .details{display:grid;grid-template-columns:1fr 1fr;gap:18px;width:min(760px,100%);margin:30px auto}.detail{padding:27px 18px;border:1px solid #d9c19a;background:#fffdf8}.detail h2{font:500 25px Georgia,serif;color:#57402f;margin:8px}.detail p{font-size:12px;color:#776454;margin:6px}
      .field{width:min(480px,100%);text-align:left;margin:25px auto}.field label{display:block;font:9px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#876846}.field input{width:100%;margin-top:8px;padding:14px;border:1px solid #ccb38a;background:white;outline:none;color:#4b392c}
      @media(max-width:700px){.top-mark strong{font-size:15px}.scratch{width:78px;height:78px;top:75%}.scratch-label{top:calc(75% + 50px)}.details{grid-template-columns:1fr}.invitation{min-height:82dvh;padding:55px 25px}}
    `}</style>

    <div className={`transition ${closing?'closed':''}`} aria-hidden="true"><div className="l"/><div className="r"/></div>

    {stage==='door'&&<section className="door-stage">
      <div className={`entrance ${open?'open':''}`}>
        <div className="door-photo"/>
        <div className="couple-reveal"/>
        <div className="door-half left"/>
        <div className="door-half right"/>
        <div className="shade"/>
        <div className="top-mark"><strong>JHAU &amp; SHEILA</strong>DECEMBER 27 · 2026</div>
        {!open&&<>
          <button className="scratch" aria-label="Scratch to reveal our photo" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);scratch(12)}} onPointerMove={pointerScratch}>
            <span className="scratch-photo"/><span className="scratch-cover"><span>Scratch<br/>to reveal</span></span><span className="scratch-ring"/>
          </button>
          <div className="scratch-label">Scratch the circle to open</div>
        </>}
      </div>
    </section>}

    {stage==='welcome'&&<section className="page"><div className="invitation"><div><div className="eyebrow">Together with our families</div><h1>Jhau <em>&amp;</em> Sheila</h1><p className="copy">We invite you to witness the beginning of our forever and celebrate a day filled with love, family, and beautiful memories.</p><div className="date">DECEMBER 27 · 2026</div><button className="button" onClick={()=>go('details')}>Continue to our invitation →</button></div></div></section>}

    {stage==='details'&&<section className="page"><div className="invitation"><div><div className="eyebrow">The celebration</div><h1>Our <em>day</em></h1><div className="details"><div className="detail"><div className="eyebrow">Ceremony</div><h2>Wedding Ceremony</h2><p>December 27, 2026</p><p>Ceremony Location</p></div><div className="detail"><div className="eyebrow">Reception</div><h2>Wedding Reception</h2><p>Following the ceremony</p><p>Reception Venue Location</p></div></div><button className="button" onClick={()=>go('guest')}>Continue →</button></div></div></section>}

    {stage==='guest'&&<section className="page"><div className="invitation"><div><div className="eyebrow">A personal invitation</div><h1>Welcome, <em>dear guest.</em></h1><p className="copy">Tell us your name so we can make your invitation personal.</p><div className="field"><label htmlFor="guest-name">Your name</label><input id="guest-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Juan Dela Cruz"/></div><button className="button" onClick={()=>alert(name?`Welcome, ${name}!`:'Please enter your name.')}>Continue →</button></div></div></section>}
  </main>;
}
