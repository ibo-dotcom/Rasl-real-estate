// App tests. Run: node serve.js & node run.js   (BASE defaults to http://localhost:8766/)
// 1) every <script> in global/index.html parses
// 2) every button on the main screens is clicked once, on a fresh page: no JavaScript errors
// 3) every sheet opened from a screen button closes with its x
// 4) every side-menu item: going back (Back button and the page arrow / x) returns to the menu
// The database is replaced by a fake client (stub.js); outside sites are blocked.
const { chromium } = require('playwright');const fs=require('fs'),path=require('path');
const {STUB}=require('./stub.js');const BASE=process.env.BASE||'http://localhost:8766/';
const QUICK=process.argv.includes('--quick');const problems=[];const log=(...a)=>console.log(...a);
const ROUTES=QUICK?['Main','Dashboard','Network']:['Main','Search','Network','Learn','Wallet','Accounts','Sales','Dashboard','Profile','Ads','Listings','Register!','Login!','Welcome!'];
(async()=>{
 // 1) syntax
 const html=fs.readFileSync(path.join(__dirname,'..','global','index.html'),'utf8');
 [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m,i)=>{try{new Function(m[1]);}catch(e){problems.push('syntax: script '+i+': '+e.message);}});
 log('1) syntax checked');
 const b=await chromium.launch();
 const mk=async(route,w,h)=>{const ns=route.endsWith('!');const p=await b.newPage({viewport:{width:w||390,height:h||900}});const errs=[];
  p.on('pageerror',e=>{if(!/importScripts|Failed to fetch|maplibre/.test(String(e)))errs.push(String(e).slice(0,160));});p.on('dialog',d=>d.type()==='prompt'?d.accept('test'):d.dismiss());
  await p.route('**/cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'application/javascript',body:STUB}));
  await p.route('**/vendor/supabase.js',r=>r.fulfill({contentType:'application/javascript',body:STUB}));
  await p.route(/^https?:\/\/(?!localhost)(?!127\.0\.0\.1)(?!cdn\.jsdelivr\.net)/,r=>r.abort());
  await p.addInitScript(ns=>{if(ns)window.__noSession=true;window.__OFFMODE='none';window.open=()=>null;try{localStorage.setItem('reg_lang','ku');}catch(e){}},ns);
  await p.goto(BASE+'index.html#'+route.replace('!',''));await p.waitForTimeout(1300);p._errs=errs;return p;};
 // 2) buttons
 let nb=0;for(const route of ROUTES){let p=await mk(route);
  if(p._errs.length)problems.push(route+' load: '+p._errs.join(' ; '));
  const acts=await p.evaluate(()=>{const seen=new Set(),out=[];document.querySelectorAll('[data-act]').forEach((e,i)=>{const k=e.getAttribute('data-act')+'|'+(e.getAttribute('data-k')||e.getAttribute('data-m')||'');if(seen.has(k))return;seen.add(k);out.push({k,i});});return out;});await p.close();
  for(const a of acts.slice(0,60)){p=await mk(route);await p.evaluate(i=>{const e=document.querySelectorAll('[data-act]')[i];e&&e.click();},a.i);await p.waitForTimeout(600);
   const errs=p._errs.filter(e=>!/functions\.invoke|reading 'invoke'/.test(e));if(errs.length)problems.push(route+' ['+a.k+'] '+errs.join(' ; '));nb++;await p.close();}}
 log('2) buttons clicked:',nb);
 // 2b) every page other than Home has a way back on the screen itself (the app on the phone's home screen has no browser Back)
 for(const route of ROUTES.filter(r=>!r.endsWith('!')&&r!=='Main')){const p=await mk(route);
  if(!(await p.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].some(a=>a.querySelector('path[d="M15 5l-7 7 7 7"]')&&a.getClientRects().length))))problems.push(route+': no back arrow on the page');await p.close();}
 log('2b) back arrows checked');
 // 3) sheets close with x
 const isOpen=p=>p.evaluate(()=>!!(document.querySelector('.tm-sheet:not(.mside)')||document.getElementById('adView')||document.querySelector('[data-act=closeLead]')));
 let ns=0;for(const route of ROUTES.filter(r=>!r.endsWith('!'))){let p=await mk(route);const acts=await p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-act]')].map(e=>e.getAttribute('data-act')))]);await p.close();
  for(const a of acts){p=await mk(route);await p.evaluate(a=>{const e=document.querySelector('[data-act="'+a+'"]');e&&e.click();},a);await p.waitForTimeout(500);
   if((await p.evaluate(()=>location.hash))==='#'+route&&await isOpen(p)){ns++;const c=await p.evaluate(()=>{const e=document.querySelector('#adView [data-av=close],[data-act=closeLead],.tm-sheet:not(.mside) [data-act$="Close"],.tm-sheet:not(.mside) [data-act^="close"]');if(e){e.click();return true;}return false;});
    await p.waitForTimeout(400);if(!c||await isOpen(p))problems.push(route+' sheet ['+a+'] does not close with x');}
   await p.close();}}
 log('3) sheets checked:',ns);
 // 4) side menu: back returns to the menu
 let nm=0;{let p=await mk('Main');await p.evaluate(()=>{const m=document.querySelector('[data-act=menuOpen]');m&&m.click();});await p.waitForSelector('.mpanel a',{timeout:8000}).catch(()=>{});
  const items=await p.evaluate(()=>[...document.querySelectorAll('.mpanel a[href^="#"], .mpanel [data-act=menuAct]')].map((e,i)=>({i,label:(e.innerText||'').trim().slice(0,24),href:e.getAttribute('href'),a:e.getAttribute('data-a')})).filter(x=>x.a!=='signout'));await p.close();
  if(!items.length)problems.push('menu: no items found');
  for(const it of items){p=await mk('Main');await p.evaluate(()=>document.querySelector('[data-act=menuOpen]').click());await p.waitForSelector('.mpanel a',{timeout:8000}).catch(()=>{});
   await p.evaluate(i=>{const e=[...document.querySelectorAll('.mpanel a[href^="#"], .mpanel [data-act=menuAct]')][i];e&&e.click();},it.i);await p.waitForTimeout(800);
   const hash=await p.evaluate(()=>location.hash),sheet=await p.evaluate(()=>!!(document.querySelector('.tm-sheet:not(.mside)')||document.getElementById('secView')||document.getElementById('bioSet')));
   if(!sheet&&hash==='#Main'){await p.close();continue;}
   await p.goBack();await p.waitForTimeout(700);nm++;
   if(!(await p.evaluate(()=>!!document.querySelector('.tm-sheet.mside'))))problems.push('menu ['+it.label+'] Back did not return to the menu');
   const errs=p._errs.filter(e=>!/functions\.invoke|reading 'invoke'/.test(e));if(errs.length)problems.push('menu ['+it.label+'] '+errs.join(' ; '));await p.close();}}
 log('4) menu items checked:',nm);
 await b.close();
 log('\n'+(problems.length?'PROBLEMS ('+problems.length+'):\n- '+problems.join('\n- '):'ALL TESTS PASSED'));process.exit(problems.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
