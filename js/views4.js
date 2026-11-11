/* Rasl Estate — the project file (one place for a project's media, sales, ads, team and plan) and the business plan */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), L = (g, k) => RE.label(g, k);
  const V = RE.views;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

  /* ---------- video and VR links ---------- */
  RE.embedUrl = function (url) {
    if (!url) return null;
    let u; try { u = new URL(url.trim()); } catch (e) { return null; }
    const h = u.hostname.replace(/^www\.|^m\./, '');
    let m;
    if (h === 'youtu.be') return { kind: 'video', src: 'https://www.youtube-nocookie.com/embed/' + u.pathname.slice(1) };
    if (h === 'youtube.com') {
      const id = u.searchParams.get('v') || ((m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)) && m[1]);
      if (id) return { kind: 'video', src: 'https://www.youtube-nocookie.com/embed/' + id };
    }
    if (h === 'vimeo.com' && (m = u.pathname.match(/^\/(\d+)/))) return { kind: 'video', src: 'https://player.vimeo.com/video/' + m[1] };
    if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { kind: 'file', src: u.href };
    if (/(^|\.)matterport\.com$|(^|\.)kuula\.co$|(^|\.)momento360\.com$|(^|\.)3dvista\.com$|(^|\.)cloudpano\.com$|(^|\.)teliportme\.com$/.test(h)) return { kind: 'vr', src: u.href };
    return { kind: 'link', src: u.href };
  };
  RE.mediaBlock = function (url, label) {
    const e = RE.embedUrl(url); if (!e) return '';
    if (e.kind === 'file') return `<figure class="media"><video src="${esc(e.src)}" controls playsinline preload="metadata"></video><figcaption>${esc(label)}</figcaption></figure>`;
    if (e.kind === 'link') return `<a class="media-link" href="${esc(e.src)}" target="_blank" rel="noopener">${RE.icon(label === 'VR' ? 'vr' : 'play')}<span><b>${esc(label === 'VR' ? t('Open the VR tour') : t('Watch the video'))}</b><small>${esc(new URL(e.src).hostname)}</small></span></a>`;
    return `<figure class="media"><iframe src="${esc(e.src)}" title="${esc(label)}" loading="lazy" allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><figcaption><span>${esc(label === 'VR' ? t('VR tour') : t('Video'))}</span><a href="${esc(url)}" target="_blank" rel="noopener">${t('Open in a new tab')}</a></figcaption></figure>`;
  };

  /* ---------- shareable links ---------- */
  const base = () => location.origin + location.pathname.replace(/[^/]*$/, '');
  RE.projectLink = (p, campaignId) => RE.cloud && RE.cloud.office ? `${base()}project.html?o=${RE.cloud.office.id}&p=${encodeURIComponent(p.id)}${campaignId ? '&c=' + encodeURIComponent(campaignId) : ''}` : '';

  /* ---------- the project file ---------- */
  V.project = function () {
    const f = RE.ui.projectId && RE.projectFile(RE.ui.projectId);
    if (!f) return RE.empty(t('Pick a project from the list to open its file.')) + `<div class="row"><a class="btn" href="#projects">${t('Residential projects')}</a></div>`;
    const p = f.p, link = RE.projectLink(p);
    const units = f.target ? `${f.sold} / ${f.target}` : String(f.sold);
    const whole = p.unitsTotal ? t('{a} of {b} sold in the whole project', { a: RE.num(p.unitsTotal - (p.unitsAvailable || 0)), b: RE.num(p.unitsTotal) }) : '';
    const kpi = (label, val, sub) => `<div class="kpi"><span class="eyebrow">${label}</span><strong>${val}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
    const photos = (p.photos || []);

    const head = `<div class="toolbar"><a class="btn ghost small" href="#projects">${RE.icon('prev')}${t('All projects')}</a><span class="grow"></span>
      <button class="btn ghost" data-act="shareProject" data-id="${p.id}">${RE.icon('share')}${t('Project link')}</button><button class="btn" data-act="editProject" data-id="${p.id}">${RE.icon('edit')}${t('Edit')}</button></div>
      <section class="pfile-head"><div class="pfile-art">${RE.projectArt(p)}</div><div class="pfile-id">
        <div class="row wrap">${RE.tag(p.status === 'soldout' ? 'sold' : p.status === 'upcoming' ? 'reserved' : 'available', L('pstatus', p.status))}<span class="chip">${esc(L('ptype', p.ptype))} · ${esc([p.district, p.city].filter(Boolean).join(', '))}</span>${p.public === 'yes' ? `<span class="chip">${RE.icon('share')}${t('Public page on')}</span>` : ''}</div>
        <h2>${esc(p.name)}</h2>${p.developer ? `<p class="sub">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
        ${RE.projStats(p)}
        <p class="rate">${t('Commission on this project')} <b class="num">${f.rate}%</b> <small>${t('about {m} per unit at the average price', { m: RE.money(f.avgPrice * f.rate / 100) })}</small></p>
      </div></section>
      <div class="kpis five">${kpi(t('Sold by your office'), units, whole)}${kpi(t('Sales value'), RE.moneyShort(f.revenue))}${kpi(t('Commission'), RE.money(f.commission), f.planCommission ? t('{p}% of plan', { p: pct(f.commission, f.planCommission) }) : '')}${kpi(t('Ad spend'), RE.money(f.spent), f.cpl != null ? t('{m} per lead', { m: RE.money(f.cpl) }) : '')}${kpi(t('Net after ads'), RE.money(f.net), '')}</div>`;

    const media = `<section class="panel span12"><header class="ph"><div><h2>${t('Photos, video and VR')}</h2><p class="sub">${t('What clients see on the project link.')}</p></div><button class="btn ghost small" data-act="editProject" data-id="${p.id}">${RE.icon('edit')}${t('Change media')}</button></header>
      ${photos.length || p.videoUrl || p.vrUrl ? `<div class="mediagrid">${photos.slice(0, 6).map((s, i) => `<img src="${s}" alt="${esc(p.name)} ${i + 1}" loading="lazy">`).join('')}${RE.mediaBlock(p.videoUrl, 'Video')}${RE.mediaBlock(p.vrUrl, 'VR')}</div>`
        : `<p class="quiet">${t('No photos, video or VR tour yet. Add them so the project link can sell on its own.')}</p>`}</section>`;

    const sales = `<section class="panel span8"><header class="ph"><div><h2>${t('Sales')}</h2><p class="sub">${t('Each sale uses the {p}% commission of this project and takes one unit off what is available.', { p: f.rate })}</p></div><button class="btn small" data-act="projectSale" data-id="${p.id}">${RE.icon('plus')}${t('Record a sale')}</button></header>
      ${f.deals.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>${t('Date')}</th><th>${t('Buyer')}</th><th>${t('Unit')}</th><th>${t('Agent')}</th><th class="n">${t('Price')}</th><th class="n">${t('Commission')}</th></tr></thead><tbody>
        ${f.deals.slice().sort((a, b) => b.date.localeCompare(a.date)).map(d => `<tr><td>${RE.date(d.date)}</td><td><b>${esc(d.client)}</b></td><td>${esc((d.title || '').replace(p.name + ', ', ''))}</td><td>${esc(RE.agentName(d.agentId))}</td><td class="n">${RE.money(d.amount)}</td><td class="n">${RE.money(d.commission)}</td></tr>`).join('')}
      </tbody></table></div>` : `<p class="quiet">${t('No sales recorded for this project yet.')}</p>`}
      <h3 class="sec">${t('Interested buyers')} <span class="count">${f.active.length}</span></h3>
      ${f.active.length ? `<ul class="rows">${f.active.map(l => { const c = l.campaignId && RE.get('campaigns', l.campaignId); return `<li class="click" data-act="viewLead" data-id="${l.id}" tabindex="0">${RE.avatar(l.name, RE.COLORS[l.name.length % 6], 'sm')}<span class="grow"><b>${esc(l.name)}</b><small>${L('stage', l.stage)} · ${c ? esc(c.name) : L('source', l.source)}</small></span><span class="num">${esc(l.phone || '')}</span></li>`; }).join('')}</ul>` : `<p class="quiet">${t('Nobody is asking about this project yet. Share the project link or start an ad.')}</p>`}
    </section>`;

    const team = `<section class="panel span4"><header class="ph"><h2>${t('Team on this project')}</h2><button class="btn ghost small" data-act="projectTeam" data-id="${p.id}">${t('Choose')}</button></header>
      ${f.agents.length ? `<ul class="rows">${f.agents.map(a => { const ds = f.deals.filter(d => d.agentId === a.id); return `<li>${RE.avatar(a.name, a.color, 'sm')}<span class="grow"><b>${esc(a.name)}</b><small>${t('{n} sales', { n: ds.length })} · ${RE.money(RE.sum(ds, 'commission'))}</small></span><span class="chip">${t('{n} buyers', { n: f.active.filter(l => l.agentId === a.id).length })}</span></li>`; }).join('')}</ul>` : `<p class="quiet">${t('No one assigned. Choose the agents who sell this project.')}</p>`}
    </section>`;

    const ads = `<section class="panel span8"><header class="ph"><div><h2>${t('Ads for this project')}</h2><p class="sub">${t('Each campaign has its own link, so buyers who register through it are counted for that ad.')}</p></div><button class="btn ghost small" data-act="addCampaignFor" data-id="${p.id}">${RE.icon('plus')}${t('Campaign')}</button></header>
      ${f.camps.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>${t('Campaign')}</th><th>${t('Spent of budget')}</th><th class="n">${t('Leads')}</th><th class="n">${t('Cost per lead')}</th><th></th></tr></thead><tbody>
        ${f.camps.map(c => { const n = Math.max(+c.leads || 0, f.crmByCamp(c.id)); return `<tr><td class="click" data-act="editCampaign" data-id="${c.id}"><b>${esc(c.name)}</b><small>${L('source', c.channel)} · ${RE.tag(c.status, L('cstatus', c.status))}</small></td><td><span class="barcell">${RE.hbar(c.spent, c.budget, c.spent > c.budget ? 'over' : '')}<b class="num">${RE.money(c.spent)} / ${RE.money(c.budget)}</b></span></td><td class="n">${n}<small>${t('{n} in CRM', { n: f.crmByCamp(c.id) })}</small></td><td class="n">${n ? RE.money(c.spent / n) : '-'}</td><td class="n"><button class="btn ghost small" data-act="copyAdLink" data-id="${c.id}" data-p="${p.id}">${RE.icon('copy')}${t('Ad link')}</button></td></tr>`; }).join('')}
      </tbody></table></div>` : `<p class="quiet">${t('No ads for this project yet.')}</p>`}</section>`;

    const planBox = `<section class="panel span4"><header class="ph"><h2>${t('Business plan')}</h2><button class="btn ghost small" data-act="projectPlan" data-id="${p.id}">${RE.icon('edit')}${t('Set targets')}</button></header>
      ${f.target ? `<div class="plan">
        ${planRow(t('Units'), f.sold, f.target, v => RE.num(v))}
        ${planRow(t('Commission'), f.commission, f.planCommission, v => RE.moneyShort(v))}
        ${f.budget ? planRow(t('Ad budget used'), f.spent, f.budget, v => RE.moneyShort(v), true) : ''}
        ${f.pace ? `<p class="sub">${f.sold >= f.pace.expected ? t('On track: {a} sold, {b} expected by today.', { a: f.sold, b: f.pace.expected }) : t('Behind: {a} sold, {b} expected by today.', { a: f.sold, b: f.pace.expected })} ${t('Plan ends {d}.', { d: RE.date(p.planEnd) })}</p>` : ''}
        <dl class="dl"><dt>${t('Planned sales value')}</dt><dd>${RE.money(f.planRevenue)}</dd><dt>${t('Planned commission')}</dt><dd>${RE.money(f.planCommission)}</dd><dt>${t('Planned net after ads')}</dt><dd>${RE.money(f.planCommission - f.budget)}</dd></dl>
      </div>` : `<p class="quiet">${t('Set how many units you plan to sell, by when, and the ad budget. Progress then fills in from sales and ads.')}</p>`}
    </section>`;

    return head + `<div class="grid">${media}${sales}${team}${ads}${planBox}</div>`;
  };
  function planRow(label, actual, plan, fmt, cost) {
    const w = plan ? Math.min(100, actual / plan * 100) : 0;
    return `<div class="planrow"><div class="row"><span class="grow">${label}</span><b class="num">${fmt(actual)} <span class="per">/ ${fmt(plan)}</span></b></div><span class="hbar ${cost && actual > plan ? 'over' : ''}"><i style="width:${w.toFixed(1)}%"></i></span></div>`;
  }

  /* ---------- business plan across all projects ---------- */
  V.plan = function () {
    const S = RE.state, files = S.projects.map(p => RE.projectFile(p.id)).filter(Boolean);
    const T = files.reduce((a, f) => { ['sold', 'target', 'revenue', 'planRevenue', 'commission', 'planCommission', 'spent', 'budget', 'net'].forEach(k => { a[k] = (a[k] || 0) + f[k]; }); return a; }, {});
    const other = RE.sum(S.deals.filter(d => !d.projectId && d.date.slice(0, 4) === RE.today().slice(0, 4)), 'commission');
    const kpi = (label, val, sub) => `<div class="kpi"><span class="eyebrow">${label}</span><strong>${val}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
    if (!files.length) return RE.empty(t('Add a residential project to start the business plan.'), 'addProject', t('Add a project'));
    return `<div class="toolbar"><p class="sub grow">${t('Targets you set on each project against what sales and ads have actually done.')}</p></div>
      <div class="kpis five">${kpi(t('Units sold'), `${T.sold} / ${T.target}`, t('{p}% of plan', { p: pct(T.sold, T.target) }))}${kpi(t('Commission'), RE.moneyShort(T.commission), t('of {m} planned', { m: RE.moneyShort(T.planCommission) }))}${kpi(t('Ad spend'), RE.moneyShort(T.spent), t('of {m} budget', { m: RE.moneyShort(T.budget) }))}${kpi(t('Net after ads'), RE.moneyShort(T.net))}${kpi(t('Other commission this year'), RE.moneyShort(other), t('resale and rentals, outside projects'))}</div>
      <section class="panel flush"><div class="tscroll"><table class="tbl"><thead><tr><th>${t('Project')}</th><th class="n">${t('Rate')}</th><th>${t('Units')}</th><th class="n">${t('Commission')}</th><th class="n">${t('Planned')}</th><th>${t('Ad budget used')}</th><th class="n">${t('Net after ads')}</th><th>${t('Team')}</th><th>${t('Pace')}</th></tr></thead><tbody>
        ${files.map(f => `<tr class="click" data-act="openProject" data-id="${f.p.id}" tabindex="0"><td><b>${esc(f.p.name)}</b><small>${esc(L('pstatus', f.p.status))}${f.p.planEnd ? ' · ' + t('ends {d}', { d: RE.dayMonth(f.p.planEnd) }) : ''}</small></td>
          <td class="n">${f.rate}%</td><td><span class="barcell">${RE.hbar(f.sold, f.target)}<b class="num">${f.sold} / ${f.target || '-'}</b></span></td>
          <td class="n">${RE.money(f.commission)}</td><td class="n">${RE.money(f.planCommission)}</td>
          <td>${f.budget ? `<span class="barcell">${RE.hbar(f.spent, f.budget, f.spent > f.budget ? 'over' : '')}<b class="num">${RE.moneyShort(f.spent)} / ${RE.moneyShort(f.budget)}</b></span>` : `<span class="chip">${RE.moneyShort(f.spent)}</span>`}</td>
          <td class="n"><b>${RE.money(f.net)}</b></td><td><span class="avs">${f.agents.map(a => RE.avatar(a.name, a.color, 'sm')).join('')}</span></td>
          <td>${f.pace ? (f.sold >= f.pace.expected ? RE.tag('won', t('On track')) : RE.tag('followup', t('Behind by {n}', { n: f.pace.expected - f.sold }))) : `<span class="chip">${t('No dates')}</span>`}</td></tr>`).join('')}
      </tbody></table></div></section>`;
  };

  /* ---------- forms ---------- */
  RE.projectSaleForm = function (p) {
    const S = RE.state, f = RE.projectFile(p.id), buyers = f.active;
    RE.form({
      title: t('Sale in {p}', { p: p.name }), submit: t('Record sale'),
      fields: [
        { name: 'leadId', label: t('Buyer'), type: 'select', wide: true, options: [['', t('Someone not in the CRM')]].concat(buyers.map(l => [l.id, l.name + (l.phone ? ' · ' + l.phone : '')])) },
        { name: 'client', label: t('Buyer name'), hint: t('Only needed when the buyer is not in the CRM') },
        { name: 'unit', label: t('Unit'), placeholder: t('Villa B-12 or Tower 2, 1104') },
        { name: 'amount', label: t('Sale price'), type: 'number', required: true, value: p.priceFrom },
        { name: 'commission', label: t('Commission'), type: 'number', hint: t('Leave empty for {p}% of the price', { p: f.rate }) },
        { name: 'agentId', label: t('Agent'), type: 'select', options: [['', t('Unassigned')]].concat((f.agents.length ? f.agents : S.agents).map(a => [a.id, a.name])), value: f.agents[0] && f.agents[0].id },
        { name: 'date', label: t('Date'), type: 'date', required: true, value: RE.today() }
      ],
      onSubmit: v => {
        const lead = v.leadId && RE.get('leads', v.leadId), client = lead ? lead.name : v.client;
        if (!client) return t('Choose the buyer or type their name.');
        const commission = v.commission != null ? v.commission : Math.round(v.amount * f.rate / 100);
        RE.put('deals', { client, title: p.name + (v.unit ? ', ' + v.unit : ''), amount: v.amount, commission, date: v.date, kind: 'sale', agentId: v.agentId || (lead && lead.agentId) || '', projectId: p.id, leadId: lead ? lead.id : '', propertyId: '' });
        if (lead) RE.put('leads', { id: lead.id, stage: 'won', lastContact: v.date, nextFollowUp: '' });
        if (p.unitsAvailable > 0) RE.put('projects', { id: p.id, unitsAvailable: p.unitsAvailable - 1, status: p.unitsAvailable - 1 === 0 ? 'soldout' : p.status });
        RE.toast(t('Sale recorded. {m} commission added.', { m: RE.money(commission) }));
      }
    });
  };

  RE.projectPlanForm = function (p) {
    RE.form({
      title: t('Business plan for {p}', { p: p.name }), submit: t('Save plan'),
      fields: [
        { name: 'targetUnits', label: t('Units to sell'), type: 'number', value: p.targetUnits, required: true },
        { name: 'commissionPct', label: t('Commission on this project, %'), type: 'number', value: p.commissionPct != null ? p.commissionPct : RE.state.settings.commissionPct },
        { name: 'planStart', label: t('Plan starts'), type: 'date', value: p.planStart || RE.today() },
        { name: 'planEnd', label: t('Plan ends'), type: 'date', value: p.planEnd || RE.addDays(RE.today(), 180) },
        { name: 'adBudget', label: t('Ad budget'), type: 'number', value: p.adBudget }
      ],
      onSubmit: v => {
        if (v.planEnd && v.planStart && v.planEnd <= v.planStart) return t('The plan has to end after it starts.');
        RE.put('projects', Object.assign({ id: p.id }, v)); RE.toast(t('Plan saved'));
      }
    });
  };

  RE.projectTeamForm = function (p) {
    const S = RE.state, on = new Set(p.agentIds || []);
    if (!S.agents.length) { RE.toast(t('Add your team first, in Team.')); return; }
    RE.modal(`<form id="teamPick">${RE.dlgHead(t('Team on {p}', { p: p.name }))}<div class="dlg-b"><p class="sub">${t('Choose the agents who sell this project.')}</p>
      <div class="picks">${S.agents.map(a => `<label class="check pick"><input type="checkbox" name="a" value="${a.id}"${on.has(a.id) ? ' checked' : ''}>${RE.avatar(a.name, a.color, 'sm')}<span><b>${esc(a.name)}</b><small>${L('role', a.role)}</small></span></label>`).join('')}</div></div>
      <footer class="dlg-f"><span class="grow"></span><button type="button" class="btn ghost" data-act="closeDlg">${t('Cancel')}</button><button class="btn" type="submit">${t('Save')}</button></footer></form>`);
    document.getElementById('teamPick').onsubmit = e => {
      e.preventDefault();
      RE.put('projects', { id: p.id, agentIds: Array.from(e.target.querySelectorAll('input[name=a]:checked')).map(x => x.value) });
      RE.closeDlg(); RE.render(); RE.toast(t('Team saved'));
    };
  };

  RE.shareProject = function (p, campaignId) {
    const link = RE.projectLink(p, campaignId);
    if (!link) { RE.modal(`${RE.dlgHead(t('Project link'))}<div class="dlg-b"><p>${t('Project links work once the office database is connected, so clients can open the page from anywhere.')}</p></div><footer class="dlg-f"><span class="grow"></span><a class="btn" href="#office" data-act="closeDlg">${t('Connect the office database')}</a></footer>`); return; }
    if (p.public !== 'yes') {
      RE.confirm(t('{p} is not public yet. Make its page public so anyone with the link can see the photos, video, VR and prices?', { p: p.name }), t('Make public'), () => { RE.put('projects', { id: p.id, public: 'yes' }); RE.render(); RE.shareProject(RE.get('projects', p.id), campaignId); });
      return;
    }
    const camp = campaignId && RE.get('campaigns', campaignId);
    const text = t('{p}: photos, video and prices. Register your interest here: {u}', { p: p.name, u: link });
    RE.modal(`${RE.dlgHead(camp ? t('Ad link for {c}', { c: camp.name }) : t('Project link'))}<div class="dlg-b">
      <p class="sub">${camp ? t('Put this link in the ad. Buyers who register through it are counted for this campaign.') : t('Send this link to clients. They see photos, video, VR and prices, and can register their interest. Each registration arrives as a new lead.')}</p>
      <input class="linkbox" readonly value="${esc(link)}" onclick="this.select()">
      </div><footer class="dlg-f wrap"><a class="btn ghost" href="${esc(link)}" target="_blank" rel="noopener">${t('Open the page')}</a><button class="btn ghost" data-act="copyText" data-t="${esc(link)}">${RE.icon('copy')}${t('Copy')}</button><span class="grow"></span><a class="btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${RE.icon('chat')}${t('Send on WhatsApp')}</a></footer>`);
  };
})(window.RE);
