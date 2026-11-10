/* Rasl Estate — routing, actions, forms */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), L = (g, k) => RE.label(g, k);
  const ROUTES = ['home', 'projects', 'dashboard', 'leads', 'property', 'map', 'rewards', 'join', 'team', 'market', 'ads', 'reports', 'office'];
  // Sections live in folders, grouped by the work they belong to. Each folder is one button.
  const GROUPS = [
    { id: 'sales', name: 'Sales', icon: 'folder', routes: ['dashboard', 'leads', 'property', 'map'] },
    { id: 'marketing', name: 'Marketing', icon: 'folder', routes: ['projects', 'ads', 'market'] },
    { id: 'people', name: 'Team', icon: 'folder', routes: ['team', 'rewards', 'join'] },
    { id: 'admin', name: 'Office', icon: 'folder', routes: ['reports', 'office'] }
  ];
  const groupOf = r => GROUPS.find(g => g.routes.indexOf(r) >= 0);
  const TITLES = { home: 'Projects showcase', projects: 'Residential projects', dashboard: 'Dashboard', leads: 'Leads', property: 'Property', map: 'Map', rewards: 'Rewards', join: 'Join & Charity', team: 'Team', market: 'Market', ads: 'Ads', reports: 'Reports', office: 'Office' };
  RE.ui = { route: 'home', open: {}, period: 'year', leadView: 'board', leadStage: 'active', repRange: 'year' };
  const S = () => RE.state, ui = RE.ui;
  const agentOpts = () => [['', t('Unassigned')]].concat(S().agents.map(a => [a.id, a.name]));
  const o = (list, group) => list.map(k => [k, L(group, k)]);

  /* ---------- shell ---------- */
  function applyTheme() {
    const th = S().settings.theme, root = document.documentElement;
    if (th === 'light' || th === 'dark') root.setAttribute('data-theme', th); else root.removeAttribute('data-theme');
  }
  const isDark = () => { const th = S().settings.theme; return th === 'dark' || (th !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches); };

  function shell() {
    const st = S().settings, due = RE.dueLeads().length;
    document.documentElement.lang = st.lang === 'ku' ? 'ckb' : st.lang;
    document.documentElement.dir = RE.dir();
    document.title = st.office || 'Rasl Estate';
    const link = (r, cls) => `<a href="#${r}" class="${cls || ''}${ui.route === r ? ' on' : ''}" ${ui.route === r ? 'aria-current="page"' : ''}>${RE.icon(r)}<span>${t(TITLES[r])}</span>${r === 'leads' && due ? `<i class="badge">${due}</i>` : ''}</a>`;
    const cur = groupOf(ui.route);
    document.getElementById('side-nav').innerHTML = link('home') + GROUPS.map(g => {
      const open = !!ui.open[g.id] || (cur === g && ui.open[g.id] !== false), n = g.routes.indexOf('leads') >= 0 ? due : 0;
      return `<div class="nav-group${open ? ' open' : ''}${cur === g ? ' has-on' : ''}"><button class="nav-folder" data-act="toggleGroup" data-g="${g.id}" aria-expanded="${open}">${RE.icon(open ? 'folderOpen' : 'folder')}<span>${t(g.name)}</span>${n && !open ? `<i class="badge">${n}</i>` : ''}<em class="count">${g.routes.length}</em></button>
        <div class="nav-items"${open ? '' : ' hidden'}>${g.routes.map(r => link(r)).join('')}</div></div>`;
    }).join('');
    document.getElementById('brand-name').textContent = st.office || 'Rasl Estate';
    document.querySelector('.wordmark small').textContent = t('Real estate office');
    document.querySelectorAll('.logo').forEach(el => { if (!el.firstChild) el.innerHTML = RE.logo(); });
    document.getElementById('tabbar').innerHTML = `<a href="#home" class="${ui.route === 'home' ? 'on' : ''}">${RE.icon('home')}<span>${t('Home')}</span></a>` + GROUPS.map(g => `<button data-act="groupSheet" data-g="${g.id}" class="${cur === g ? 'on' : ''}">${RE.icon('folder')}<span>${t(g.name)}</span>${g.routes.indexOf('leads') >= 0 && due ? `<i class="badge">${due}</i>` : ''}</button>`).join('');
    document.getElementById('page-title').textContent = t(TITLES[ui.route]);
    document.getElementById('page-date').textContent = RE.date(RE.today(), { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('top-actions').innerHTML = `${syncChip()}
      <select id="lang" data-change="setLang" aria-label="${t('Language')}">${RE.opts([['en', 'English'], ['ar', 'العربية'], ['ku', 'کوردی']], st.lang)}</select>
      <button class="iconbtn" data-act="toggleTheme" aria-label="${isDark() ? t('Switch to light') : t('Switch to dark')}">${RE.icon(isDark() ? 'sun' : 'moon')}</button>
      <button class="btn" data-act="newMenu">${RE.icon('plus')}<span>${t('New')}</span></button>`;
  }

  function syncChip() {
    const C = RE.cloud, s = C.status;
    if (s === 'off') return '';
    const label = { signedout: t('Sign in'), nooffice: t('Set up office'), saving: t('Saving'), synced: t('Saved'), offline: t('Not saved yet') }[s] || '';
    const title = C.office ? C.office.name : t('Office database');
    return `<button class="sync s-${s}" data-act="nav" data-to="office" title="${esc(title)}">${s === 'signedout' || s === 'nooffice' ? RE.icon('cloud') : '<i></i>'}<span>${esc(label)}</span></button>`;
  }

  RE.render = function () {
    const a = document.activeElement, keep = a && a.id && a.closest('#view') ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null;
    shell();
    const view = document.getElementById('view');
    view.className = 'view v-' + ui.route;
    view.innerHTML = RE.views[ui.route]();
    if (keep) { const el = document.getElementById(keep.id); if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch (e) { /* not a text input */ } } }
    if (RE.after[ui.route]) RE.after[ui.route]();
    if (RE.storageFailed) { RE.storageFailed = false; RE.toast(t('This browser refused to save. Save a backup from Office so nothing is lost.')); }
  };

  function go(r) {
    if (ROUTES.indexOf(r) < 0) r = 'home';
    const changed = ui.route !== r; ui.route = r;
    if (location.hash.slice(1) !== r) { try { history.replaceState(null, '', '#' + r); } catch (e) { location.hash = r; } }
    RE.render();
    if (changed) window.scrollTo(0, 0);
  }
  RE.go = go;

  /* ---------- forms ---------- */
  function leadForm(l) {
    l = l || { want: 'buy', type: 'villa', stage: 'new', source: 'walkin', nextFollowUp: RE.addDays(RE.today(), 1) };
    RE.form({
      title: l.id ? t('Edit lead') : t('New lead'),
      fields: [
        { name: 'name', label: t('Full name'), required: true, value: l.name },
        { name: 'phone', label: t('Phone'), type: 'tel', value: l.phone, placeholder: '+964' },
        { name: 'want', label: t('Wants to'), type: 'select', options: o(['buy', 'rent'], 'want'), value: l.want },
        { name: 'type', label: t('Property type'), type: 'select', options: o(RE.TYPES, 'type'), value: l.type },
        { name: 'budget', label: t('Budget'), type: 'number', value: l.budget, hint: t('Per month if renting') },
        { name: 'city', label: t('City'), value: l.city },
        { name: 'district', label: t('District'), value: l.district },
        { name: 'source', label: t('Came from'), type: 'select', options: o(RE.SOURCES, 'source'), value: l.source },
        { name: 'stage', label: t('Stage'), type: 'select', options: o(RE.STAGES, 'stage'), value: l.stage },
        { name: 'agentId', label: t('Agent'), type: 'select', options: agentOpts(), value: l.agentId },
        { name: 'nextFollowUp', label: t('Next follow-up'), type: 'date', value: l.nextFollowUp },
        { name: 'notes', label: t('Notes'), type: 'textarea', value: l.notes }
      ],
      onSubmit: v => {
        if (l.id) v.id = l.id; else { v.createdAt = RE.today(); v.lastContact = ''; }
        RE.put('leads', v); RE.toast(l.id ? t('Lead updated') : t('Lead added'));
      },
      onDelete: l.id ? () => RE.confirm(t('Delete {n}? This cannot be undone.', { n: l.name }), t('Delete'), () => { RE.del('leads', l.id); RE.closeDlg(); RE.render(); RE.toast(t('Lead deleted')); }, true) : null
    });
  }

  function leadView(l) {
    const props = RE.propsFor(l), wa = (l.phone || '').replace(/[^\d]/g, '');
    RE.modal(`${RE.dlgHead(l.name)}<div class="dlg-b">
      <div class="row wrap">${RE.tag(l.stage, L('stage', l.stage))}<span class="chip">${L('want', l.want)} · ${L('type', l.type)}</span><span class="chip">${L('source', l.source)}</span><span class="grow"></span><strong class="price">${RE.money(l.budget)}</strong></div>
      <dl class="dl two">
        <dt>${t('Phone')}</dt><dd class="num sel">${esc(l.phone || '-')}</dd>
        <dt>${t('Area')}</dt><dd>${esc([l.district, l.city].filter(Boolean).join(', ') || '-')}</dd>
        <dt>${t('Agent')}</dt><dd>${esc(RE.agentName(l.agentId))}</dd>
        <dt>${t('Last contact')}</dt><dd>${l.lastContact ? RE.date(l.lastContact) : '-'}</dd>
        <dt>${t('Next follow-up')}</dt><dd>${l.nextFollowUp ? RE.date(l.nextFollowUp) + ' (' + RE.relDay(l.nextFollowUp) + ')' : '-'}</dd>
      </dl>
      ${l.notes ? `<p class="note">${esc(l.notes)}</p>` : ''}
      <h3 class="sec">${t('Listings that fit')}</h3>
      ${props.length ? `<ul class="rows">${props.map(p => `<li class="click" data-act="viewProp" data-id="${p.id}" tabindex="0"><span class="mini-img">${RE.thumb(p)}</span><span class="grow"><b>${esc(p.title)}</b><small>${RE.plot(p)} ${esc(RE.place(p))}</small></span><b class="num">${RE.priceOf(p)}</b></li>`).join('')}</ul>` : `<p class="quiet">${t('No available listing fits this budget and type right now.')}</p>`}
    </div><footer class="dlg-f wrap">
      ${wa ? `<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${wa}">${RE.icon('chat')}WhatsApp</a><a class="btn ghost" href="tel:${esc(l.phone)}">${RE.icon('phone')}${t('Call')}</a>` : ''}
      <span class="grow"></span><button class="btn ghost" data-act="editLead" data-id="${l.id}">${RE.icon('edit')}${t('Edit')}</button>
      ${RE.isActive(l) ? `<button class="btn ghost" data-act="logContact" data-id="${l.id}">${t('Log contact')}</button><button class="btn" data-act="closeDeal" data-id="${l.id}">${t('Close deal')}</button>` : ''}</footer>`);
  }

  function logContact(l) {
    RE.form({
      title: t('Contact with {n}', { n: l.name }), submit: t('Save contact'),
      fields: [
        { name: 'lastContact', label: t('Spoke on'), type: 'date', value: RE.today(), required: true },
        { name: 'nextFollowUp', label: t('Next follow-up'), type: 'date', value: RE.addDays(RE.today(), 3) },
        { name: 'stage', label: t('Stage'), type: 'select', options: o(RE.STAGES.filter(s => s !== 'won'), 'stage'), value: l.stage === 'new' ? 'contacted' : l.stage },
        { name: 'add', label: t('What was said'), type: 'textarea' }
      ],
      onSubmit: v => {
        const notes = v.add ? ((l.notes ? l.notes + '\n' : '') + RE.dayMonth(v.lastContact) + ': ' + v.add) : l.notes;
        RE.put('leads', { id: l.id, lastContact: v.lastContact, nextFollowUp: v.nextFollowUp, stage: v.stage, notes });
        RE.toast(t('Contact logged'));
      }
    });
  }

  function dealForm(l) {
    const st = S().settings, fits = RE.propsFor(l), all = S().properties.filter(p => p.status === 'available' || p.status === 'reserved');
    const first = fits[0], amount = first ? first.price : l.budget;
    RE.form({
      title: t('Close deal with {n}', { n: l.name }), submit: t('Record deal'),
      fields: [
        { name: 'propertyId', label: t('Property'), type: 'select', wide: true, options: [['', t('Not one of my listings')]].concat(all.map(p => [p.id, p.title + (p.plot ? ' (' + p.plot + ')' : '')])), value: first ? first.id : '' },
        { name: 'amount', label: l.want === 'rent' ? t('Contract value') : t('Sale price'), type: 'number', required: true, value: amount },
        { name: 'commission', label: t('Commission earned'), type: 'number', required: true, value: Math.round((amount || 0) * (st.commissionPct || 0) / 100), hint: t('{p}% is your usual rate', { p: st.commissionPct }) },
        { name: 'date', label: t('Date'), type: 'date', required: true, value: RE.today() },
        { name: 'agentId', label: t('Agent'), type: 'select', options: agentOpts(), value: l.agentId },
        { name: 'mark', label: t('Then mark the property'), type: 'select', wide: true, options: [[l.want === 'rent' ? 'rented' : 'sold', L('status', l.want === 'rent' ? 'rented' : 'sold')], ['', t('Leave as it is')]], value: l.want === 'rent' ? 'rented' : 'sold' }
      ],
      onSubmit: v => {
        const p = v.propertyId && RE.get('properties', v.propertyId);
        RE.put('deals', { client: l.name, title: p ? p.title : L('type', l.type) + (l.district ? ', ' + l.district : ''), amount: v.amount, commission: v.commission, date: v.date, kind: l.want === 'rent' ? 'rent' : 'sale', agentId: v.agentId, leadId: l.id, propertyId: v.propertyId });
        RE.put('leads', { id: l.id, stage: 'won', lastContact: v.date, nextFollowUp: '' });
        if (p && v.mark) RE.put('properties', { id: p.id, status: v.mark });
        RE.toast(t('Deal recorded. {m} commission added.', { m: RE.money(v.commission) }));
      }
    });
  }

  function propForm(p) {
    p = p || { type: 'villa', purpose: 'sale', status: 'available', units: 1, city: 'Erbil', expiresAt: RE.addDays(RE.today(), 90), photos: [] };
    RE.form({
      title: p.id ? t('Edit property') : t('New property'),
      fields: [
        { name: 'title', label: t('Name'), required: true, value: p.title },
        { name: 'plot', label: t('Plot number'), value: p.plot, placeholder: 'E-1024' },
        { name: 'type', label: t('Type'), type: 'select', options: o(RE.TYPES, 'type'), value: p.type },
        { name: 'purpose', label: t('Offered'), type: 'select', options: o(['sale', 'rent'], 'purpose'), value: p.purpose },
        { name: 'price', label: t('Price'), type: 'number', required: true, value: p.price, hint: t('Per month if for rent') },
        { name: 'status', label: t('Status'), type: 'select', options: o(RE.STATUSES, 'status'), value: p.status },
        { name: 'city', label: t('City'), value: p.city },
        { name: 'district', label: t('District'), value: p.district },
        { name: 'area', label: t('Area, m²'), type: 'number', value: p.area },
        { name: 'units', label: t('Units'), type: 'number', value: p.units },
        { name: 'beds', label: t('Bedrooms'), type: 'number', value: p.beds },
        { name: 'baths', label: t('Bathrooms'), type: 'number', value: p.baths },
        { name: 'built', label: t('Year built'), type: 'number', value: p.built },
        { name: 'views', label: t('Listing views'), type: 'number', value: p.views, hint: t('From the portal where it is advertised') },
        { name: 'expiresAt', label: t('Listing ends'), type: 'date', value: p.expiresAt },
        { name: 'agentId', label: t('Agent'), type: 'select', options: agentOpts(), value: p.agentId },
        { name: 'lat', label: t('Latitude'), type: 'number', value: p.lat, hint: t('Or place it by tapping the map') },
        { name: 'lng', label: t('Longitude'), type: 'number', value: p.lng },
        { name: 'photos', label: t('Photos'), type: 'photos', value: p.photos },
        { name: 'notes', label: t('Notes'), type: 'textarea', value: p.notes }
      ],
      onSubmit: v => {
        if (p.id) v.id = p.id; else v.listedAt = RE.today();
        v.units = v.units || 1; v.views = v.views || 0;
        RE.put('properties', v);
        if (RE.storageFailed) return t('The photos are too large for this browser to keep. Remove one or two and save again.');
        RE.toast(p.id ? t('Property updated') : t('Property added'));
      },
      onDelete: p.id ? () => RE.confirm(t('Delete {n}? This cannot be undone.', { n: p.title }), t('Delete'), () => { RE.del('properties', p.id); if (ui.mapSel === p.id) ui.mapSel = null; RE.closeDlg(); RE.render(); RE.toast(t('Property deleted')); }, true) : null
    });
  }

  function propView(p) {
    const fits = RE.leadsFor(p), deals = S().deals.filter(d => d.propertyId === p.id), ph = p.photos || [];
    RE.modal(`${RE.dlgHead(p.title)}<div class="dlg-b">
      <div class="gallery ${ph.length > 1 ? 'multi' : ''}"><div class="g-main">${RE.thumb(p)}</div>${ph.slice(1, 4).map((s, i) => `<div><img src="${s}" alt="${esc(p.title)} ${i + 2}"></div>`).join('')}</div>
      <div class="row wrap">${RE.tag(p.status, L('status', p.status))}${RE.plot(p)}<span class="chip">${L('type', p.type)} · ${L('purpose', p.purpose)}</span><span class="grow"></span><strong class="price">${RE.priceOf(p)}</strong></div>
      <p class="sub">${esc(RE.place(p))}</p><div class="facts">${RE.factsOf(p)}</div>
      <dl class="dl two"><dt>${t('Agent')}</dt><dd>${esc(RE.agentName(p.agentId))}</dd><dt>${t('Listed')}</dt><dd>${p.listedAt ? RE.date(p.listedAt) : '-'}</dd><dt>${t('Listing ends')}</dt><dd>${p.expiresAt ? RE.date(p.expiresAt) + ' (' + RE.relDay(p.expiresAt) + ')' : '-'}</dd><dt>${t('Listing views')}</dt><dd>${RE.num(p.views)}</dd><dt>${t('Deals recorded')}</dt><dd>${deals.length}</dd></dl>
      ${p.notes ? `<p class="note">${esc(p.notes)}</p>` : ''}
      <h3 class="sec">${t('Leads this fits')} <span class="count">${fits.length}</span></h3>
      ${fits.length ? `<ul class="rows">${fits.map(l => `<li class="click" data-act="viewLead" data-id="${l.id}" tabindex="0">${RE.avatar(l.name, RE.COLORS[l.name.length % 6], 'sm')}<span class="grow"><b>${esc(l.name)}</b><small>${L('stage', l.stage)}</small></span><b class="num">${RE.money(l.budget)}</b></li>`).join('')}</ul>` : `<p class="quiet">${t('No active lead matches this type and price yet.')}</p>`}
    </div><footer class="dlg-f wrap">
      <button class="btn ghost" data-act="showOnMap" data-id="${p.id}">${RE.icon('map')}${t('Map')}</button><span class="grow"></span>
      <select class="mini" data-change="propStatus" data-id="${p.id}" aria-label="${t('Status')}">${RE.opts(o(RE.STATUSES, 'status'), p.status)}</select>
      <button class="btn" data-act="editProp" data-id="${p.id}">${RE.icon('edit')}${t('Edit')}</button></footer>`, 'wide');
  }

  function simpleForm(coll, item, cfg) {
    RE.form({
      title: cfg.title, fields: cfg.fields,
      onSubmit: v => { if (item && item.id) v.id = item.id; if (cfg.fix) cfg.fix(v); RE.put(coll, v); RE.toast(t('Saved')); },
      onDelete: item && item.id ? () => RE.confirm(t('Delete {n}? This cannot be undone.', { n: item[cfg.nameKey || 'name'] }), t('Delete'), () => { RE.del(coll, item.id); RE.closeDlg(); RE.render(); RE.toast(t('Deleted')); }, true) : null
    });
  }
  const apptForm = () => simpleForm('appointments', null, {
    title: t('New appointment'),
    fields: [
      { name: 'title', label: t('What'), required: true, wide: true, placeholder: t('Visit with a client') },
      { name: 'place', label: t('Where'), wide: true },
      { name: 'date', label: t('Date'), type: 'date', required: true, value: ui.apptDay || RE.today() },
      { name: 'time', label: t('Time'), type: 'time', value: '10:00' },
      { name: 'agentId', label: t('Agent'), type: 'select', options: agentOpts() }
    ], fix: v => { v.done = false; ui.apptDay = v.date; }
  });
  const agentForm = a => simpleForm('agents', a, {
    title: a ? t('Edit team member') : t('New team member'),
    fields: [
      { name: 'name', label: t('Full name'), required: true, value: a && a.name },
      { name: 'role', label: t('Role'), type: 'select', options: o(RE.ROLES, 'role'), value: a ? a.role : 'agent' },
      { name: 'phone', label: t('Phone'), type: 'tel', value: a && a.phone, placeholder: '+964' }
    ], fix: v => { if (!a) v.color = RE.COLORS[S().agents.length % RE.COLORS.length]; }
  });
  const campaignForm = c => simpleForm('campaigns', c, {
    title: c ? t('Edit campaign') : t('New campaign'),
    fields: [
      { name: 'name', label: t('Campaign name'), required: true, wide: true, value: c && c.name },
      { name: 'channel', label: t('Channel'), type: 'select', options: o(RE.CHANNELS, 'source'), value: c && c.channel },
      { name: 'propertyId', label: t('Property'), type: 'select', options: [['', t('The whole office')]].concat(S().properties.map(p => [p.id, p.title])), value: c && c.propertyId },
      { name: 'budget', label: t('Budget'), type: 'number', required: true, value: c && c.budget },
      { name: 'spent', label: t('Spent so far'), type: 'number', value: c ? c.spent : 0 },
      { name: 'leads', label: t('Leads it brought'), type: 'number', value: c ? c.leads : 0 },
      { name: 'status', label: t('Status'), type: 'select', options: o(['running', 'paused', 'ended'], 'cstatus'), value: c ? c.status : 'running' },
      { name: 'start', label: t('Starts'), type: 'date', value: c ? c.start : RE.today() },
      { name: 'end', label: t('Ends'), type: 'date', value: c && c.end }
    ], fix: v => { v.spent = v.spent || 0; v.leads = v.leads || 0; }
  });
  const donationForm = () => simpleForm('donations', null, {
    title: t('Record a donation'),
    fields: [
      { name: 'to', label: t('Given to'), required: true, wide: true },
      { name: 'amount', label: t('Amount'), type: 'number', required: true },
      { name: 'date', label: t('Date'), type: 'date', required: true, value: RE.today() },
      { name: 'note', label: t('Note'), wide: true }
    ]
  });
  const referralForm = r => simpleForm('referrals', r, {
    title: r ? t('Edit invite') : t('Record an invite'),
    fields: [
      { name: 'name', label: t('Office or person'), required: true, wide: true, value: r && r.name },
      { name: 'phone', label: t('Phone'), type: 'tel', value: r && r.phone, placeholder: '+964' },
      { name: 'status', label: t('Status'), type: 'select', options: o(['invited', 'joined'], 'refstatus'), value: r ? r.status : 'invited' },
      { name: 'agentId', label: t('Invited by'), type: 'select', options: agentOpts(), value: r && r.agentId },
      { name: 'date', label: t('Date'), type: 'date', required: true, value: r ? r.date : RE.today() }
    ]
  });

  function shareCode() {
    const st = S().settings, text = t('Join {o} on Rasl Estate with my ID {c}', { o: st.office, c: st.agentCode });
    RE.modal(`${RE.dlgHead(t('Your ID'))}<div class="dlg-b center"><p class="eyebrow">${esc(st.office)}${st.me ? ' · ' + esc(st.me) : ''}</p><p class="bigcode sel">${esc(st.agentCode)}</p><p class="sub">${t('Anyone who joins with this ID is counted under Join & Charity.')}</p></div>
      <footer class="dlg-f wrap"><button class="btn ghost" data-act="copyCode">${RE.icon('copy')}${t('Copy')}</button><span class="grow"></span><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${RE.icon('chat')}${t('Send on WhatsApp')}</a></footer>`);
  }

  const CSV = {
    leads: () => [['Name', 'Phone', 'Wants', 'Type', 'Budget', 'City', 'District', 'Stage', 'Source', 'Agent', 'Created', 'Last contact', 'Next follow-up', 'Notes']].concat(S().leads.map(l => [l.name, l.phone, l.want, l.type, l.budget, l.city, l.district, l.stage, l.source, RE.agentName(l.agentId), l.createdAt, l.lastContact, l.nextFollowUp, l.notes])),
    properties: () => [['Name', 'Plot', 'Type', 'Offered', 'Price', 'Status', 'City', 'District', 'Area m2', 'Units', 'Beds', 'Baths', 'Built', 'Views', 'Listed', 'Ends', 'Agent', 'Lat', 'Lng']].concat(S().properties.map(p => [p.title, p.plot, p.type, p.purpose, p.price, p.status, p.city, p.district, p.area, p.units, p.beds, p.baths, p.built, p.views, p.listedAt, p.expiresAt, RE.agentName(p.agentId), p.lat, p.lng])),
    deals: () => [['Date', 'Client', 'Property', 'Kind', 'Amount', 'Commission', 'Agent']].concat(S().deals.map(d => [d.date, d.client, d.title, d.kind, d.amount, d.commission, RE.agentName(d.agentId)]))
  };

  /* ---------- actions ---------- */
  const A = RE.act = {
    nav: d => go(d.to),
    closeDlg: () => RE.closeDlg(),
    toggleTheme: () => { S().settings.theme = isDark() ? 'light' : 'dark'; RE.persist(); applyTheme(); RE.render(); },
    setLang: (d, el) => { S().settings.lang = el.value; RE.persist(); RE.render(); },
    toggleGroup: d => {
      const g = GROUPS.find(x => x.id === d.g), cur = groupOf(ui.route);
      const open = !!ui.open[g.id] || (cur === g && ui.open[g.id] !== false);
      ui.open[g.id] = !open;
      try { localStorage.setItem('rasl-nav-open', JSON.stringify(ui.open)); } catch (e) { /* not remembered */ }
      shell();
    },
    groupSheet: d => {
      const g = GROUPS.find(x => x.id === d.g), due = RE.dueLeads().length;
      RE.modal(`${RE.dlgHead(t(g.name))}<nav class="morenav">${g.routes.map(r => `<a href="#${r}" data-act="closeDlg" class="${ui.route === r ? 'on' : ''}">${RE.icon(r)}<span>${t(TITLES[r])}</span>${r === 'leads' && due ? `<i class="badge">${due}</i>` : ''}</a>`).join('')}</nav>`, 'sheet');
    },
    kiosk: () => RE.kioskOpen(),
    slide: d => { const n = RE.showcaseList().length; ui.slide = ((ui.slide || 0) + (+d.d) * (RE.dir() === 'rtl' ? -1 : 1) + n) % n; RE.render(); },
    slideTo: d => { ui.slide = +d.i; RE.render(); },
    addProject: () => RE.projectForm(), editProject: d => RE.projectForm(RE.get('projects', d.id)), viewProject: d => RE.projectView(RE.get('projects', d.id)),
    more: () => RE.modal(`${RE.dlgHead(t('More'))}<nav class="morenav">${ROUTES.slice(4).map(r => `<a href="#${r}" data-act="closeDlg">${RE.icon(r)}<span>${t(TITLES[r])}</span></a>`).join('')}</nav>`, 'sheet'),
    newMenu: () => RE.modal(`${RE.dlgHead(t('New'))}<nav class="morenav">${[['addLead', 'leads', 'Lead'], ['addProp', 'property', 'Property'], ['addAppt', 'clock', 'Appointment'], ['addCampaign', 'ads', 'Campaign'], ['addAgent', 'team', 'Team member']].map(x => `<button data-act="${x[0]}">${RE.icon(x[1])}<span>${t(x[2])}</span></button>`).join('')}</nav>`, 'sheet'),

    addLead: () => leadForm(), editLead: d => leadForm(RE.get('leads', d.id)), viewLead: d => leadView(RE.get('leads', d.id)),
    logContact: d => logContact(RE.get('leads', d.id)), closeDeal: d => dealForm(RE.get('leads', d.id)),
    leadView: d => { ui.leadView = d.v; RE.render(); },
    leadStage: (d, el) => {
      const l = RE.get('leads', d.id);
      if (el.value === 'won') { el.value = l.stage; dealForm(l); return; }
      RE.put('leads', { id: l.id, stage: el.value }); RE.render(); RE.toast(t('{n} moved to {s}', { n: l.name, s: L('stage', el.value) }));
    },
    addProp: () => propForm(), editProp: d => propForm(RE.get('properties', d.id)), viewProp: d => propView(RE.get('properties', d.id)),
    propStatus: (d, el) => { RE.put('properties', { id: d.id, status: el.value }); RE.render(); propView(RE.get('properties', d.id)); },
    showOnMap: d => { const p = RE.get('properties', d.id); RE.closeDlg(); ui.mapCity = ''; ui.mapSel = p.id; if (typeof p.lat === 'number') ui.map = { lat: p.lat, lng: p.lng, z: 15 }; else { ui.placing = p.id; ui.map = null; } go('map'); },

    remDue: () => { ui.leadStage = 'due'; ui.leadView = 'list'; ui.leadQ = ''; ui.leadAgent = ''; go('leads'); },
    remVisits: () => { ui.apptDay = RE.today(); RE.render(); document.getElementById('appts').scrollIntoView({ behavior: 'smooth', block: 'center' }); },
    remExp: () => { ui.propStatus = 'expiring'; ui.propQ = ''; ui.propType = ''; go('property'); },
    addAppt: () => apptForm(),
    apptDay: d => { ui.apptDay = d.d; RE.render(); },
    doneAppt: d => { const a = RE.get('appointments', d.id); RE.put('appointments', { id: a.id, done: !a.done }); RE.render(); },
    delAppt: d => RE.confirm(t('Remove this appointment?'), t('Remove'), () => { RE.del('appointments', d.id); RE.render(); }, true),

    mapZoom: d => { const m = ui.map; m.z = Math.max(3, Math.min(18, m.z + (+d.d))); RE.mapDraw(); },
    mapFitAll: () => RE.mapFit(),
    mapStyle: d => RE.glSetStyle(d.k),
    map3d: () => RE.glToggle3d(),
    mapCity: (d, el) => { ui.mapCity = el.value; ui.map = null; ui.mapSel = null; RE.render(); },
    mapPick: d => { ui.mapSel = d.id; RE.render(); },
    placeProp: d => { ui.placing = d.id; RE.render(); },
    cancelPlace: () => { ui.placing = null; RE.render(); },

    addAgent: () => agentForm(), editAgent: d => agentForm(RE.get('agents', d.id)),
    addCampaign: () => campaignForm(), editCampaign: d => campaignForm(RE.get('campaigns', d.id)),
    addDonation: () => donationForm(),
    delDonation: d => RE.confirm(t('Remove this donation?'), t('Remove'), () => { RE.del('donations', d.id); RE.render(); }, true),
    delDeal: d => RE.confirm(t('Remove this deal? Its commission leaves your totals.'), t('Remove'), () => { RE.del('deals', d.id); RE.render(); }, true),
    addReferral: () => referralForm(), editReferral: d => referralForm(RE.get('referrals', d.id)),

    createId: () => RE.form({
      title: t('Create my ID'), submit: t('Create ID'),
      fields: [{ name: 'me', label: t('Your name'), required: true, value: S().settings.me, wide: true }, { name: 'office', label: t('Office name'), required: true, value: S().settings.office, wide: true }],
      onSubmit: v => { Object.assign(S().settings, v, { agentCode: RE.newCode(), codeIsSample: false }); RE.persist(); RE.toast(t('Your ID is {c}', { c: S().settings.agentCode })); }
    }),
    copyCode: () => RE.copy(S().settings.agentCode, t('ID copied')),
    shareCode: () => shareCode(),

    removeSamples: () => RE.confirm(t('Remove every sample record? Records you added yourself stay.'), t('Remove samples'), () => { RE.removeSamples(); ui.mapSel = null; ui.map = null; RE.render(); RE.toast(t('Samples removed')); }, true),
    loadSamples: () => { RE.seed(); RE.persist(); ui.map = null; RE.render(); RE.toast(t('Sample records loaded')); },
    eraseAll: () => RE.confirm(RE.cloud.office ? t('Erase every record in {o} for the whole team? Save a backup first if you may need them.', { o: RE.cloud.office.name }) : t('Erase every record and setting in this browser? Save a backup first if you may need them.'), t('Erase everything'), () => { const keep = { lang: S().settings.lang, theme: S().settings.theme }; RE.state = RE.blank(); Object.assign(RE.state.settings, keep); RE.persist(); ui.map = null; ui.mapSel = null; RE.render(); RE.toast(t('Everything erased')); }, true),
    exportBackup: () => RE.fileOut('rasl-estate-backup-' + RE.today() + '.json', JSON.stringify(RE.state), 'application/json'),
    exportCsv: d => RE.fileOut('rasl-' + d.k + '-' + RE.today() + '.csv', RE.csv(CSV[d.k]()), 'text/csv'),
    print: () => window.print(),
    authMode: d => { RE.cloud.mode = d.m; RE.cloud.msg = ''; RE.render(); },
    signOut: () => RE.confirm(t('Sign out? The office records are removed from this device and stay safe in the database.'), t('Sign out'), async () => { await RE.cloud.signOut(); RE.toast(t('Signed out')); }),
    copyTeamCode: () => RE.copy(RE.cloud.office.code, t('Team code copied')),
    shareTeamCode: () => {
      const o = RE.cloud.office, text = t('Join {o} on Rasl Estate. Open {u} and use team code {c}', { o: o.name, u: location.origin + location.pathname, c: o.code });
      RE.modal(`${RE.dlgHead(t('Team code'))}<div class="dlg-b center"><p class="eyebrow">${esc(o.name)}</p><p class="bigcode sel">${esc(o.code)}</p><p class="sub">${t('Teammates sign in, choose Join an office and enter this code.')}</p></div>
        <footer class="dlg-f wrap"><button class="btn ghost" data-act="copyTeamCode">${RE.icon('copy')}${t('Copy')}</button><span class="grow"></span><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${RE.icon('chat')}${t('Send on WhatsApp')}</a></footer>`);
    },
    retrySync: () => RE.cloud.retry()
  };

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    if (el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
    const fn = A[el.dataset.act]; if (!fn) return;
    if (el.tagName !== 'A') e.preventDefault();
    fn(el.dataset, el, e);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target; if (!el.matches || !el.matches('tr[data-act],td[data-act],li[data-act]')) return;
    e.preventDefault(); A[el.dataset.act](el.dataset, el, e);
  });
  const bind = e => {
    const el = e.target;
    if (el.dataset && el.dataset.bind && (e.type === 'input') === (el.tagName === 'INPUT')) { ui[el.dataset.bind] = el.value; RE.render(); return; }
    if (e.type !== 'change' || !el.dataset) return;
    if (el.dataset.change) A[el.dataset.change](el.dataset, el, e);
    if (el.dataset.import) importBackup(el);
  };
  document.addEventListener('input', bind);
  document.addEventListener('change', bind);
  document.addEventListener('submit', async e => {
    const C = RE.cloud, f = e.target.elements;
    const run = async (fn) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
      C.msg = '';
      let msg;
      try { msg = await fn(); } catch (err) { msg = String(err && err.message || err); }
      if (btn) btn.disabled = false;
      if (msg) { C.msg = msg; }
      RE.render();
    };
    if (e.target.id === 'cloudAuth') return run(() => C.mode === 'signup'
      ? (f.name.value.trim() ? C.signUp(f.email.value.trim(), f.password.value, f.name.value.trim()) : t('Fill in: {f}', { f: t('Your name') }))
      : C.signIn(f.email.value.trim(), f.password.value));
    if (e.target.id === 'cloudCreate') return run(async () => {
      const name = f.oname.value.trim(); if (!name) return t('Fill in: {f}', { f: t('Office name') });
      const r = await C.createOffice(name, f.bring && f.bring.checked);
      if (!r) RE.toast(t('{o} is ready. Share the team code with your agents.', { o: name }));
      return r;
    });
    if (e.target.id === 'cloudJoin') {
      e.preventDefault();
      const code = f.code.value.trim(); if (!code) { C.msg = t('Fill in: {f}', { f: t('Team code') }); RE.render(); return; }
      const go = () => run(async () => { const r = await C.joinOffice(code); if (!r) RE.toast(t('You joined {o}', { o: C.office.name })); return r; });
      const own = RE.COLLS.some(c => RE.state[c].some(x => !x.sample));
      if (own) RE.confirm(t('Joining replaces the records on this device with the office records. Save a backup first if you need them.'), t('Join office'), go, true); else go();
      return;
    }
    if (e.target.id === 'cloudName') return run(async () => { RE.state.settings.me = f.mname.value.trim(); RE.persist(); await C.rename(RE.state.settings.me); RE.toast(t('Saved')); });
    if (e.target.id !== 'officeForm') return;
    e.preventDefault();
    const st = S().settings;
    st.office = f.office.value.trim() || st.office; if (f.me) st.me = f.me.value.trim(); st.phone = f.phone.value.trim(); st.currency = f.currency.value;
    ['goal', 'commissionPct', 'charityPct'].forEach(k => { st[k] = Math.max(0, +f[k].value || 0); });
    RE.persist(); RE.cloud.renameOffice(st.office); RE.render(); RE.toast(t('Office details saved'));
  });
  document.addEventListener('click', e => { if (e.target.tagName === 'DIALOG' && e.target.id === 'dlg' && !e.target.querySelector('form')) RE.closeDlg(); });

  function importBackup(input) {
    const file = input.files[0]; if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      let data = null;
      try { data = JSON.parse(fr.result); } catch (e) { data = null; }
      if (!data || !data.settings || !Array.isArray(data.leads) || !Array.isArray(data.properties)) { RE.toast(t('That file is not a Rasl Estate backup.')); return; }
      RE.confirm(t('Replace everything here with the backup from {f}?', { f: file.name }), t('Restore'), () => {
        const b = RE.blank(); data.settings = Object.assign(b.settings, data.settings);
        RE.COLLS.forEach(c => { if (!Array.isArray(data[c])) data[c] = []; });
        RE.state = data; RE.persist(); applyTheme(); ui.map = null; ui.mapSel = null; RE.render(); RE.toast(t('Backup restored'));
      }, true);
    };
    fr.readAsText(file); input.value = '';
  }

  /* ---------- boot ---------- */
  RE.load();
  applyTheme();
  window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'dashboard'));
  window.addEventListener('resize', () => { if (ui.route === 'map' && !(RE.gl && RE.glOn())) RE.mapDraw(); });
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => RE.render()); } catch (e) { /* older browsers */ }
  ui.route = ROUTES.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : 'home';
  try { ui.open = JSON.parse(localStorage.getItem('rasl-nav-open')) || {}; } catch (e) { ui.open = {}; }
  RE.render();
  RE.cloud.init();
})(window.RE);
