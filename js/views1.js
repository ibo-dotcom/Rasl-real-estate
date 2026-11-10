/* Rasl Estate — views: dashboard, leads, property, map */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), L = (g, k) => RE.label(g, k);
  const V = RE.views = {};
  RE.after = {};

  RE.codeStrip = function () {
    const st = RE.state.settings;
    if (!st.agentCode) return `<section class="idstrip"><div><span class="eyebrow">${t('Agent ID')}</span><p>${t('Create your ID to share listings and bring other offices into your network.')}</p></div><button class="btn" data-act="createId">${t('Create my ID')}</button></section>`;
    return `<section class="idstrip"><div><span class="eyebrow">${st.codeIsSample ? t('Sample ID') : t('Agent ID')}${st.me ? ' · ' + esc(st.me) : ''}</span><strong class="code">${esc(st.agentCode)}</strong></div>
      <div class="row wrap">${st.codeIsSample ? `<button class="btn" data-act="createId">${t('Create my ID')}</button>` : ''}<button class="btn ghost" data-act="copyCode">${RE.icon('copy')}${t('Copy')}</button><button class="btn ghost" data-act="shareCode">${RE.icon('share')}${t('Show and share')}</button></div></section>`;
  };

  function series(period) {
    const now = new Date(), out = [];
    const startY = period === 'prev' ? now.getFullYear() - 1 : now.getFullYear();
    for (let i = 0; i < 12; i++) {
      const d = period === 'last12' ? new Date(now.getFullYear(), now.getMonth() - 11 + i, 1) : new Date(startY, i, 1);
      const key = RE.iso(d).slice(0, 7);
      const deals = RE.state.deals.filter(x => x.date.slice(0, 7) === key);
      out.push({
        label: RE.monthName(d.getFullYear(), d.getMonth()), tiny: RE.monthName(d.getFullYear(), d.getMonth(), 'narrow'),
        long: RE.monthName(d.getFullYear(), d.getMonth(), 'long') + ' ' + d.getFullYear(),
        value: RE.sum(deals, 'commission'), note: t('{n} deals closed', { n: deals.length }),
        now: key === RE.today().slice(0, 7)
      });
    }
    return out;
  }
  RE.series = series;

  V.dashboard = function () {
    const S = RE.state, st = S.settings, td = RE.today(), ui = RE.ui, yr = td.slice(0, 4);
    const act = RE.activeLeads();
    const dealsY = S.deals.filter(d => d.date.slice(0, 4) === yr), incomeY = RE.sum(dealsY, 'commission');
    const new30 = S.leads.filter(l => l.createdAt >= RE.addDays(td, -30)).length;
    const avail = S.properties.filter(p => p.status === 'available');
    const kpi = (label, val, sub) => `<div class="kpi"><span class="eyebrow">${label}</span><strong>${val}</strong><small>${sub}</small></div>`;

    const start = new Date(+yr, 0, 1), pace = Math.min(1, (new Date() - start) / (365 * 864e5));
    const pct = st.goal ? incomeY / st.goal : 0, gap = incomeY - st.goal * pace;
    const due = RE.dueLeads(), visits = S.appointments.filter(a => a.date === td && !a.done), exp = RE.expiring();
    const rem = (act, n, title, text, extra) => `<button class="rem${n ? ' hot' : ''}" data-act="${act}"><span class="rem-n">${n}</span><span class="rem-t"><b>${title}</b><small>${text}</small></span>${extra || ''}</button>`;

    const q = (ui.dashQ || '').toLowerCase();
    const listed = S.properties.filter(p => p.status === 'available' || p.status === 'reserved')
      .filter(p => !q || (p.title + ' ' + p.plot + ' ' + p.district + ' ' + p.city).toLowerCase().includes(q));
    const ranked = avail.map(p => [p, RE.leadsFor(p).length]).sort((a, b) => b[1] - a[1] || b[0].views - a[0].views);
    const feat = ranked[0];
    const recent = S.leads.slice().sort((a, b) => (b.lastContact || b.createdAt || '').localeCompare(a.lastContact || a.createdAt || '')).slice(0, 5);
    const day = ui.apptDay || td;
    const days = Array.from({ length: 7 }, (_, i) => RE.addDays(td, i));
    const appts = S.appointments.filter(a => a.date === day).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    return `
    <div class="kpis">
      ${kpi(t('Active leads'), act.length, t('{n} new in the last 30 days', { n: new30 }))}
      ${kpi(t('Open pipeline'), RE.moneyShort(RE.sum(act.filter(l => l.want === 'buy'), 'budget')), t('buyer budgets, {n} leads', { n: act.filter(l => l.want === 'buy').length }))}
      ${kpi(t('Deals closed'), dealsY.length, t('this year, {m} in sales', { m: RE.moneyShort(RE.sum(dealsY, 'amount')) }))}
      ${kpi(t('Listings available'), avail.length, t('{n} reserved', { n: S.properties.filter(p => p.status === 'reserved').length }))}
    </div>
    ${RE.codeStrip()}
    ${RE.hasSamples() ? `<div class="notice"><span>${t('You are looking at sample records. Remove them when you are ready to enter your own.')}</span><button class="btn small" data-act="removeSamples">${t('Remove samples')}</button></div>` : ''}
    <div class="grid">
      <section class="panel span8">
        <header class="ph"><div><h2>${t('Commission income')}</h2><p class="sub">${t('By month, against the monthly share of your yearly goal')}</p></div>
          <select id="period" data-bind="period" aria-label="${t('Period')}">${RE.opts([['year', t('This year')], ['last12', t('Last 12 months')], ['prev', t('Last year')]], ui.period)}</select></header>
        ${RE.columns(series(ui.period), { ref: st.goal / 12, refLabel: t('Monthly target'), label: t('Commission income') })}
      </section>
      <div class="span4 stack">
        <section class="panel">
          <header class="ph"><h2>${t('Yearly goal')}</h2><button class="iconbtn" data-act="nav" data-to="office" aria-label="${t('Change goal')}">${RE.icon('edit')}</button></header>
          <div class="goal"><strong>${RE.money(incomeY)}</strong><span>${t('of {g}', { g: RE.money(st.goal) })}</span></div>
          <div class="meter" role="img" aria-label="${Math.round(pct * 100)}%"><i style="width:${Math.min(100, pct * 100).toFixed(1)}%"></i><b style="inset-inline-start:${(pace * 100).toFixed(1)}%"></b></div>
          <p class="sub">${Math.round(pct * 100)}% · ${gap >= 0 ? t('{m} ahead of pace for today', { m: RE.money(gap) }) : t('{m} behind pace for today', { m: RE.money(-gap) })}</p>
        </section>
        <section class="panel">
          <header class="ph"><h2>${t('Needs attention')}</h2></header>
          <div class="rems">
            ${rem('remDue', due.length, t('Follow-ups due'), due.length ? t('{n} leads are waiting for a call back', { n: due.length }) : t('Nobody is waiting on you'), `<span class="avs">${due.slice(0, 4).map(l => RE.avatar(l.name, RE.COLORS[l.name.length % 6], 'sm')).join('')}</span>`)}
            ${rem('remVisits', visits.length, t('Visits today'), visits.length ? visits.map(a => a.time).filter(Boolean).join(' · ') : t('Nothing booked for today'))}
            ${rem('remExp', exp.length, t('Listings expiring'), exp.length ? t('{n} end within 7 days', { n: exp.length }) : t('No listing ends this week'))}
          </div>
        </section>
      </div>

      <section class="panel span8">
        <header class="ph"><h2>${t('Active listings')}</h2><input type="search" id="dashQ" data-bind="dashQ" value="${esc(ui.dashQ || '')}" placeholder="${t('Search name, plot or district')}"></header>
        ${listed.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>${t('Property')}</th><th>${t('Type')}</th><th class="n">${t('Units')}</th><th class="n">${t('Price')}</th><th class="n">${t('Matched leads')}</th><th class="n">${t('Views')}</th><th>${t('Status')}</th></tr></thead><tbody>
          ${listed.map(p => `<tr class="click" data-act="viewProp" data-id="${p.id}" tabindex="0"><td><b>${esc(p.title)}</b><small>${RE.plot(p)} ${esc(RE.place(p))}</small></td><td>${L('type', p.type)}</td><td class="n">${p.units || 1}</td><td class="n">${RE.priceOf(p)}</td><td class="n">${RE.leadsFor(p).length}</td><td class="n">${RE.num(p.views)}</td><td>${RE.tag(p.status, L('status', p.status))}</td></tr>`).join('')}
        </tbody></table></div>` : RE.empty(q ? t('No listing matches that search.') : t('No listings yet.'), q ? '' : 'addProp', t('Add a property'))}
      </section>
      <section class="panel span4 feat">
        ${feat ? `<header class="ph"><h2>${t('Most in demand')}</h2></header>
          <button class="feat-img" data-act="viewProp" data-id="${feat[0].id}">${RE.thumb(feat[0])}<span>${t('Fits {n} active leads', { n: feat[1] })}</span></button>
          <h3>${esc(feat[0].title)}</h3><p class="sub">${RE.plot(feat[0])} ${L('type', feat[0].type)} · ${esc(RE.place(feat[0]))}</p>
          <div class="facts">${factsOf(feat[0])}</div>
          <div class="row"><strong class="price">${RE.priceOf(feat[0])}</strong><span class="grow"></span><button class="btn ghost small" data-act="showOnMap" data-id="${feat[0].id}">${RE.icon('map')}${t('Map')}</button></div>`
        : `<header class="ph"><h2>${t('Most in demand')}</h2></header>${RE.empty(t('Add a listing and the one that fits the most leads shows here.'), 'addProp', t('Add a property'))}`}
      </section>

      <section class="panel span6">
        <header class="ph"><h2>${t('Recent leads')}</h2><button class="btn ghost small" data-act="nav" data-to="leads">${t('All leads')}</button></header>
        ${recent.length ? `<ul class="rows">${recent.map(l => `<li class="click" data-act="viewLead" data-id="${l.id}" tabindex="0">${RE.avatar(l.name, RE.COLORS[l.name.length % 6])}<span class="grow"><b>${esc(l.name)}</b><small>${L('type', l.type)} · ${L('want', l.want)}${l.district ? ' · ' + esc(l.district) : ''}</small></span><span class="end-col"><b class="num">${RE.money(l.budget)}</b>${RE.tag(l.stage, L('stage', l.stage))}</span></li>`).join('')}</ul>` : RE.empty(t('No leads yet.'), 'addLead', t('Add a lead'))}
      </section>
      <section class="panel span6" id="appts">
        <header class="ph"><h2>${t('Appointments')}</h2><button class="btn ghost small" data-act="addAppt">${RE.icon('plus')}${t('Appointment')}</button></header>
        <div class="week">${days.map(d => { const n = S.appointments.filter(a => a.date === d && !a.done).length; return `<button class="${d === day ? 'on' : ''}" data-act="apptDay" data-d="${d}"><small>${RE.date(d, { weekday: 'short' })}</small><b>${+d.slice(8)}</b><i class="${n ? 'dot' : ''}"></i></button>`; }).join('')}</div>
        ${appts.length ? `<ul class="rows appts">${appts.map(a => `<li class="${a.done ? 'done' : ''}"><span class="time">${esc(a.time || '')}</span><span class="grow"><b>${esc(a.title)}</b><small>${esc(a.place || '')}${a.agentId ? ' · ' + esc(RE.agentName(a.agentId)) : ''}</small></span>
          <button class="iconbtn" data-act="doneAppt" data-id="${a.id}" aria-label="${a.done ? t('Mark as not done') : t('Mark as done')}" aria-pressed="${!!a.done}">${RE.icon('check')}</button><button class="iconbtn" data-act="delAppt" data-id="${a.id}" aria-label="${t('Delete')}">${RE.icon('trash')}</button></li>`).join('')}</ul>` : `<p class="quiet">${t('Nothing booked on {d}.', { d: RE.date(day, { weekday: 'long', day: 'numeric', month: 'long' }) })}</p>`}
      </section>
    </div>`;
  };

  function factsOf(p) {
    const f = [];
    if (p.beds) f.push(`<span><b>${p.beds}</b> ${t('bed')}</span>`);
    if (p.baths) f.push(`<span><b>${p.baths}</b> ${t('bath')}</span>`);
    if (p.area) f.push(`<span><b>${RE.num(p.area)}</b> m²</span>`);
    if (p.built) f.push(`<span>${t('built')} <b>${p.built}</b></span>`);
    if (p.units > 1) f.push(`<span><b>${p.units}</b> ${t('units')}</span>`);
    return f.join('');
  }
  RE.factsOf = factsOf;

  /* ---------------- leads ---------------- */
  function leadFilter() {
    const ui = RE.ui, q = (ui.leadQ || '').toLowerCase(), td = RE.today();
    return RE.state.leads.filter(l => {
      if (q && !(l.name + ' ' + (l.phone || '') + ' ' + (l.district || '') + ' ' + (l.city || '')).toLowerCase().includes(q)) return false;
      if (ui.leadAgent && l.agentId !== ui.leadAgent) return false;
      if (ui.leadStage === 'due') return RE.isActive(l) && l.nextFollowUp && l.nextFollowUp <= td;
      if (ui.leadStage === 'active') return RE.isActive(l);
      if (ui.leadStage && ui.leadStage !== 'all') return l.stage === ui.leadStage;
      return true;
    });
  }
  function followChip(l) {
    if (!RE.isActive(l)) return l.lastContact ? `<span class="chip">${t('Last contact')} ${RE.dayMonth(l.lastContact)}</span>` : '';
    if (!l.nextFollowUp) return `<span class="chip">${t('No follow-up set')}</span>`;
    return `<span class="chip ${l.nextFollowUp <= RE.today() ? 'late' : ''}">${RE.icon('clock')}${RE.relDay(l.nextFollowUp)}</span>`;
  }
  const stageSelect = l => `<select class="mini" data-change="leadStage" data-id="${l.id}" aria-label="${t('Stage')}">${RE.opts(RE.STAGES.map(s => [s, L('stage', s)]), l.stage)}</select>`;

  V.leads = function () {
    const S = RE.state, ui = RE.ui, list = leadFilter();
    const stages = [['active', t('All active')], ['all', t('Everyone')], ['due', t('Follow-up due')]].concat(RE.STAGES.map(s => [s, L('stage', s)]));
    const bar = `<div class="toolbar">
      <input type="search" id="leadQ" data-bind="leadQ" value="${esc(ui.leadQ || '')}" placeholder="${t('Search name, phone or area')}">
      <select id="leadStage" data-bind="leadStage" aria-label="${t('Stage')}">${RE.opts(stages, ui.leadStage)}</select>
      <select id="leadAgent" data-bind="leadAgent" aria-label="${t('Agent')}">${RE.opts([['', t('All agents')]].concat(S.agents.map(a => [a.id, a.name])), ui.leadAgent)}</select>
      <span class="grow"></span>
      <div class="seg" role="group"><button class="${ui.leadView === 'board' ? 'on' : ''}" data-act="leadView" data-v="board" aria-label="${t('Board')}">${RE.icon('board')}</button><button class="${ui.leadView === 'list' ? 'on' : ''}" data-act="leadView" data-v="list" aria-label="${t('List')}">${RE.icon('list')}</button></div>
      <button class="btn" data-act="addLead">${RE.icon('plus')}${t('Lead')}</button></div>`;
    if (!S.leads.length) return bar + RE.empty(t('No leads yet. Add the first person who asked about a property.'), 'addLead', t('Add a lead'));
    if (!list.length) return bar + RE.empty(t('No lead matches these filters.'));

    if (ui.leadView === 'board') {
      const cols = RE.STAGES.filter(s => list.some(l => l.stage === s) || (s !== 'lost' && s !== 'won'));
      return bar + `<div class="board">${cols.map(s => {
        const ls = list.filter(l => l.stage === s).sort((a, b) => (a.nextFollowUp || '9').localeCompare(b.nextFollowUp || '9'));
        return `<section class="bcol"><header><h3>${L('stage', s)}</h3><span class="count">${ls.length}</span><span class="grow"></span><small class="num">${ls.length ? RE.moneyShort(RE.sum(ls, 'budget')) : ''}</small></header>
          ${ls.map(l => `<article class="lcard"><button class="lcard-main" data-act="viewLead" data-id="${l.id}"><b>${esc(l.name)}</b><small>${L('want', l.want)} · ${L('type', l.type)}${l.district ? ' · ' + esc(l.district) : ''}</small><strong class="num">${RE.money(l.budget)}${l.want === 'rent' ? ' / ' + t('month') : ''}</strong></button>
            <footer>${followChip(l)}<span class="grow"></span>${RE.agentAv(l.agentId, 'sm')}</footer>${stageSelect(l)}</article>`).join('') || `<p class="quiet">${t('Empty')}</p>`}
        </section>`;
      }).join('')}</div>`;
    }
    return bar + `<section class="panel flush"><div class="tscroll"><table class="tbl"><thead><tr><th>${t('Lead')}</th><th>${t('Looking for')}</th><th class="n">${t('Budget')}</th><th>${t('Stage')}</th><th>${t('Follow-up')}</th><th>${t('Source')}</th><th>${t('Agent')}</th></tr></thead><tbody>
      ${list.map(l => `<tr><td class="click" data-act="viewLead" data-id="${l.id}" tabindex="0"><b>${esc(l.name)}</b><small class="num">${esc(l.phone || '')}</small></td><td>${L('want', l.want)} · ${L('type', l.type)}<small>${esc([l.district, l.city].filter(Boolean).join(', '))}</small></td><td class="n">${RE.money(l.budget)}</td><td>${stageSelect(l)}</td><td>${followChip(l)}</td><td>${L('source', l.source)}</td><td>${esc(RE.agentName(l.agentId))}</td></tr>`).join('')}
    </tbody></table></div></section>`;
  };

  /* ---------------- property ---------------- */
  V.property = function () {
    const S = RE.state, ui = RE.ui, q = (ui.propQ || '').toLowerCase(), lim = RE.addDays(RE.today(), 7);
    const list = S.properties.filter(p => {
      if (q && !(p.title + ' ' + p.plot + ' ' + p.district + ' ' + p.city).toLowerCase().includes(q)) return false;
      if (ui.propStatus === 'expiring') return p.status === 'available' && p.expiresAt && p.expiresAt <= lim;
      if (ui.propStatus && p.status !== ui.propStatus) return false;
      if (ui.propType && p.type !== ui.propType) return false;
      return true;
    });
    const bar = `<div class="toolbar">
      <input type="search" id="propQ" data-bind="propQ" value="${esc(ui.propQ || '')}" placeholder="${t('Search name, plot or district')}">
      <select id="propStatus" data-bind="propStatus" aria-label="${t('Status')}">${RE.opts([['', t('Any status')]].concat(RE.STATUSES.map(s => [s, L('status', s)]), [['expiring', t('Expiring soon')]]), ui.propStatus)}</select>
      <select id="propType" data-bind="propType" aria-label="${t('Type')}">${RE.opts([['', t('Any type')]].concat(RE.TYPES.map(s => [s, L('type', s)])), ui.propType)}</select>
      <span class="grow"></span><button class="btn" data-act="addProp">${RE.icon('plus')}${t('Property')}</button></div>`;
    if (!S.properties.length) return bar + RE.empty(t('No properties yet. Add your first listing with its plot number and price.'), 'addProp', t('Add a property'));
    if (!list.length) return bar + RE.empty(t('No property matches these filters.'));
    return bar + `<div class="pgrid">${list.map(p => {
      const n = RE.leadsFor(p).length, late = p.status === 'available' && p.expiresAt && p.expiresAt <= lim;
      return `<article class="pcard"><button class="pcard-img" data-act="viewProp" data-id="${p.id}" aria-label="${esc(p.title)}">${RE.thumb(p)}${RE.tag(p.status, L('status', p.status))}</button>
        <div class="pcard-b"><div class="row"><h3>${esc(p.title)}</h3><span class="grow"></span>${RE.plot(p)}</div>
        <p class="sub">${L('type', p.type)} · ${L('purpose', p.purpose)} · ${esc(RE.place(p))}</p>
        <div class="facts">${factsOf(p)}</div>
        <div class="row"><strong class="price">${RE.priceOf(p)}</strong><span class="grow"></span>${late ? `<span class="chip late">${t('Ends')} ${RE.dayMonth(p.expiresAt)}</span>` : n ? `<span class="chip">${t('{n} matched leads', { n })}</span>` : ''}</div></div></article>`;
    }).join('')}</div>`;
  };

  /* ---------------- map (slippy tiles drawn by hand; falls back to a survey grid offline) ---------------- */
  const TS = 256;
  const proj = (lat, lng, z) => { const n = TS * Math.pow(2, z), r = lat * Math.PI / 180; return [(lng + 180) / 360 * n, (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n]; };
  const unproj = (x, y, z) => { const n = TS * Math.pow(2, z); return [Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI, x / n * 360 - 180]; };
  const located = () => RE.state.properties.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && (!RE.ui.mapCity || p.city === RE.ui.mapCity));

  function fit(W, H) {
    const pts = located();
    if (!pts.length) return { lat: 36.19, lng: 44.01, z: 12 };
    for (let z = 16; z >= 3; z--) {
      const xy = pts.map(p => proj(p.lat, p.lng, z)), xs = xy.map(a => a[0]), ys = xy.map(a => a[1]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      if (w <= W - 110 && h <= H - 110 || z === 3) {
        const c = unproj((Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2, z);
        return { lat: c[0], lng: c[1], z: pts.length === 1 ? 14 : z };
      }
    }
  }

  function draw() {
    const el = document.getElementById('mapc'); if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    if (!RE.ui.map) RE.ui.map = fit(W, H);
    const m = RE.ui.map, c = proj(m.lat, m.lng, m.z), ox = c[0] - W / 2, oy = c[1] - H / 2, max = Math.pow(2, m.z);
    let tiles = '';
    for (let tx = Math.floor(ox / TS); tx * TS < ox + W; tx++) for (let ty = Math.floor(oy / TS); ty * TS < oy + H; ty++) {
      if (ty < 0 || ty >= max) continue;
      const wx = ((tx % max) + max) % max;
      tiles += `<img alt="" draggable="false" src="https://tile.openstreetmap.org/${m.z}/${wx}/${ty}.png" style="left:${Math.round(tx * TS - ox)}px;top:${Math.round(ty * TS - oy)}px" onerror="this.remove()">`;
    }
    el.querySelector('.map-tiles').innerHTML = tiles;
    el.querySelector('.map-pins').innerHTML = located().map(p => {
      const xy = proj(p.lat, p.lng, m.z);
      return `<button class="pin st-${p.status}${RE.ui.mapSel === p.id ? ' on' : ''}" style="left:${Math.round(xy[0] - ox)}px;top:${Math.round(xy[1] - oy)}px" data-act="mapPick" data-id="${p.id}" title="${RE.esc(p.title)}">${RE.moneyShort(p.price)}</button>`;
    }).join('');
  }
  RE.mapDraw = draw;
  RE.mapFit = () => { RE.ui.map = null; draw(); };

  RE.after.map = function () {
    const el = document.getElementById('mapc'); if (!el) return;
    draw();
    let drag = null;
    el.onpointerdown = e => { if (e.target.closest('.pin,.map-ctl')) return; drag = { x: e.clientX, y: e.clientY, moved: 0, c: proj(RE.ui.map.lat, RE.ui.map.lng, RE.ui.map.z) }; el.setPointerCapture(e.pointerId); };
    el.onpointermove = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
      if (drag.moved < 5) return;
      const ll = unproj(drag.c[0] - dx, drag.c[1] - dy, RE.ui.map.z);
      RE.ui.map.lat = Math.max(-84, Math.min(84, ll[0])); RE.ui.map.lng = ll[1]; draw();
    };
    el.onpointerup = e => {
      const d = drag; drag = null; if (!d || d.moved >= 5) return;
      if (RE.ui.placing) {
        const r = el.getBoundingClientRect(), m = RE.ui.map, c = proj(m.lat, m.lng, m.z);
        const ll = unproj(c[0] - r.width / 2 + (e.clientX - r.left), c[1] - r.height / 2 + (e.clientY - r.top), m.z);
        const p = RE.get('properties', RE.ui.placing);
        if (p) { RE.put('properties', { id: p.id, lat: +ll[0].toFixed(5), lng: +ll[1].toFixed(5) }); RE.ui.mapSel = p.id; RE.toast(RE.t('{p} is now on the map', { p: p.title })); }
        RE.ui.placing = null; RE.render();
      }
    };
    el.onpointercancel = () => { drag = null; };
  };

  V.map = function () {
    const S = RE.state, ui = RE.ui;
    const cities = Array.from(new Set(S.properties.map(p => p.city).filter(Boolean)));
    if (ui.mapCity == null) { // open on the city with the most listings
      const n = c => S.properties.filter(p => p.city === c).length;
      ui.mapCity = cities.length > 1 ? cities.slice().sort((a, b) => n(b) - n(a))[0] : '';
    }
    const off = S.properties.filter(p => typeof p.lat !== 'number' || typeof p.lng !== 'number');
    const sel = ui.mapSel && RE.get('properties', ui.mapSel), placing = ui.placing && RE.get('properties', ui.placing);
    return `<div class="toolbar">
      <select id="mapCity" data-change="mapCity" aria-label="${t('City')}">${RE.opts([['', t('All cities')]].concat(cities.map(c => [c, c])), ui.mapCity)}</select>
      <span class="legend"><i class="lg st-available"></i>${L('status', 'available')}<i class="lg st-reserved"></i>${L('status', 'reserved')}<i class="lg st-sold"></i>${t('Sold or rented')}</span></div>
    ${placing ? `<div class="notice"><span>${t('Tap the map where {p} stands.', { p: placing.title })}</span><button class="btn small ghost" data-act="cancelPlace">${t('Cancel')}</button></div>` : ''}
    <div class="mapwrap">
      <div class="mapc${placing ? ' placing' : ''}" id="mapc"><div class="map-tiles"></div><div class="map-pins"></div>
        <div class="map-ctl"><button data-act="mapZoom" data-d="1" aria-label="${t('Zoom in')}">${RE.icon('zoomIn')}</button><button data-act="mapZoom" data-d="-1" aria-label="${t('Zoom out')}">${RE.icon('zoomOut')}</button><button data-act="mapFitAll" aria-label="${t('Show all')}">${RE.icon('fit')}</button></div>
        <span class="map-att">© OpenStreetMap</span></div>
      <aside class="mapside">
        ${sel ? `<section class="panel"><div class="side-img">${RE.thumb(sel)}</div><h3>${esc(sel.title)}</h3><p class="sub">${RE.plot(sel)} ${esc(RE.place(sel))}</p><div class="facts">${factsOf(sel)}</div>
          <div class="row"><strong class="price">${RE.priceOf(sel)}</strong><span class="grow"></span>${RE.tag(sel.status, L('status', sel.status))}</div>
          <div class="row wrap"><button class="btn small" data-act="viewProp" data-id="${sel.id}">${t('Open')}</button><a class="btn ghost small" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${sel.lat},${sel.lng}">${t('Google Maps')}</a><button class="btn ghost small" data-act="placeProp" data-id="${sel.id}">${t('Move pin')}</button></div></section>`
        : `<section class="panel"><p class="quiet">${located().length ? t('Pick a price flag to see the property.') : t('No property has a location yet.')}</p></section>`}
        ${off.length ? `<section class="panel"><header class="ph"><h2>${t('Not on the map')}</h2></header><ul class="rows">${off.map(p => `<li><span class="grow"><b>${esc(p.title)}</b><small>${esc(RE.place(p))}</small></span><button class="btn ghost small" data-act="placeProp" data-id="${p.id}">${t('Place')}</button></li>`).join('')}</ul></section>` : ''}
      </aside>
    </div>`;
  };
})(window.RE);
