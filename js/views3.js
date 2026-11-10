/* Rasl Estate — residential projects: home showcase, project list and the full-screen display for an office TV */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), L = (g, k) => RE.label(g, k);
  const V = RE.views;

  const live = () => RE.state.projects.slice().sort((a, b) =>
    (a.status === 'soldout') - (b.status === 'soldout') || (b.featured === 'yes') - (a.featured === 'yes') || (a.order || 0) - (b.order || 0));
  const featured = () => { const f = live().filter(p => p.featured === 'yes' && p.status !== 'soldout'); return f.length ? f : live().filter(p => p.status !== 'soldout'); };
  RE.showcaseList = featured;

  /* ---------- elevation drawing used when a project has no photo ---------- */
  function rng(seed) { let h = 2166136261; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h % 10000) / 10000; }; }
  RE.projectArt = function (p, cls) {
    if (p.photos && p.photos[0]) return `<img class="${cls || ''}" src="${p.photos[0]}" alt="${esc(p.name)}">`;
    const r = rng(p.id + p.name), W = 640, H = 400, G = 330, id = 'w' + p.id.replace(/[^a-z0-9]/gi, '');
    let back = '', front = '';
    const tower = (x, w, h, lit) => {
      let win = '';
      const cols = Math.max(2, Math.floor((w - 14) / 13)), rows = Math.floor((h - 26) / 15);
      for (let c = 0; c < cols; c++) for (let k = 0; k < rows; k++) {
        const on = r() < lit;
        win += `<rect x="${x + 9 + c * ((w - 18) / cols)}" y="${G - h + 16 + k * 15}" width="${Math.max(4, (w - 18) / cols - 4)}" height="8" class="${on ? 'pa-lit' : 'pa-win'}"/>`;
      }
      return `<rect x="${x}" y="${G - h}" width="${w}" height="${h}" class="pa-bld"/><rect x="${x}" y="${G - h}" width="${w}" height="5" class="pa-cap"/>${win}`;
    };
    const villa = (x, w) => {
      const h = 46 + r() * 10, roof = 26;
      return `<path d="M${x} ${G}V${G - h}L${x + w / 2} ${G - h - roof}L${x + w} ${G - h}V${G}Z" class="pa-villa"/>
        <rect x="${x + w * 0.16}" y="${G - h + 12}" width="${w * 0.22}" height="${h * 0.32}" class="${r() < 0.5 ? 'pa-lit' : 'pa-win'}"/>
        <rect x="${x + w * 0.62}" y="${G - h + 12}" width="${w * 0.22}" height="${h * 0.32}" class="${r() < 0.5 ? 'pa-lit' : 'pa-win'}"/>
        <rect x="${x + w * 0.42}" y="${G - 24}" width="${w * 0.16}" height="24" class="pa-door"/>`;
    };
    const tree = x => `<path d="M${x} ${G}v-16" class="pa-trunk"/><ellipse cx="${x}" cy="${G - 24}" rx="${9 + r() * 4}" ry="${13 + r() * 5}" class="pa-tree"/>`;
    if (p.ptype !== 'villas') {
      const n = p.ptype === 'apartments' ? 4 + Math.floor(r() * 2) : 3;
      let x = 40 + r() * 30;
      for (let i = 0; i < n; i++) {
        const w = 70 + r() * 40, h = (p.ptype === 'apartments' ? 170 : 120) + r() * (p.ptype === 'apartments' ? 120 : 70);
        (p.ptype === 'mixed' ? back += tower(x, w, h, 0.18) : front += tower(x, w, h, 0.22));
        x += w + 18 + r() * 30; if (x > W - 90) break;
      }
    }
    if (p.ptype !== 'apartments') {
      let x = 20 + r() * 20;
      while (x < W - 90) { const w = 74 + r() * 18; front += villa(x, w); if (r() < 0.7) front += tree(x + w + 10); x += w + 26 + r() * 10; }
    } else { for (let x = 30; x < W; x += 70 + r() * 60) front += tree(x); }
    const hills = `M0 ${G - 40 - r() * 30} Q ${W * 0.25} ${G - 110 - r() * 40} ${W * 0.5} ${G - 60} T ${W} ${G - 80 - r() * 30} V${G} H0Z`;
    return `<svg class="part ${cls || ''}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="${esc(p.name)}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="pa-s1"/><stop offset="1" class="pa-s2"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id})"/>
      <circle cx="${W * (0.68 + r() * 0.2)}" cy="${70 + r() * 40}" r="26" class="pa-sun"/>
      <path d="${hills}" class="pa-hill"/>${back}${front}
      <rect y="${G}" width="${W}" height="${H - G}" class="pa-ground"/><path d="M0 ${G + 22}H${W}" class="pa-road"/>
    </svg>`;
  };

  // Numbers stay left-to-right inside Arabic and Kurdish sentences.
  const bdi = v => `<bdi dir="ltr">${v}</bdi>`;
  const priceRange = p => p.priceFrom ? (p.priceTo && p.priceTo > p.priceFrom ? t('From {a} to {b}', { a: bdi(RE.moneyShort(p.priceFrom)), b: bdi(RE.moneyShort(p.priceTo)) }) : t('From {a}', { a: bdi(RE.money(p.priceFrom)) })) : '';
  const areaRange = p => p.areaFrom ? bdi(`${RE.num(p.areaFrom)}${p.areaTo && p.areaTo > p.areaFrom ? '–' + RE.num(p.areaTo) : ''} m²`) : '';
  const where = p => [p.district, p.city].filter(Boolean).join(', ');
  const phoneOf = p => (p.phone || RE.state.settings.phone || '').trim();
  RE.waLink = p => {
    const n = phoneOf(p).replace(/[^\d]/g, '');
    const msg = t('Hello, I would like details about {p}.', { p: p.name });
    return n ? `https://wa.me/${n}?text=${encodeURIComponent(msg)}` : '';
  };
  const unitsLeft = p => p.status === 'soldout' ? t('Sold out') : p.unitsAvailable != null && p.unitsTotal ? t('{a} of {b} units left', { a: bdi(RE.num(p.unitsAvailable)), b: bdi(RE.num(p.unitsTotal)) }) : '';
  const stat = (label, val) => val ? `<div><dt>${label}</dt><dd>${val}</dd></div>` : '';
  RE.projStats = p => `<dl class="pstats">${stat(t('Price'), priceRange(p))}${stat(t('Sizes'), areaRange(p))}${stat(t('Availability'), unitsLeft(p))}${stat(t('Handover'), p.handover ? `<bdi>${esc(p.handover)}</bdi>` : '')}</dl>`;

  /* ---------- home: the showcase ---------- */
  V.home = function () {
    const S = RE.state, list = featured(), all = live(), ui = RE.ui;
    const bar = `<div class="toolbar"><p class="sub grow">${t('Residential projects you are selling. This screen is made to be shown to clients.')}</p>
      ${all.length ? `<button class="btn ghost" data-act="kiosk">${RE.icon('screen')}${t('Show on a screen')}</button>` : ''}<button class="btn" data-act="addProject">${RE.icon('plus')}${t('Project')}</button></div>`;
    if (!all.length) return bar + RE.empty(t('No projects yet. Add the first residential project you are selling and it becomes the main ad on this screen.'), 'addProject', t('Add a project'));
    if (ui.slide == null || ui.slide >= list.length) ui.slide = 0;
    const p = list[ui.slide];
    const hero = p ? `<section class="hero" aria-roledescription="carousel" aria-label="${t('Featured projects')}">
        <div class="hero-art">${RE.projectArt(p)}${RE.tag(p.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', p.status))}</div>
        <div class="hero-txt">
          <span class="eyebrow">${esc(L('ptype', p.ptype))} · ${esc(where(p))}</span>
          <h2>${esc(p.name)}</h2>
          ${p.developer ? `<p class="sub">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
          ${RE.projStats(p)}
          ${p.payment ? `<p class="pay">${esc(p.payment)}</p>` : ''}
          <div class="row wrap">${RE.waLink(p) ? `<a class="btn" target="_blank" rel="noopener" href="${RE.waLink(p)}">${RE.icon('chat')}${t('Ask on WhatsApp')}</a>` : ''}<button class="btn ghost" data-act="viewProject" data-id="${p.id}">${t('Details')}</button></div>
          ${list.length > 1 ? `<div class="hero-nav"><button class="iconbtn" data-act="slide" data-d="-1" aria-label="${t('Previous')}">${RE.icon('prev')}</button>
            ${list.map((x, i) => `<button class="dot${i === ui.slide ? ' on' : ''}" data-act="slideTo" data-i="${i}" aria-label="${esc(x.name)}"></button>`).join('')}
            <button class="iconbtn" data-act="slide" data-d="1" aria-label="${t('Next')}">${RE.icon('next')}</button></div>` : ''}
        </div></section>` : '';
    return bar + hero + `<h2 class="h-sec">${t('All projects')} <span class="count">${all.length}</span></h2>
      <div class="pgrid">${all.map(x => `<article class="pcard proj${x.status === 'soldout' ? ' out' : ''}"><button class="pcard-img" data-act="viewProject" data-id="${x.id}" aria-label="${esc(x.name)}">${RE.projectArt(x)}${RE.tag(x.status === 'soldout' ? 'sold' : x.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', x.status))}</button>
        <div class="pcard-b"><h3>${esc(x.name)}</h3><p class="sub">${esc(L('ptype', x.ptype))} · ${esc(where(x))}</p>
        <div class="row"><strong class="price">${priceRange(x)}</strong><span class="grow"></span><span class="chip">${unitsLeft(x)}</span></div></div></article>`).join('')}</div>`;
  };

  let slideT = null;
  RE.after.home = function () {
    clearInterval(slideT);
    const n = featured().length;
    if (n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = document.querySelector('.hero'); let paused = false;
    if (hero) { hero.onmouseenter = () => { paused = true; }; hero.onmouseleave = () => { paused = false; }; hero.onfocusin = () => { paused = true; }; }
    slideT = setInterval(() => {
      if (paused || RE.ui.route !== 'home' || document.querySelector('dialog[open]')) return;
      RE.ui.slide = (RE.ui.slide + 1) % featured().length; RE.render();
    }, 7000);
  };

  /* ---------- projects: the list you manage ---------- */
  V.projects = function () {
    const all = live();
    const bar = `<div class="toolbar"><p class="sub grow">${t('Featured projects rotate on the home screen and on the office display.')}</p><button class="btn" data-act="addProject">${RE.icon('plus')}${t('Project')}</button></div>`;
    if (!all.length) return bar + RE.empty(t('No projects yet. Add the first residential project you are selling and it becomes the main ad on this screen.'), 'addProject', t('Add a project'));
    return bar + `<section class="panel flush"><div class="tscroll"><table class="tbl"><thead><tr><th>${t('Project')}</th><th>${t('Type')}</th><th class="n">${t('Price')}</th><th>${t('Availability')}</th><th>${t('Handover')}</th><th>${t('On display')}</th><th>${t('Status')}</th></tr></thead><tbody>
      ${all.map(p => `<tr class="click" data-act="editProject" data-id="${p.id}" tabindex="0"><td><span class="row"><span class="mini-img">${RE.projectArt(p)}</span><span><b>${esc(p.name)}</b><small>${esc(where(p))}${p.developer ? ' · ' + esc(p.developer) : ''}</small></span></span></td>
        <td>${esc(L('ptype', p.ptype))}</td><td class="n">${p.priceFrom ? RE.moneyShort(p.priceFrom) + '+' : '-'}</td><td>${p.status === 'soldout' ? t('Sold out') : `${RE.hbar(p.unitsAvailable || 0, p.unitsTotal || 0)}<small>${unitsLeft(p)}</small>`}</td>
        <td>${esc(p.handover || '')}</td><td>${p.featured === 'yes' && p.status !== 'soldout' ? RE.tag('available', t('Featured')) : `<span class="chip">${t('In the list only')}</span>`}</td><td>${RE.tag(p.status === 'soldout' ? 'sold' : p.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', p.status))}</td></tr>`).join('')}
    </tbody></table></div></section>`;
  };

  RE.projectView = function (p) {
    const wa = RE.waLink(p), ph = p.photos || [];
    RE.modal(`${RE.dlgHead(p.name)}<div class="dlg-b">
      <div class="gallery ${ph.length > 1 ? 'multi' : ''}"><div class="g-main">${RE.projectArt(p)}</div>${ph.slice(1, 4).map((s, i) => `<div><img src="${s}" alt="${esc(p.name)} ${i + 2}"></div>`).join('')}</div>
      <div class="row wrap">${RE.tag(p.status === 'soldout' ? 'sold' : p.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', p.status))}<span class="chip">${esc(L('ptype', p.ptype))} · ${esc(where(p))}</span></div>
      ${p.developer ? `<p class="sub">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
      ${RE.projStats(p)}
      ${p.payment ? `<p class="pay">${esc(p.payment)}</p>` : ''}
      ${p.description ? `<p class="note">${esc(p.description)}</p>` : ''}
    </div><footer class="dlg-f wrap">${wa ? `<a class="btn ghost" target="_blank" rel="noopener" href="${wa}">${RE.icon('chat')}WhatsApp</a>` : ''}${typeof p.lat === 'number' ? `<a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${p.lat},${p.lng}">${RE.icon('map')}${t('Google Maps')}</a>` : ''}
      <span class="grow"></span><button class="btn" data-act="editProject" data-id="${p.id}">${RE.icon('edit')}${t('Edit')}</button></footer>`, 'wide');
  };

  RE.projectForm = function (p) {
    p = p || { ptype: 'villas', status: 'selling', featured: 'yes', city: 'Erbil', photos: [] };
    RE.form({
      title: p.id ? t('Edit project') : t('New project'),
      fields: [
        { name: 'name', label: t('Project name'), required: true, value: p.name },
        { name: 'developer', label: t('Developer'), value: p.developer },
        { name: 'ptype', label: t('Type'), type: 'select', options: RE.PTYPES.map(k => [k, L('ptype', k)]), value: p.ptype },
        { name: 'status', label: t('Status'), type: 'select', options: RE.PSTATUS.map(k => [k, L('pstatus', k)]), value: p.status },
        { name: 'city', label: t('City'), value: p.city },
        { name: 'district', label: t('District'), value: p.district },
        { name: 'priceFrom', label: t('Price from'), type: 'number', required: true, value: p.priceFrom },
        { name: 'priceTo', label: t('Price up to'), type: 'number', value: p.priceTo },
        { name: 'areaFrom', label: t('Smallest unit, m²'), type: 'number', value: p.areaFrom },
        { name: 'areaTo', label: t('Largest unit, m²'), type: 'number', value: p.areaTo },
        { name: 'unitsTotal', label: t('Units in total'), type: 'number', value: p.unitsTotal },
        { name: 'unitsAvailable', label: t('Units still available'), type: 'number', value: p.unitsAvailable },
        { name: 'handover', label: t('Handover'), value: p.handover, placeholder: 'Q4 2027' },
        { name: 'featured', label: t('On the home screen and display'), type: 'select', options: [['yes', t('Featured')], ['no', t('In the list only')]], value: p.featured },
        { name: 'payment', label: t('Payment plan'), wide: true, value: p.payment, placeholder: t('20% down, the rest over 5 years') },
        { name: 'phone', label: t('WhatsApp number'), type: 'tel', value: p.phone, placeholder: '+964', hint: t('Leave empty to use the office number') },
        { name: 'lat', label: t('Latitude'), type: 'number', value: p.lat },
        { name: 'lng', label: t('Longitude'), type: 'number', value: p.lng },
        { name: 'photos', label: t('Photos'), type: 'photos', value: p.photos, hint: t('The first photo is the main picture on the ad') },
        { name: 'description', label: t('Description'), type: 'textarea', value: p.description }
      ],
      onSubmit: v => {
        if (v.unitsTotal != null && v.unitsAvailable != null && v.unitsAvailable > v.unitsTotal) return t('Units still available cannot be more than units in total.');
        if (p.id) v.id = p.id; else { v.createdAt = RE.today(); v.order = RE.state.projects.length; }
        RE.put('projects', v); RE.toast(p.id ? t('Project updated') : t('Project added'));
      },
      onDelete: p.id ? () => RE.confirm(t('Delete {n}? This cannot be undone.', { n: p.name }), t('Delete'), () => { RE.del('projects', p.id); RE.closeDlg(); RE.render(); RE.toast(t('Deleted')); }, true) : null
    });
  };

  /* ---------- full-screen display for a TV in the office ---------- */
  let kT = null, kIdle = null;
  function qr(text) {
    if (!window.qrcode || !text) return '';
    try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ''; }
  }
  function kioskSlide() {
    const list = featured(), el = document.getElementById('kiosk'); if (!el || !list.length) return;
    const i = RE.ui.kslide % list.length, p = list[i], wa = RE.waLink(p), st = RE.state.settings;
    el.querySelector('.k-stage').innerHTML = `<div class="k-art">${RE.projectArt(p)}</div>
      <div class="k-txt"><div class="k-brand">${RE.logo()}<span>${esc(st.office || 'Rasl Estate')}</span></div>
        <span class="eyebrow">${esc(L('pstatus', p.status))} · ${esc(L('ptype', p.ptype))} · ${esc(where(p))}</span>
        <h2>${esc(p.name)}</h2>${p.developer ? `<p class="k-dev">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
        ${RE.projStats(p)}${p.payment ? `<p class="pay">${esc(p.payment)}</p>` : ''}
        ${wa ? `<div class="k-qr"><div class="qr">${qr(wa)}</div><p>${t('Scan to ask about this project on WhatsApp')}<b class="num">${esc(phoneOf(p))}</b></p></div>` : (phoneOf(p) ? `<p class="k-phone num">${esc(phoneOf(p))}</p>` : '')}
      </div>`;
    el.querySelector('.k-bar i').style.animation = 'none'; void el.offsetWidth; el.querySelector('.k-bar i').style.animation = '';
    el.querySelector('.k-count').textContent = `${i + 1} / ${list.length}`;
  }
  RE.kioskOpen = function () {
    if (!featured().length) { RE.toast(t('Mark at least one project as featured first.')); return; }
    RE.ui.kslide = 0;
    const el = document.createElement('div'); el.id = 'kiosk'; el.className = 'kiosk';
    el.innerHTML = `<div class="k-stage"></div><div class="k-bar"><i></i></div><span class="k-count"></span>
      <div class="k-ctl"><button class="iconbtn" data-k="-1" aria-label="${t('Previous')}">${RE.icon('prev')}</button><button class="iconbtn" data-k="1" aria-label="${t('Next')}">${RE.icon('next')}</button><button class="btn small" data-k="x">${t('Close display')}</button></div>`;
    document.body.appendChild(el);
    try { if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); } catch (e) { /* stays as an overlay */ }
    const step = d => { RE.ui.kslide = (RE.ui.kslide + d + featured().length) % featured().length; kioskSlide(); restart(); };
    const restart = () => { clearInterval(kT); if (featured().length > 1) kT = setInterval(() => step(1), 9000); };
    const wake = () => { el.classList.add('awake'); clearTimeout(kIdle); kIdle = setTimeout(() => el.classList.remove('awake'), 2500); };
    el.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) { wake(); return; } if (b.dataset.k === 'x') RE.kioskClose(); else step(+b.dataset.k); });
    el.addEventListener('mousemove', wake);
    el._key = e => { if (e.key === 'Escape') RE.kioskClose(); if (e.key === 'ArrowRight') step(RE.dir() === 'rtl' ? -1 : 1); if (e.key === 'ArrowLeft') step(RE.dir() === 'rtl' ? 1 : -1); };
    document.addEventListener('keydown', el._key);
    el._fs = () => { if (!document.fullscreenElement && document.getElementById('kiosk') && el._wasFs) RE.kioskClose(); el._wasFs = !!document.fullscreenElement; };
    document.addEventListener('fullscreenchange', el._fs);
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(l => { el._lock = l; }).catch(() => {}); } catch (e) { /* screen may sleep */ }
    kioskSlide(); restart(); wake();
  };
  RE.kioskClose = function () {
    const el = document.getElementById('kiosk'); if (!el) return;
    clearInterval(kT); document.removeEventListener('keydown', el._key); document.removeEventListener('fullscreenchange', el._fs);
    if (el._lock) try { el._lock.release(); } catch (e) { /* already released */ }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    el.remove();
  };
})(window.RE);
