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

  /* ---------- home: the ad screen on top, then every project ---------- */
  V.home = function () {
    const all = live();
    if (!all.length) return RE.empty(t('No projects yet. Add the first residential project you are selling and it becomes the main ad on this screen.'), 'addProject', t('Add a project'));
    const noMedia = featured().filter(p => !(p.photos || []).length && !(p.videos || []).length && !p.videoUrl);
    return `<div id="adslot" class="adslot"></div>
      ${noMedia.length ? `<div class="notice"><span>${t('{n} featured projects have no photos or videos yet, so the screen shows a drawing for them.', { n: noMedia.length })}</span><button class="btn small" data-act="editProject" data-id="${noMedia[0].id}">${RE.icon('upload')}${t('Add photos and videos')}</button></div>` : ''}
      <div class="toolbar"><h2 class="h-sec grow">${t('All projects')} <span class="count">${all.length}</span></h2>
        <button class="btn ghost" data-act="kiosk">${RE.icon('screen')}${t('Show on a screen')}</button><button class="btn" data-act="addProject">${RE.icon('plus')}${t('Project')}</button></div>
      <div class="pgrid">${all.map(x => `<article class="pcard proj${x.status === 'soldout' ? ' out' : ''}"><button class="pcard-img" data-act="viewProject" data-id="${x.id}" aria-label="${esc(x.name)}">${RE.projectArt(x)}${RE.tag(x.status === 'soldout' ? 'sold' : x.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', x.status))}${(x.videos || []).length || x.videoUrl ? `<span class="has-video">${RE.icon('play')}</span>` : ''}</button>
        <div class="pcard-b"><h3>${esc(x.name)}</h3><p class="sub">${esc(L('ptype', x.ptype))} · ${esc(where(x))}</p>
        <div class="row"><strong class="price">${priceRange(x)}</strong><span class="grow"></span><span class="chip">${unitsLeft(x)}</span></div></div></article>`).join('')}</div>`;
  };

  /* ---------- projects: the list you manage ---------- */
  V.projects = function () {
    const all = live();
    const bar = `<div class="toolbar"><p class="sub grow">${t('Featured projects rotate on the home screen and on the office display.')}</p><button class="btn" data-act="addProject">${RE.icon('plus')}${t('Project')}</button></div>`;
    if (!all.length) return bar + RE.empty(t('No projects yet. Add the first residential project you are selling and it becomes the main ad on this screen.'), 'addProject', t('Add a project'));
    return bar + `<section class="panel flush"><div class="tscroll"><table class="tbl"><thead><tr><th>${t('Project')}</th><th>${t('Type')}</th><th class="n">${t('Price')}</th><th>${t('Availability')}</th><th>${t('Handover')}</th><th>${t('On display')}</th><th>${t('Status')}</th></tr></thead><tbody>
      ${all.map(p => `<tr class="click" data-act="openProject" data-id="${p.id}" tabindex="0"><td><span class="row"><span class="mini-img">${RE.projectArt(p)}</span><span><b>${esc(p.name)}</b><small>${esc(where(p))}${p.developer ? ' · ' + esc(p.developer) : ''}</small></span></span></td>
        <td>${esc(L('ptype', p.ptype))}</td><td class="n">${p.priceFrom ? RE.moneyShort(p.priceFrom) + '+' : '-'}</td><td>${p.status === 'soldout' ? t('Sold out') : `${RE.hbar(p.unitsAvailable || 0, p.unitsTotal || 0)}<small>${unitsLeft(p)}</small>`}</td>
        <td>${esc(p.handover || '')}</td><td>${p.featured === 'yes' && p.status !== 'soldout' ? RE.tag('available', t('Featured')) : `<span class="chip">${t('In the list only')}</span>`}</td><td>${RE.tag(p.status === 'soldout' ? 'sold' : p.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', p.status))}</td></tr>`).join('')}
    </tbody></table></div></section>`;
  };

  RE.projectView = function (p) {
    const wa = RE.waLink(p), ph = p.photos || [];
    RE.modal(`${RE.dlgHead(p.name)}<div class="dlg-b">
      <div class="gallery ${ph.length > 1 ? 'multi' : ''}"><div class="g-main">${RE.projectArt(p)}</div>${ph.slice(1, 4).map((s, i) => `<div><img src="${s}" alt="${esc(p.name)} ${i + 2}"></div>`).join('')}</div>
      ${(p.videos || []).map(v => `<video class="dlg-video" src="${esc(v.url || v)}" controls playsinline preload="metadata"></video>`).join('')}
      <div class="row wrap">${RE.tag(p.status === 'soldout' ? 'sold' : p.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', p.status))}<span class="chip">${esc(L('ptype', p.ptype))} · ${esc(where(p))}</span></div>
      ${p.developer ? `<p class="sub">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
      ${RE.projStats(p)}
      ${p.payment ? `<p class="pay">${esc(p.payment)}</p>` : ''}
      ${p.description ? `<p class="note">${esc(p.description)}</p>` : ''}
    </div><footer class="dlg-f wrap">${wa ? `<a class="btn ghost" target="_blank" rel="noopener" href="${wa}">${RE.icon('chat')}WhatsApp</a>` : ''}${typeof p.lat === 'number' ? `<a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${p.lat},${p.lng}">${RE.icon('map')}${t('Google Maps')}</a>` : ''}
      <span class="grow"></span><button class="btn" data-act="openProject" data-id="${p.id}">${t('Open project file')}</button></footer>`, 'wide');
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
        { name: 'commissionPct', label: t('Commission on this project, %'), type: 'number', value: p.commissionPct != null ? p.commissionPct : RE.state.settings.commissionPct, required: true },
        { name: 'public', label: t('Public project page'), type: 'select', options: [['yes', t('On: anyone with the link can see it')], ['no', t('Off: only your team')]], value: p.public || 'yes' },
        { name: 'payment', label: t('Payment plan'), wide: true, value: p.payment, placeholder: t('20% down, the rest over 5 years') },
        { name: 'videoUrl', label: t('Video link'), type: 'url', wide: true, value: p.videoUrl, placeholder: 'https://youtube.com/watch?v=…', hint: t('YouTube, Vimeo or a direct video file') },
        { name: 'vrUrl', label: t('VR tour link'), type: 'url', wide: true, value: p.vrUrl, placeholder: 'https://kuula.co/share/…', hint: t('Matterport, Kuula, Momento360 or any 360° tour link') },
        { name: 'phone', label: t('WhatsApp number'), type: 'tel', value: p.phone, placeholder: '+964', hint: t('Leave empty to use the office number') },
        { name: 'lat', label: t('Latitude'), type: 'number', value: p.lat },
        { name: 'lng', label: t('Longitude'), type: 'number', value: p.lng },
        { name: 'photos', label: t('Photos'), type: 'photos', value: p.photos, hint: t('The first photo is the main picture on the ad'), folder: p.id || 'new' },
        { name: 'videos', label: t('Videos'), type: 'videos', value: p.videos, folder: p.id || 'new', hint: RE.canUpload() ? t('MP4 or MOV up to 50 MB each. They play on the ad screen with the sound off.') : t('Connect the office database to upload videos. Until then, use a video link below.') },
        { name: 'description', label: t('Description'), type: 'textarea', value: p.description }
      ],
      onSubmit: v => {
        if (v.unitsTotal != null && v.unitsAvailable != null && v.unitsAvailable > v.unitsTotal) return t('Units still available cannot be more than units in total.');
        if (RE.formBusy && RE.formBusy()) return t('Wait until the uploads finish, then save.');
        if (v.videoUrl && !RE.embedUrl(v.videoUrl)) return t('The video link is not a web address. It should start with https://');
        if (v.vrUrl && !RE.embedUrl(v.vrUrl)) return t('The VR link is not a web address. It should start with https://');
        if (p.id) v.id = p.id; else { v.createdAt = RE.today(); v.order = RE.state.projects.length; v.agentIds = []; }
        v.contact = (v.phone || RE.state.settings.phone || '').trim();   // the number shown on the public page
        RE.put('projects', v); RE.toast(p.id ? t('Project updated') : t('Project added'));
      },
      onDelete: p.id ? () => RE.confirm(t('Delete {n}? This cannot be undone.', { n: p.name }), t('Delete'), () => { RE.del('projects', p.id); RE.closeDlg(); RE.render(); RE.toast(t('Deleted')); }, true) : null
    });
  };

})(window.RE);
