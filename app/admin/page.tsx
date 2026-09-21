'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Palette, Save, Upload, X } from 'lucide-react';

type Theme={bg:string;accent:string;text:string;door:string;style:string};
const presets:Record<string,Theme>={
 classic:{bg:'#f3ecdf',accent:'#b99559',text:'#2d2722',door:'#e9dcc5',style:'classic'},
 garden:{bg:'#edf0e5',accent:'#7f966f',text:'#283027',door:'#dfe6d5',style:'garden'},
 modern:{bg:'#eeeef0',accent:'#6e6678',text:'#29272d',door:'#d8d7dd',style:'modern'}
};

export default function Admin(){
 const [theme,setTheme]=useState<Theme>(presets.classic);
 const [photo,setPhoto]=useState<string|null>(null);
 const [saved,setSaved]=useState(false);
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{const t=localStorage.getItem('jhau-wedding-theme');const p=localStorage.getItem('jhau-wedding-photo');if(t)setTheme(JSON.parse(t));if(p)setPhoto(p)}catch{}},[]);
 function upload(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){alert('Maximum photo size is 5MB.');return}const r=new FileReader();r.onload=()=>setPhoto(String(r.result));r.readAsDataURL(f)}
 function save(){localStorage.setItem('jhau-wedding-theme',JSON.stringify(theme));if(photo)localStorage.setItem('jhau-wedding-photo',photo);else localStorage.removeItem('jhau-wedding-photo');setSaved(true);setTimeout(()=>setSaved(false),1800)}
 return <main className="admin-page"><div className="admin-wrap"><a href="/" className="admin-back"><ArrowLeft size={17}/> Back to invitation</a><header><div><p className="eyebrow">Wedding invitation editor</p><h1>Jhau <em>&amp;</em> Sheila</h1><p>Change the look and couple photo without editing code.</p></div></header><div className="admin-layout"><section className="admin-panel"><div className="admin-block"><div className="admin-title"><Palette/><div><h2>Theme</h2><p>Choose a starting style or fine-tune the colors.</p></div></div><div className="preset-grid">{Object.entries(presets).map(([key,val])=><button key={key} className={theme.style===key?'preset active':'preset'} onClick={()=>setTheme(val)}><span style={{background:val.bg}}/><b>{key}</b><i style={{background:val.accent}}/></button>)}</div><div className="color-grid">{[['Background','bg'],['Accent','accent'],['Text','text'],['Door','door']].map(([label,key])=><label key={key}>{label}<input type="color" value={(theme as any)[key]} onChange={e=>setTheme({...theme,[key]:e.target.value})}/></label>)}</div></div><div className="admin-block"><div className="admin-title"><ImagePlus/><div><h2>Couple photo</h2><p>This photo appears behind the scratch-to-open door.</p></div></div><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}/>{photo?<div className="admin-photo"><img src={photo} alt="Couple"/><button onClick={()=>setPhoto(null)}><X size={15}/> Remove</button></div>:<button className="upload-photo" onClick={()=>input.current?.click()}><Upload size={22}/><b>Upload couple photo</b><span>JPG, PNG or WebP · up to 5MB</span></button>}{photo&&<button className="change-photo" onClick={()=>input.current?.click()}><Upload size={15}/> Change photo</button>}</div><button className="save-invitation" onClick={save}><Save size={18}/>{saved?'Saved!':'Save changes'}</button></section><aside className="admin-preview"><p className="preview-tag">LIVE PREVIEW</p><div className="preview-card" style={{background:theme.bg,borderColor:theme.accent}}><div className="preview-photo" style={{borderColor:theme.accent}}>{photo?<img src={photo} alt="Preview"/>:<span>J <i>&amp;</i> S</span>}</div><p style={{color:theme.accent}}>A LITTLE INVITATION</p><h2 style={{color:theme.text}}>Jhau <em>&amp;</em> Sheila</h2><small style={{color:theme.text}}>27 · 12 · 2026</small></div><div className="admin-note">For this first editor version, changes are saved in this browser. We can move the same editor to cloud storage next so your photo and theme are shared across all guest devices.</div></aside></div></div></main>
}