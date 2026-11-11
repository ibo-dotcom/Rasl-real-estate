/* Rasl Estate — shared UI helpers: formatting, icons, dialogs, forms, charts */
(function (RE) {
  const t = (s, v) => RE.t(s, v);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  RE.esc = esc;

  /* ---------- formatting ---------- */
  RE.num = n => Math.round(+n || 0).toLocaleString('en-US');
  RE.money = function (n) {
    const c = RE.state.settings.currency, v = RE.num(n);
    return c === 'USD' ? '$' + v : v + ' ' + c;
  };
  RE.short = function (n) {
    n = +n || 0; const a = Math.abs(n);
    const f = (x, s) => (Math.round(x * 10) / 10).toString() + s;
    return a >= 1e9 ? f(n / 1e9, 'B') : a >= 1e6 ? f(n / 1e6, 'M') : a >= 1e3 ? f(n / 1e3, 'k') : String(Math.round(n));
  };
  RE.moneyShort = n => (RE.state.settings.currency === 'USD' ? '$' : '') + RE.short(n);
  function fmt(opts) {
    try { return new Intl.DateTimeFormat(RE.locale(), opts); } catch (e) { return new Intl.DateTimeFormat('en-GB', opts); }
  }
  RE.date = (s, opts) => s ? fmt(opts || { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(s + 'T12:00:00')) : '';
  RE.dayMonth = s => RE.date(s, { day: 'numeric', month: 'short' });
  RE.monthName = (y, m, style) => fmt({ month: style || 'short' }).format(new Date(y, m, 1, 12));
  RE.relDay = function (s) {
    if (!s) return '';
    const diff = Math.round((new Date(s + 'T12:00:00') - new Date(RE.today() + 'T12:00:00')) / 864e5);
    if (diff === 0) return t('Today');
    if (diff === 1) return t('Tomorrow');
    if (diff === -1) return t('Yesterday');
    return diff < 0 ? t('{n} days ago', { n: -diff }) : t('in {n} days', { n: diff });
  };
  RE.initials = name => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  /* ---------- icons (24px stroke set) ---------- */
  const IC = {
    dashboard: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/>',
    leads: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.200a3.2 3.2 0 010 5.600M17.5 14.300c2.1.8 3.5 2.9 3.5 5.7"/>',
    property: '<path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6M2 20h20"/>',
    map: '<path d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0118.5 10c0 4.9-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    rewards: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.500L7 21l5-2.5 5 2.5-1.5-7.5"/>',
    join: '<path d="M12 20s-7.5-4.6-7.5-10.200A4.3 4.3 0 0112 7.200a4.3 4.3 0 017.5 2.600C19.5 15.4 12 20 12 20z"/>',
    team: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 13h18"/>',
    market: '<path d="M3 20h18M5 16l4.5-5 3.5 3 6-8M15 6h4v4"/>',
    ads: '<path d="M4 10v4h3l8 4.500v-13L7 10zM18 9.500a4 4 0 010 5M9 14.500V19"/>',
    reports: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
    office: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.5 12H21M5.6 5.600l1.8 1.800M16.6 16.600l1.8 1.800M18.4 5.600l-1.8 1.800M7.4 16.600l-1.8 1.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2M12 19.500v2M2.5 12h2M19.5 12h2M5.3 5.300l1.4 1.400M17.3 17.300l1.4 1.400M18.7 5.300l-1.4 1.400M6.7 17.300l-1.4 1.4"/>',
    moon: '<path d="M20 14.500A8 8 0 019.5 4a8 8 0 1010.5 10.500z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    phone: '<path d="M5 4h4l1.5 4.500L8 10a12 12 0 006 6l1.5-2.500L20 15v4a1.5 1.5 0 01-1.5 1.500C10.5 20.5 3.5 13.5 3.5 5.500A1.5 1.5 0 015 4z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.500l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.500A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.500v9A1.5 1.5 0 005.5 16H8"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.900l7.6-3.800M8.2 13.100l7.6 3.8"/>',
    check: '<path d="M5 12.500l4.5 4.500L19 7.5"/>',
    more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.500M5 20h14"/>',
    upload: '<path d="M12 16V5M7.5 9L12 4.5 16.5 9M5 20h14"/>',
    print: '<path d="M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z"/>',
    board: '<path d="M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v11h-4z"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    zoomIn: '<path d="M12 6v12M6 12h12"/>', zoomOut: '<path d="M6 12h12"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.500l3.5 2"/>'
  };
  /* The Rasl Estate mark: a gabled roof that turns into the bowl of an R, with one lit window,
     on a tile cut into the blue facets and white lines of the office wall. */
  RE.logo = cls => `<svg class="logo-svg ${cls || ''}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" class="lg-tile"/><path d="M0 0H31L0 27Z" class="lg-f1"/><path d="M48 48H15L48 19Z" class="lg-f2"/><path d="M48 0V15L35 0Z" class="lg-f3"/><path d="M31 0L0 27M15 48L48 19M35 0L48 15" fill="none" class="lg-rule" stroke-width="1"/><path d="M15 36V19.5L24 12l9 7.5v3.7c0 4.3-3.4 7.6-7.7 7.6H15M25.3 30.8L33.5 36" fill="none" class="lg-ink" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="21.9" y="19.4" width="4.2" height="4.2" rx=".8" class="lg-win"/></svg>`;
  IC.home = '<path d="M4 11l8-7 8 7M6 9.500V20h12V9.500M10 20v-5h4v5"/>';
  IC.projects = '<path d="M3 20h18M5 20V9l5-3v14M10 20V4l9 4v12M13 9h3M13 12.500h3M13 16h3"/>';
  IC.folder = '<path d="M3.5 6.500A1.5 1.5 0 015 5h4.500l2 2.500H19a1.5 1.5 0 011.5 1.500v8.500A1.5 1.5 0 0119 19H5a1.5 1.5 0 01-1.5-1.500z"/>';
  IC.folderOpen = '<path d="M3.5 17.500V6.500A1.5 1.5 0 015 5h4.500l2 2.500H18a1.5 1.5 0 011.5 1.500V10M3.5 17.500L6 11h15.500L19 17.500a1.5 1.5 0 01-1.4 1H5a1.5 1.5 0 01-1.5-1z"/>';
  IC.screen = '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>';
  IC.prev = '<path d="M15 5l-7 7 7 7"/>'; IC.next = '<path d="M9 5l7 7-7 7"/>';
  IC.vr = '<path d="M3 8.5A1.5 1.5 0 014.5 7h15A1.5 1.5 0 0121 8.5v7a1.5 1.5 0 01-1.5 1.5h-4l-2-2.5h-3L8.5 17h-4A1.5 1.5 0 013 15.5z"/><circle cx="8" cy="11.5" r="1.6"/><circle cx="16" cy="11.5" r="1.6"/>';
  IC.play = '<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5l5 3.5-5 3.5z"/>';
  IC.plan = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
  IC.project = '<path d="M3 20h18M5 20V9l5-3v14M10 20V4l9 4v12"/>';
  IC.pause = '<path d="M9 5v14M15 5v14"/>';
  IC.muted = '<path d="M4 10v4h3l5 4V6L7 10zM16 9.5l5 5M21 9.5l-5 5"/>';
  IC.sound = '<path d="M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/>';
  IC.cloud = '<path d="M7 18.5h10.5a4 4 0 00.6-7.95A6 6 0 006.6 9.8 4.4 4.4 0 007 18.5z"/>';
  IC.logout = '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>';
  IC.search = '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.500 4.500"/>';
  IC.mic = '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.500a6.500 6.500 0 0013 0M12 18v3"/>';
  IC.pin = '<path d="M12 21s6.500-6 6.500-11a6.500 6.500 0 00-13 0c0 5 6.500 11 6.500 11z"/><circle cx="12" cy="10" r="2.300"/>';
  IC.target = '<circle cx="12" cy="12" r="6.500"/><circle cx="12" cy="12" r="2"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3"/>';
  IC.route = '<circle cx="6" cy="18" r="2.300"/><circle cx="18" cy="6" r="2.300"/><path d="M8.300 18H15a3.500 3.500 0 000-7H9a3.500 3.500 0 010-7h6.700"/>';
  RE.icon = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

  RE.micBtn = target => `<button type="button" class="iconbtn mic" data-act="askMic" data-for="${target}" aria-label="${esc(t('Speak'))}" title="${esc(t('Speak'))}">${RE.icon('mic')}</button>`;

  /* ---------- small components ---------- */
  const TAGC = { available: 'good', reserved: 'warn', sold: 'mute', rented: 'mute', new: 'info', contacted: 'info', followup: 'warn', visit: 'info', negotiation: 'warn', won: 'good', lost: 'mute', running: 'good', paused: 'warn', ended: 'mute', joined: 'good', invited: 'warn' };
  RE.tag = (k, label) => `<span class="tag tag-${TAGC[k] || 'mute'}">${esc(label)}</span>`;
  RE.avatar = (name, color, cls) => `<span class="av ${cls || ''}" style="background:${esc(color || '#5A6B63')}" title="${esc(name)}">${esc(RE.initials(name))}</span>`;
  RE.agentAv = (id, cls) => { const a = RE.get('agents', id); return a ? RE.avatar(a.name, a.color, cls) : ''; };
  RE.agentName = id => { const a = RE.get('agents', id); return a ? a.name : t('Unassigned'); };
  RE.plot = p => p.plot ? `<span class="plotno">${esc(p.plot)}</span>` : '';
  RE.place = p => [p.district, p.city].filter(Boolean).join(', ');
  RE.priceOf = p => RE.money(p.price) + (p.purpose === 'rent' ? ' <span class="per">/ ' + t('month') + '</span>' : '');
  RE.empty = (msg, act, label) => `<div class="empty"><p>${esc(msg)}</p>${act ? `<button class="btn" data-act="${act}">${RE.icon('plus')}${esc(label)}</button>` : ''}</div>`;
  RE.opts = (list, sel) => list.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(sel == null ? '' : sel) ? ' selected' : ''}>${esc(o[1])}</option>`).join('');

  /* A listing with no photo gets a survey-style parcel sketch drawn from its own id and type. */
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  RE.sketch = function (p) {
    let h = hash(p.id + (p.plot || ''));
    const r = n => { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; return (h % 1000) / 1000 * n; };
    const x1 = 46 + r(18), y1 = 30 + r(12), x2 = 250 - r(22), y2 = 26 + r(16), x3 = 262 - r(20), y3 = 150 - r(14), x4 = 40 + r(20), y4 = 156 - r(12);
    const poly = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
    const cx = (x1 + x2 + x3 + x4) / 4, cy = (y1 + y2 + y3 + y4) / 4;
    let b = '';
    if (p.type === 'villa' || p.type === 'house') {
      const w = 74 + r(26), d = 44 + r(14);
      b = `<rect x="${cx - w / 2}" y="${cy - d / 2}" width="${w}" height="${d}" class="sk-b"/><rect x="${cx - w / 2 + w * 0.55}" y="${cy - d / 2 - 14}" width="${w * 0.36}" height="14" class="sk-b"/>`;
    } else if (p.type === 'apartment') {
      const w = 96, d = 58; let g = '';
      for (let i = 1; i < 4; i++) g += `<path d="M${cx - w / 2 + i * w / 4} ${cy - d / 2}v${d}" class="sk-l"/>`;
      b = `<rect x="${cx - w / 2}" y="${cy - d / 2}" width="${w}" height="${d}" class="sk-b"/>${g}<path d="M${cx - w / 2} ${cy}h${w}" class="sk-l"/>`;
    } else if (p.type === 'commercial') {
      b = `<rect x="${cx - 60}" y="${cy - 16}" width="120" height="40" class="sk-b"/><path d="M${cx - 60} ${cy - 4}h120" class="sk-l"/>`;
    }
    const area = p.area ? `<text x="${cx}" y="${y4 + 22}" text-anchor="middle" class="sk-t">${RE.num(p.area)} m²</text>` : '';
    return `<svg class="sketch" viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(t('Plot sketch'))}">
      <rect width="300" height="190" class="sk-bg"/>
      <path d="M0 ${y4 + 6}L300 ${y3 + 12}M${x1 - 26} 0L${x4 - 30} 190" class="sk-road"/>
      <polygon points="${poly}" class="sk-p"/>${b}
      <circle cx="${x1}" cy="${y1}" r="2.5" class="sk-m"/><circle cx="${x2}" cy="${y2}" r="2.5" class="sk-m"/><circle cx="${x3}" cy="${y3}" r="2.5" class="sk-m"/><circle cx="${x4}" cy="${y4}" r="2.5" class="sk-m"/>
      ${area}
      <g transform="translate(276 26)"><path d="M0 12V-10M-4 -4L0 -11 4 -4" class="sk-n"/><text y="24" text-anchor="middle" class="sk-t">N</text></g>
    </svg>`;
  };
  RE.thumb = (p, i) => (p.photos && p.photos[i || 0]) ? `<img src="${p.photos[i || 0]}" alt="${esc(p.title)}" loading="lazy">` : RE.sketch(p);

  /* ---------- toast ---------- */
  let toastT;
  RE.toast = function (msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600);
  };

  /* ---------- dialogs ---------- */
  const dlg = () => document.getElementById('dlg');
  RE.modal = function (html, cls) {
    const d = dlg();
    d.className = 'dlg ' + (cls || '');
    d.innerHTML = html;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
  };
  RE.closeDlg = () => { const d = dlg(); if (d.open) d.close(); d.innerHTML = ''; };
  RE.dlgHead = title => `<header class="dlg-h"><h2>${esc(title)}</h2><button type="button" class="iconbtn" data-act="closeDlg" aria-label="${esc(t('Close'))}">${RE.icon('x')}</button></header>`;

  RE.confirm = function (msg, okLabel, fn, danger) {
    const d = document.getElementById('dlg2');
    d.innerHTML = `<div class="confirm"><p>${esc(msg)}</p><div class="row end"><button type="button" class="btn ghost" id="c-no">${esc(t('Cancel'))}</button><button type="button" class="btn ${danger ? 'danger' : ''}" id="c-yes">${esc(okLabel)}</button></div></div>`;
    d.showModal();
    d.querySelector('#c-no').onclick = () => d.close();
    d.querySelector('#c-yes').onclick = () => { d.close(); fn(); };
  };

  /* ---------- forms ---------- */
  function shrink(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const img = new Image();
        img.onerror = rej;
        img.onload = () => {
          const k = Math.min(1, 1100 / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', 0.72));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  function toBlob(file, max, q) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(b => b ? res(b) : rej(new Error('image')), 'image/jpeg', q);
      };
      img.src = url;
    });
  }
  let uploading = 0;
  RE.formBusy = () => uploading > 0;

  RE.form = function (cfg) {
    const photos = {}, videos = {};
    const field = f => {
      const id = 'f-' + f.name, v = f.value == null ? '' : f.value, req = f.required ? ' required' : '';
      let c;
      if (f.type === 'select') c = `<select id="${id}" name="${f.name}"${req}>${RE.opts(f.options, v)}</select>`;
      else if (f.type === 'textarea') c = `<textarea id="${id}" name="${f.name}" rows="3">${esc(v)}</textarea>`;
      else if (f.type === 'photos') {
        photos[f.name] = (f.value || []).slice();
        c = `<div class="photos" id="${id}-list"></div><label class="btn ghost filebtn">${RE.icon('upload')}${esc(t('Add photos'))}<input type="file" id="${id}" accept="image/*" multiple data-photos="${f.name}"></label>`;
      } else if (f.type === 'videos') {
        videos[f.name] = (f.value || []).slice();
        c = `<div class="photos" id="${id}-list"></div>${RE.canUpload() ? `<label class="btn ghost filebtn">${RE.icon('upload')}${esc(t('Add videos'))}<input type="file" id="${id}" accept="video/mp4,video/webm,video/quicktime" multiple></label>` : ''}`;
      } else c = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}"${req}${f.type === 'number' ? ' step="any" inputmode="decimal"' : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''} autocomplete="off">`;
      return `<div class="fld ${f.wide || f.type === 'textarea' || f.type === 'photos' || f.type === 'videos' ? 'wide' : ''}"><label for="${id}">${esc(f.label)}${f.required ? ' <i>*</i>' : ''}</label>${c}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</div>`;
    };
    RE.modal(`<form id="frm" novalidate>${RE.dlgHead(cfg.title)}
      <div class="dlg-b"><div class="fgrid">${cfg.fields.map(field).join('')}</div><p class="ferr" id="ferr" hidden></p></div>
      <footer class="dlg-f">${cfg.onDelete ? `<button type="button" class="btn ghost danger-t" id="f-del">${RE.icon('trash')}${esc(t('Delete'))}</button>` : ''}<span class="grow"></span>
      <button type="button" class="btn ghost" data-act="closeDlg">${esc(t('Cancel'))}</button><button class="btn" type="submit">${esc(cfg.submit || t('Save'))}</button></footer></form>`);
    const frm = document.getElementById('frm');
    const drawPhotos = name => {
      document.getElementById('f-' + name + '-list').innerHTML = photos[name].map((src, i) => `<span class="ph"><img src="${src}" alt=""><button type="button" data-rm="${i}" aria-label="${esc(t('Remove'))}">${RE.icon('x')}</button></span>`).join('');
    };
    Object.keys(photos).forEach(name => {
      drawPhotos(name);
      document.getElementById('f-' + name + '-list').onclick = e => {
        const b = e.target.closest('[data-rm]'); if (!b) return;
        photos[name].splice(+b.dataset.rm, 1); drawPhotos(name);
      };
      document.getElementById('f-' + name).onchange = async e => {
        const fld = cfg.fields.find(x => x.name === name), list = document.getElementById('f-' + name + '-list');
        for (const file of Array.from(e.target.files).slice(0, 12)) {
          if (RE.canUpload && RE.canUpload()) {
            // connected: store a sharp copy in the office media storage and keep only its address
            uploading++; list.insertAdjacentHTML('beforeend', '<span class="ph up" aria-label="…"><i></i></span>');
            try { photos[name].push(await RE.uploadMedia(await toBlob(file, 1800, 0.82), fld.folder || 'misc', 'jpg', 'image/jpeg')); }
            catch (err) { RE.toast(t('A photo could not be uploaded. Check the connection and try again.')); }
            uploading--;
          } else {
            try { photos[name].push(await shrink(file)); } catch (err) { RE.toast(t('That file could not be read as an image.')); }
          }
          drawPhotos(name);
        }
        e.target.value = ''; drawPhotos(name);
      };
    });
    const drawVideos = name => {
      document.getElementById('f-' + name + '-list').innerHTML = videos[name].map((v, i) => `<span class="ph vid"><video src="${esc(v.url || v)}" muted preload="metadata"></video><button type="button" data-rm="${i}" aria-label="${esc(t('Remove'))}">${RE.icon('x')}</button></span>`).join('');
    };
    Object.keys(videos).forEach(name => {
      drawVideos(name);
      const list = document.getElementById('f-' + name + '-list'), input = document.getElementById('f-' + name), fld = cfg.fields.find(x => x.name === name);
      list.onclick = e => { const b = e.target.closest('[data-rm]'); if (!b) return; videos[name].splice(+b.dataset.rm, 1); drawVideos(name); };
      if (!input) return;
      input.onchange = async e => {
        for (const file of Array.from(e.target.files).slice(0, 6)) {
          if (file.size > 50 * 1024 * 1024) { RE.toast(t('{f} is larger than 50 MB. Shorten or compress it, then try again.', { f: file.name })); continue; }
          const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
          uploading++;
          list.insertAdjacentHTML('beforeend', `<span class="ph up wide-up"><i></i><small>${esc(t('Uploading {f}…', { f: file.name }))}</small></span>`);
          try { videos[name].push({ url: await RE.uploadMedia(file, fld.folder || 'misc', ext, file.type || 'video/mp4'), name: file.name }); RE.toast(t('{f} uploaded', { f: file.name })); }
          catch (err) { RE.toast(t('{f} could not be uploaded. Check the connection and try again.', { f: file.name })); }
          uploading--; drawVideos(name);
        }
        e.target.value = '';
      };
    });
    if (cfg.onDelete) document.getElementById('f-del').onclick = cfg.onDelete;
    frm.onsubmit = e => {
      e.preventDefault();
      const out = {}, err = document.getElementById('ferr');
      let bad = null;
      cfg.fields.forEach(f => {
        if (f.type === 'photos') { out[f.name] = photos[f.name]; return; }
        if (f.type === 'videos') { out[f.name] = videos[f.name]; return; }
        const el = frm.elements[f.name]; let v = el.value.trim();
        el.classList.remove('bad');
        if (f.required && !v) { bad = bad || f; el.classList.add('bad'); }
        out[f.name] = f.type === 'number' ? (v === '' ? null : +v) : v;
      });
      if (bad) { err.textContent = t('Fill in: {f}', { f: bad.label }); err.hidden = false; frm.elements[bad.name].focus(); return; }
      const msg = cfg.onSubmit(out);
      if (typeof msg === 'string') { err.textContent = msg; err.hidden = false; return; }
      RE.closeDlg(); RE.render();
    };
    const first = frm.querySelector('input:not([type=file]),select,textarea');
    if (first && !cfg.noFocus) first.focus();
  };

  /* ---------- files out ---------- */
  RE.embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  RE.copy = function (text, okMsg) {
    const fallback = () => RE.modal(`${RE.dlgHead(t('Copy this text'))}<div class="dlg-b"><textarea class="copybox" rows="10" readonly>${esc(text)}</textarea></div>`);
    try { navigator.clipboard.writeText(text).then(() => RE.toast(okMsg || t('Copied')), fallback); } catch (e) { fallback(); }
  };
  RE.fileOut = function (name, text, mime) {
    if (RE.embedded) { RE.copy(text, t('Copied. Paste it into a file named {n}', { n: name })); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    RE.toast(t('Saved {n}', { n: name }));
  };
  RE.csv = rows => '﻿' + rows.map(r => r.map(c => { c = c == null ? '' : String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(',')).join('\n');

  /* ---------- charts ---------- */
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 4 ? 4 : m <= 5 ? 5 : m <= 8 ? 8 : 10) * p;
  }
  // Column chart: one series, one axis, optional reference line. data: [{label, long, value, note}]
  RE.columns = function (data, o) {
    o = o || {};
    const top = niceMax(Math.max(o.ref || 0, ...data.map(d => d.value)));
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    const pc = v => (v / top * 100).toFixed(2);
    return `<div class="chart" role="img" aria-label="${esc(o.label || '')}">
      <div class="chart-plot">
        ${ticks.map(k => `<div class="gl" style="bottom:${k * 100}%"><span>${RE.short(top * k)}</span></div>`).join('')}
        ${o.ref ? `<div class="refl" style="bottom:${pc(o.ref)}%"><span>${esc(o.refLabel)} ${RE.moneyShort(o.ref)}</span></div>` : ''}
        <div class="cols">${data.map(d => `<div class="col${d.now ? ' now' : ''}" tabindex="0">
          <div class="bar" style="height:${pc(d.value)}%"></div>
          <div class="tip"><b>${esc(d.long || d.label)}</b><span>${RE.money(d.value)}</span>${d.note ? `<small>${esc(d.note)}</small>` : ''}</div>
        </div>`).join('')}</div>
      </div>
      <div class="chart-x">${data.map(d => `<span><em class="full">${esc(d.label)}</em><em class="tiny">${esc(d.tiny || d.label)}</em></span>`).join('')}</div>
    </div>`;
  };
  RE.hbar = (v, max, cls) => `<span class="hbar ${cls || ''}"><i style="width:${max && v > 0 ? Math.max(1, v / max * 100).toFixed(1) : 0}%"></i></span>`;
})(window.RE);
