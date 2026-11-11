/* Rasl Estate — ask by typing or by voice.
   One box understands: a plot number (jumps to it on the map), a country, city or coordinates,
   a section name ("ads", "تیم"), "new …" to open a form, or any name to look up in the records. */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), ui = RE.ui, A = RE.act;
  const S = () => RE.state;

  /* ---------- text ---------- */
  // People type Kurdish on Arabic keyboards and the other way round, so letters that look alike count as the same.
  const FOLD = { 'ك': 'ک', 'ي': 'ی', 'ى': 'ی', 'ێ': 'ی', 'ئ': 'ی', 'ة': 'ه', 'ە': 'ه', 'ھ': 'ه', 'ۆ': 'و', 'ؤ': 'و', 'ڕ': 'ر', 'ڵ': 'ل', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ڤ': 'ف', 'پ': 'ب', 'چ': 'ج', 'گ': 'ک', 'ژ': 'ز' };
  const digits = s => s.replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x660).replace(/[۰-۹]/g, d => d.charCodeAt(0) - 0x6F0);
  const norm = s => digits(String(s || '')).toLowerCase().replace(/[ً-ْـ‌‍]/g, '').replace(/[؀-ۿ]/g, c => FOLD[c] || c).replace(/\s+/g, ' ').trim();
  const squash = s => norm(s).replace(/[\s\-_.,،/]+/g, '');
  const latin = w => /^[a-z ]+$/.test(w);
  // Latin words must match whole words; Arabic-script words match with spaces ignored ("نه خشه" = "نەخشە").
  function has(text, words) {
    const n = norm(text), q = squash(text);
    return words.some(w => { const k = norm(w); return latin(k) ? new RegExp('(^|[^a-z])' + k + '($|[^a-z])').test(n) : q.includes(squash(w)); });
  }
  const plotKey = s => digits(String(s || '')).toUpperCase().replace(/[^A-Z0-9؀-ۿ]/g, '');

  /* ---------- what words mean ---------- */
  const SECTIONS = [
    ['map', ['map', 'خريطة', 'خارطة', 'نەخشە']],
    ['leads', ['leads', 'lead', 'clients', 'customers', 'buyers', 'عملاء', 'عميل', 'زبائن', 'کڕیار', 'موشتەری']],
    ['ads', ['ads', 'advertising', 'campaigns', 'إعلان', 'ڕیکلام', 'ریکلام']],
    ['team', ['team', 'agents', 'فريق', 'تیم']],
    ['join', ['join', 'charity', 'referrals', 'invites', 'انضمام', 'الخير', 'بەشداری', 'بەژداری', 'خێرخوازی']],
    ['rewards', ['rewards', 'مكافآت', 'مكافات', 'پاداشت']],
    ['market', ['market', 'السوق', 'بازاڕ']],
    ['reports', ['reports', 'report', 'تقارير', 'تقرير', 'ڕاپۆرت']],
    ['plan', ['business plan', 'plan', 'خطة', 'پلان']],
    ['projects', ['projects', 'project', 'مشاريع', 'مشروع', 'پڕۆژە']],
    ['property', ['property', 'properties', 'listings', 'houses', 'عقار', 'عقارات', 'موڵک', 'خانوو', 'خانو']],
    ['dashboard', ['dashboard', 'لوحة', 'الرئيسية', 'داشبۆرد']],
    ['office', ['office', 'settings', 'مكتب', 'إعدادات', 'نووسینگە', 'نوسینگە', 'ڕێکخستن']],
    ['home', ['home', 'showcase', 'الشاشة', 'سەرەکی']]
  ];
  const ADD = ['add', 'new', 'create', 'register', 'record', 'أضف', 'إضافة', 'جديد', 'جديدة', 'سجل', 'زیادکردن', 'زیاد بکە', 'نوێ', 'تۆمار', 'دروست'];
  const THINGS = [
    ['addAppt', ['appointment', 'visit', 'meeting', 'موعد', 'زيارة', 'چاوپێکەوتن', 'سەردان', 'ژوان']],
    ['addCampaign', ['campaign', 'ad', 'ads', 'حملة', 'إعلان', 'ڕیکلام', 'کەمپەین']],
    ['addAgent', ['team member', 'agent', 'member', 'عضو', 'موظف', 'ئەندام', 'کارمەند']],
    ['addProject', ['project', 'مشروع', 'پڕۆژە']],
    ['addDonation', ['donation', 'تبرع', 'بەخشین', 'خێر']],
    ['addReferral', ['invite', 'referral', 'دعوة', 'بانگهێشت']],
    ['addLead', ['lead', 'client', 'customer', 'buyer', 'عميل', 'زبون', 'کڕیار', 'موشتەری']],
    ['addProp', ['property', 'listing', 'house', 'villa', 'land', 'apartment', 'عقار', 'بيت', 'أرض', 'شقة', 'موڵک', 'خانوو', 'خانو', 'زەوی', 'شوقە']]
  ];
  const LANGS = [['en', ['english', 'انگلیزی', 'إنجليزي']], ['ar', ['arabic', 'عربي', 'عربی']], ['ku', ['kurdish', 'کوردی', 'كردي']]];
  // Words in front of a place or plot number that carry no meaning of their own.
  const LEAD_IN = ['go to', 'take me to', 'show me', 'show', 'find', 'open', 'where is', 'search', 'on the map', 'map', 'plot number', 'plot no', 'plot', 'number', 'land',
    'اذهب إلى', 'اذهب الى', 'أرني', 'اعرض', 'ابحث عن', 'ابحث', 'افتح', 'أين', 'على الخريطة', 'خريطة', 'رقم القطعة', 'قطعة', 'رقم', 'أرض',
    'بڕۆ بۆ', 'بچۆ بۆ', 'نیشانم بدە', 'نیشان بدە', 'بدۆزەوە', 'بگەڕێ بۆ', 'بکەوە', 'لە کوێیە', 'لەسەر نەخشە', 'نەخشەی', 'نەخشە', 'ژمارەی زەوی', 'ژمارەی پارچە', 'پارچە', 'ژمارەی', 'ژمارە', 'زەوی'];

  // Drops lead-in words from the front ("go to plot E-1024" → "E-1024"), comparing letter by letter so spelling variants still match.
  function stripLeadIn(raw) {
    let s = digits(raw).trim(), again = true;
    const keys = LEAD_IN.map(squash).sort((a, b) => b.length - a.length);
    while (again && s) {
      again = false;
      for (const k of keys) {
        let i = 0, j = 0;
        while (i < s.length && j < k.length) { const c = squash(s[i]); if (!c) { i++; continue; } if (c !== k[j]) break; i++; j++; }
        if (j !== k.length) continue;
        const rest = s.slice(i);
        if (rest && !/^[\s:،,\-]/.test(rest) && !/^\d/.test(rest)) continue; // "mapleton" is not "map" + "leton"
        s = rest.replace(/^[\s:،,\-]+/, ''); again = true; break;
      }
    }
    return s;
  }

  /* ---------- the map ---------- */
  function flyTo(place) {
    RE.closeDlg();
    const z = place.bbox ? Math.max(3, Math.min(17, Math.floor(Math.log2(360 / Math.max(0.0005, place.bbox[1][0] - place.bbox[0][0]))) + 1)) : 16;
    ui.mapCity = ''; ui.mapSel = null; ui.placing = null;
    ui.map = { lat: place.lat, lng: place.lng, z, bbox: place.bbox || null };
    ui.mapMark = { lat: place.lat, lng: place.lng, label: place.label };
    if (ui.route === 'map') RE.render(); else RE.go('map');
    RE.toast(place.label);
  }
  async function geocode(q) {
    const lang = S().settings.lang === 'ku' ? 'ckb,ku,ar,en' : S().settings.lang === 'ar' ? 'ar,en' : 'en';
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=' + lang + '&q=' + encodeURIComponent(q));
    if (!r.ok) throw new Error('search ' + r.status);
    return (await r.json()).map(x => {
      const b = x.boundingbox && x.boundingbox.map(Number);
      return { lat: +x.lat, lng: +x.lon, label: x.display_name, bbox: b && b.every(isFinite) && b[1] - b[0] > 0.002 ? [[b[2], b[0]], [b[3], b[1]]] : null };
    }).filter(p => isFinite(p.lat) && isFinite(p.lng));
  }
  const coords = s => { const m = digits(s).match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,،\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/); return m && Math.abs(+m[1]) <= 90 && Math.abs(+m[2]) <= 180 ? { lat: +m[1], lng: +m[2], label: (+m[1]) + ', ' + (+m[2]) } : null; };

  function plotMatches(q) {
    const cands = [plotKey(q)].concat(q.split(/\s+/).filter(w => /\d/.test(w)).map(plotKey)).filter(Boolean);
    const withPlot = S().properties.filter(p => p.plot);
    let hit = withPlot.filter(p => cands.indexOf(plotKey(p.plot)) >= 0);
    if (!hit.length) hit = withPlot.filter(p => cands.some(c => /\d/.test(c) && c.length >= 2 && plotKey(p.plot).includes(c)));
    return hit;
  }
  const looksLikePlot = q => /\d/.test(q) && /^[\p{L}]{0,4}[\s\-\/]*\d[\d\s\-\/]*[\p{L}]{0,2}$/u.test(q.trim());
  function showProperty(p) {
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
      RE.closeDlg(); ui.mapCity = ''; ui.mapMark = null; ui.placing = null; ui.mapSel = p.id; ui.map = { lat: p.lat, lng: p.lng, z: 16 };
      if (ui.route === 'map') RE.render(); else RE.go('map');
      RE.toast(p.plot ? t('Plot {n}: {p}', { n: p.plot, p: p.title }) : p.title);
    } else {
      A.showOnMap({ id: p.id });
      RE.toast(t('{p} has no place on the map yet. Tap the map where it stands.', { p: p.title }));
    }
  }

  /* ---------- records ---------- */
  function records(q) {
    const k = squash(q), out = [];
    if (k.length < 2) return out;
    const m = (...parts) => squash(parts.filter(Boolean).join(' ')).includes(k);
    S().properties.forEach(p => { if (m(p.title, p.plot, p.district, p.city)) out.push({ act: 'viewProp', id: p.id, icon: 'property', name: p.title, sub: [p.plot, RE.place(p)].filter(Boolean).join(' · ') }); });
    S().projects.forEach(p => { if (m(p.name, p.city, p.district)) out.push({ act: 'openProject', id: p.id, icon: 'projects', name: p.name, sub: t('Residential project') }); });
    S().leads.forEach(l => { if (m(l.name, l.phone)) out.push({ act: 'viewLead', id: l.id, icon: 'leads', name: l.name, sub: [l.phone, RE.label('stage', l.stage)].filter(Boolean).join(' · ') }); });
    S().agents.forEach(a => { if (m(a.name, a.phone)) out.push({ act: 'editAgent', id: a.id, icon: 'team', name: a.name, sub: RE.label('role', a.role) }); });
    return out;
  }

  /* ---------- the dialog ---------- */
  const micBtn = RE.micBtn;
  function examples() {
    const p = S().properties.find(x => x.plot);
    const list = [p ? p.plot : '', t('Dubai'), t('New lead'), t('Ads'), t('Team')].filter(Boolean);
    return `<p class="quiet">${t('Write or say a plot number, a country or city, a section, a name, or “new” and what to add.')}</p>
      <div class="askex">${list.map(x => `<button type="button" class="btn ghost small" data-act="askEx" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
  }
  function dialog(q, body) {
    RE.modal(`${RE.dlgHead(t('Ask Rasl'))}
      <form id="askForm" class="askbar"><input type="search" id="askQ" value="${esc(q || '')}" placeholder="${esc(t('Type or say what you need'))}" autocomplete="off" enterkeyhint="go" aria-label="${esc(t('Ask Rasl'))}">${micBtn('askQ')}<button class="btn" type="submit">${t('Go')}</button></form>
      <div class="dlg-b" id="askOut">${body || examples()}</div>`, 'ask');
    const el = document.getElementById('askQ'); if (el && !body) el.focus();
  }
  const rowsOf = list => `<ul class="rows">${list.map(r => `<li class="click" data-act="${r.act}" data-id="${esc(r.id)}" tabindex="0">${RE.icon(r.icon)}<span class="grow"><b>${esc(r.name)}</b><small>${esc(r.sub || '')}</small></span></li>`).join('')}</ul>`;
  const placeRows = list => `<ul class="rows">${list.map((p, i) => `<li class="click" data-act="askPlace" data-i="${i}" tabindex="0">${RE.icon('pin')}<span class="grow"><b>${esc(p.label.split(',')[0])}</b><small>${esc(p.label)}</small></span></li>`).join('')}</ul>`;

  async function places(q, direct, inDialog) {
    let list = null;
    try { list = await geocode(q); } catch (e) { list = null; }
    ui.askPlaces = list || [];
    const still = () => { const el = document.getElementById('askPlaces'); return el && el.dataset.q === q ? el : null; };
    if (!list) { const msg = t('The map search needs an internet connection.'); if (inDialog && still()) still().innerHTML = `<p class="quiet">${msg}</p>`; else RE.toast(msg); return; }
    if (!list.length) {
      if (inDialog && still()) still().innerHTML = `<p class="quiet">${t('No place on the map is called “{q}”.', { q })}</p>`;
      else if (looksLikePlot(q)) noPlot(q);
      else RE.toast(t('Nothing found for “{q}”.', { q }));
      return;
    }
    if (direct) return flyTo(list[0]);
    if (still()) still().innerHTML = placeRows(list);
  }
  function noPlot(q) {
    dialog(q, `<p>${t('No property here has plot number {n}.', { n: `<b class="plotno">${esc(q)}</b>` })}</p>
      <p class="quiet">${t('Public maps do not carry land registry numbers. Add the plot once with its place on the map, and from then on its number brings you straight to it.')}</p>
      <div><button type="button" class="btn" data-act="askAddPlot" data-plot="${esc(q)}">${RE.icon('plus')}${t('Add plot {n}', { n: q })}</button></div>`);
  }

  /* ---------- understand and do ---------- */
  RE.ask = function (raw, opt) {
    opt = opt || {};
    const text = String(raw || '').trim();
    if (!text) { if (!opt.map) dialog(''); return; }
    ui.askLast = text;
    const c = coords(text); if (c) return flyTo(c);

    if (!opt.map) {
      const wantsNew = has(text, ADD), thing = THINGS.find(x => has(text, x[1]));
      if (wantsNew && (thing || ADD.some(w => squash(w) === squash(text)))) { RE.closeDlg(); return thing ? A[thing[0]]({}) : A.newMenu(); }
      const lg = LANGS.find(x => squash(text) === squash(x[1][0]) || x[1].some(w => squash(text) === squash(w)));
      if (lg) { RE.closeDlg(); S().settings.lang = lg[0]; RE.persist(); RE.render(); return; }
    }

    const q = stripLeadIn(text), mapWord = has(text, SECTIONS[0][1]);
    if (!q) { RE.closeDlg(); return RE.go('map'); }
    const hits = /\d/.test(q) ? plotMatches(q) : [];
    if (hits.length === 1) return showProperty(hits[0]);
    if (hits.length > 1) return dialog(text, `<p class="eyebrow">${t('Plots')}</p>${rowsOf(hits.map(p => ({ act: 'askShow', id: p.id, icon: 'pin', name: p.plot + ' · ' + p.title, sub: RE.place(p) })))}`);
    if (looksLikePlot(q)) return noPlot(q);

    if (opt.map || (mapWord && q !== text)) return places(q, true, false);

    const sec = SECTIONS.find(x => x[1].some(w => squash(w) === squash(q))) || (q.split(/\s+/).length <= 3 && SECTIONS.find(x => has(q, x[1])));
    const recs = records(q);
    if (sec && !recs.length) { RE.closeDlg(); return RE.go(sec[0]); }
    if (!recs.length) return places(q, true, false);
    dialog(text, `${sec ? `<div><button type="button" class="btn ghost" data-act="nav" data-to="${sec[0]}" data-close="1">${RE.icon(sec[0])}${t('Open')} ${esc(t(RE.titleOf(sec[0])))}</button></div>` : ''}
      <p class="eyebrow">${t('In your records')}</p>${rowsOf(recs.slice(0, 8))}
      <p class="eyebrow">${t('On the map')}</p><div id="askPlaces" data-q="${esc(q)}"><p class="quiet">${t('Searching the map…')}</p></div>`);
    places(q, false, true);
  };

  /* ---------- voice ---------- */
  let rec = null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const setMic = on => document.querySelectorAll('.mic').forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  function listen(target) {
    if (!SR) { RE.toast(t('This browser cannot listen. Type it instead, or open Rasl in Chrome, Edge or Safari.')); return; }
    if (rec) { rec.stop(); return; }
    const lang = S().settings.lang;
    const tries = { en: ['en-US'], ar: ['ar-IQ'], ku: ['ckb-IQ', 'ar-IQ'] }[lang] || ['en-US'];
    const start = i => {
      const r = rec = new SR();
      let said = '', retry = false;
      r.lang = tries[i]; r.interimResults = true; r.maxAlternatives = 1;
      r.onresult = e => {
        said = Array.from(e.results).map(x => x[0].transcript).join(' ');
        const el = document.getElementById(target); if (el) el.value = said;
      };
      r.onerror = e => {
        if (e.error === 'language-not-supported' && i + 1 < tries.length) { retry = true; return; }
        if (e.error === 'aborted') return;
        RE.toast(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? t('Allow the microphone for this page, then press the microphone again.')
          : e.error === 'no-speech' ? t('I did not hear anything. Press the microphone and speak.')
          : e.error === 'language-not-supported' ? t('This browser cannot listen in this language. Type it instead.')
          : t('Listening stopped. Type it instead, or try again.'));
      };
      r.onend = () => {
        rec = null; setMic(false);
        if (retry) { RE.toast(t('This browser does not listen in Kurdish yet, so it is listening in Arabic.')); return start(i + 1); }
        if (said.trim()) RE.ask(said.trim(), { map: target === 'mapQ' });
      };
      try { r.start(); setMic(true); } catch (e) { rec = null; setMic(false); }
    };
    start(0);
  }

  /* ---------- actions and events ---------- */
  A.ask = () => dialog('');
  A.askVoice = () => { dialog(''); listen('askQ'); };
  A.askMic = d => listen(d.for);
  A.askEx = d => RE.ask(d.q);
  A.askPlace = d => { const p = (ui.askPlaces || [])[+d.i]; if (p) flyTo(p); };
  A.askShow = d => { const p = RE.get('properties', d.id); if (p) showProperty(p); };
  A.askAddPlot = d => { RE.closeDlg(); A.addProp({ plot: d.plot }); };
  A.mapUnmark = () => { ui.mapMark = null; ui.mapQ = ''; RE.render(); };

  document.addEventListener('submit', e => {
    if (e.target.id === 'askForm') { e.preventDefault(); RE.ask(e.target.elements.askQ.value); }
    if (e.target.id === 'mapAsk') { e.preventDefault(); ui.mapQ = e.target.elements.mapQ.value.trim(); if (ui.mapQ) RE.ask(ui.mapQ, { map: true }); }
  });
  document.addEventListener('click', e => { const el = e.target.closest('[data-close]'); if (el) RE.closeDlg(); }, true);
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.matches && e.target.matches('input, textarea, select, [contenteditable]')) return;
    e.preventDefault(); dialog('');
  });
})(window.RE);
