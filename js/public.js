/* Rasl Estate — public project page. Opened from a project or ad link; shows photos, video, VR and prices,
   and lets a visitor register interest, which arrives in the office CRM as a new lead. */
(function () {
  const RE = window.RE;
  const q = new URLSearchParams(location.search), office = q.get('o'), pid = q.get('p'), campaign = q.get('c') || '';
  const nav = (navigator.language || 'en').toLowerCase();
  let lang = q.get('lang') || (/^(ckb|ku)/.test(nav) ? 'ku' : /^ar/.test(nav) ? 'ar' : 'en');
  RE.state = { settings: { lang } };
  const t = (s, v) => RE.t(s, v), L = (g, k) => RE.label(g, k);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => Math.round(+n || 0).toLocaleString('en-US');
  const short = n => { n = +n || 0; const a = Math.abs(n), f = (x, u) => (Math.round(x * 10) / 10) + u; return a >= 1e6 ? f(n / 1e6, 'M') : a >= 1e3 ? f(n / 1e3, 'k') : String(n); };
  const bdi = v => `<bdi dir="ltr">${v}</bdi>`;
  const el = document.getElementById('pub');
  let data = null;

  function embed(url, label) {
    if (!url) return '';
    let u; try { u = new URL(url); } catch (e) { return ''; }
    const h = u.hostname.replace(/^www\.|^m\./, ''); let src = null, m;
    if (h === 'youtu.be') src = 'https://www.youtube-nocookie.com/embed/' + u.pathname.slice(1);
    else if (h === 'youtube.com') { const id = u.searchParams.get('v') || ((m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)) && m[1]); if (id) src = 'https://www.youtube-nocookie.com/embed/' + id; }
    else if (h === 'vimeo.com' && (m = u.pathname.match(/^\/(\d+)/))) src = 'https://player.vimeo.com/video/' + m[1];
    else if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return `<figure class="media"><video src="${esc(u.href)}" controls playsinline preload="metadata"></video></figure>`;
    else if (/(^|\.)matterport\.com$|(^|\.)kuula\.co$|(^|\.)momento360\.com$|(^|\.)3dvista\.com$|(^|\.)cloudpano\.com$|(^|\.)teliportme\.com$/.test(h)) src = u.href;
    if (!src) return `<a class="media-link" href="${esc(u.href)}" target="_blank" rel="noopener"><span><b>${esc(label)}</b><small>${esc(h)}</small></span></a>`;
    return `<figure class="media"><iframe src="${esc(src)}" title="${esc(label)}" loading="lazy" allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><figcaption><span>${esc(label)}</span></figcaption></figure>`;
  }

  function render() {
    document.documentElement.lang = lang === 'ku' ? 'ckb' : lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    if (!data) return;
    const p = data.project, ph = p.photos || [];
    document.title = p.name + ' · ' + (data.office || 'Rasl Estate');
    const price = p.priceFrom ? (p.priceTo && p.priceTo > p.priceFrom ? t('From {a} to {b}', { a: bdi('$' + short(p.priceFrom)), b: bdi('$' + short(p.priceTo)) }) : t('From {a}', { a: bdi('$' + num(p.priceFrom)) })) : '';
    const area = p.areaFrom ? bdi(`${num(p.areaFrom)}${p.areaTo && p.areaTo > p.areaFrom ? '–' + num(p.areaTo) : ''} m²`) : '';
    const left = p.status === 'soldout' ? t('Sold out') : p.unitsTotal ? t('{a} of {b} units left', { a: bdi(num(p.unitsAvailable)), b: bdi(num(p.unitsTotal)) }) : '';
    const stat = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';
    const wa = (p.phone || '').replace(/[^\d]/g, '');
    const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(t('Hello, I would like details about {p}.', { p: p.name }))}` : '';
    el.innerHTML = `
      <header class="pub-top"><div class="row"><span class="logo">${logo()}</span><b>${esc(data.office || 'Rasl Estate')}</b></div>
        <select id="pub-lang" aria-label="${t('Language')}"><option value="en"${lang === 'en' ? ' selected' : ''}>English</option><option value="ar"${lang === 'ar' ? ' selected' : ''}>العربية</option><option value="ku"${lang === 'ku' ? ' selected' : ''}>کوردی</option></select></header>
      <section class="pub-hero">
        <div class="pub-gallery ${ph.length > 1 ? 'multi' : ''}">${ph.length ? ph.slice(0, 5).map((s, i) => `<img src="${s}" alt="${esc(p.name)} ${i + 1}"${i ? ' loading="lazy"' : ''}>`).join('') : `<div class="pub-noimg">${esc(p.name)}</div>`}</div>
        <div class="pub-info">
          <span class="eyebrow">${esc(L('pstatus', p.status))} · ${esc(L('ptype', p.ptype))} · ${esc([p.district, p.city].filter(Boolean).join(', '))}</span>
          <h1>${esc(p.name)}</h1>${p.developer ? `<p class="sub">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
          <dl class="pstats">${stat(t('Price'), price)}${stat(t('Sizes'), area)}${stat(t('Availability'), left)}${stat(t('Handover'), p.handover ? `<bdi>${esc(p.handover)}</bdi>` : '')}</dl>
          ${p.payment ? `<p class="pay">${esc(p.payment)}</p>` : ''}
          <div class="row wrap">${waHref ? `<a class="btn" href="${waHref}" target="_blank" rel="noopener">${t('Ask on WhatsApp')}</a>` : ''}<a class="btn ghost" href="#interest">${t('Register your interest')}</a></div>
        </div></section>
      ${p.videoUrl || p.vrUrl ? `<section class="pub-media">${embed(p.videoUrl, t('Video'))}${embed(p.vrUrl, t('VR tour'))}</section>` : ''}
      ${p.description ? `<section class="pub-desc"><p>${esc(p.description)}</p></section>` : ''}
      ${typeof p.lat === 'number' ? `<p><a class="btn ghost" href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">${t('Google Maps')}</a></p>` : ''}
      <section class="panel pub-form" id="interest"><h2>${t('Register your interest')}</h2><p class="sub">${t('Leave your name and number and an agent will call you about {p}.', { p: esc(p.name) })}</p>
        <form id="lead" class="fgrid" novalidate>
          <div class="fld"><label for="i-name">${t('Full name')}</label><input id="i-name" name="name" autocomplete="name" required></div>
          <div class="fld"><label for="i-phone">${t('Phone')}</label><input id="i-phone" name="phone" type="tel" autocomplete="tel" placeholder="+964" required dir="ltr"></div>
          <div class="fld wide"><label for="i-note">${t('Anything we should know')}</label><textarea id="i-note" name="note" rows="2" placeholder="${t('For example: 4 bedrooms, ground floor, budget')}"></textarea></div>
          <div class="fld wide"><p class="ferr" id="i-err" hidden></p><button class="btn" type="submit">${t('Send')}</button></div>
        </form></section>
      <footer class="pub-foot">${esc(data.office || 'Rasl Estate')}</footer>`;
    document.getElementById('pub-lang').onchange = e => { lang = e.target.value; RE.state.settings.lang = lang; render(); };
    document.getElementById('lead').onsubmit = submit;
  }
  function logo() { return '<svg class="logo-svg" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" class="lg-tile"/><path d="M15 36V19.5L24 12l9 7.5v3.7c0 4.3-3.4 7.6-7.7 7.6H15M25.3 30.8L33.5 36" fill="none" class="lg-ink" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="21.9" y="19.4" width="4.2" height="4.2" rx=".8" class="lg-win"/></svg>'; }

  async function submit(e) {
    e.preventDefault();
    const f = e.target.elements, err = document.getElementById('i-err'), btn = e.target.querySelector('button');
    const name = f.name.value.trim(), phone = f.phone.value.trim();
    if (name.length < 2 || phone.replace(/[^\d]/g, '').length < 7) { err.textContent = t('Enter your name and a phone number we can call.'); err.hidden = false; return; }
    btn.disabled = true; err.hidden = true;
    const { error } = await client.rpc('submit_interest', { office, pid, full_name: name, phone, note: f.note.value.trim(), campaign });
    btn.disabled = false;
    if (error) { err.textContent = /Too many/.test(error.message) ? t('Too many requests. Try again in a little while.') : t('Your details could not be sent. Check the connection and try again, or use WhatsApp.'); err.hidden = false; return; }
    document.getElementById('interest').innerHTML = `<h2>${t('Thank you, {n}', { n: esc(name) })}</h2><p>${t('We received your details. An agent will call you soon.')}</p>`;
  }

  const cfg = window.RASL_CONFIG;
  const client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: false } });
  render();
  if (!office || !pid) { el.innerHTML = `<p class="pub-msg">${t('This project link is incomplete. Ask the office to send it again.')}</p>`; return; }
  client.rpc('get_public_project', { office, pid }).then(({ data: d, error }) => {
    if (error || !d) { el.innerHTML = `<p class="pub-msg">${error ? t('The page could not load. Check the connection and refresh.') : t('This project is no longer shown publicly. Contact the office for details.')}</p>`; return; }
    data = d; render();
  });
})();
