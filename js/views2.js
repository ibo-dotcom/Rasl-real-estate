/* Rasl Estate — views: rewards, join & charity, team, market, ads, reports, office */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), L = (g, k) => RE.label(g, k);
  const V = RE.views;
  const tile = (label, val, sub) => `<div class="kpi"><span class="eyebrow">${label}</span><strong>${val}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

  /* ---------------- rewards ---------------- */
  V.rewards = function () {
    const S = RE.state, P = RE.POINTS;
    const rows = S.agents.map(a => ({ a, s: RE.agentStats(a.id) })).sort((x, y) => y.s.points - x.s.points);
    const top = Math.max(1, ...rows.map(r => r.s.points));
    return `${RE.codeStrip()}
    <div class="grid">
      <section class="panel span8">
        <header class="ph"><div><h2>${t('Leaderboard')}</h2><p class="sub">${t('Points come from recorded work, so the table updates itself.')}</p></div></header>
        ${rows.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>#</th><th>${t('Agent')}</th><th>${t('Tier')}</th><th class="n">${t('Points')}</th><th>${t('To next tier')}</th></tr></thead><tbody>
          ${rows.map((r, i) => { const tr = RE.tier(r.s.points); return `<tr><td class="num">${i + 1}</td><td><span class="row">${RE.avatar(r.a.name, r.a.color, 'sm')}<b>${esc(r.a.name)}</b></span></td><td><span class="tier tier-${tr.name.toLowerCase()}">${t(tr.name)}</span></td><td class="n"><b>${RE.num(r.s.points)}</b></td>
            <td>${tr.next ? `${RE.hbar(r.s.points - tr.from, tr.nextAt - tr.from)}<small>${t('{n} points to {tier}', { n: RE.num(tr.nextAt - r.s.points), tier: t(tr.next) })}</small>` : `<small>${t('Top tier reached')}</small>`}</td></tr>`; }).join('')}
        </tbody></table></div>` : RE.empty(t('Add your team to start the leaderboard.'), 'addAgent', t('Add a team member'))}
      </section>
      <div class="span4 stack">
        <section class="panel"><header class="ph"><h2>${t('How points are earned')}</h2></header>
          <dl class="dl"><dt>${t('Deal closed')}</dt><dd>${P.deal}</dd><dt>${t('Office that joined through you')}</dt><dd>${P.referral}</dd><dt>${t('Visit completed')}</dt><dd>${P.visit}</dd><dt>${t('Lead added')}</dt><dd>${P.lead}</dd></dl></section>
        <section class="panel"><header class="ph"><h2>${t('Tiers')}</h2></header>
          <dl class="dl">${RE.TIERS.map(x => `<dt><span class="tier tier-${x[0].toLowerCase()}">${t(x[0])}</span></dt><dd>${RE.num(x[1])}+</dd>`).join('')}</dl></section>
      </div>
    </div>`;
  };

  /* ---------------- join & charity ---------------- */
  V.join = function () {
    const S = RE.state, st = S.settings;
    const pledged = RE.sum(S.deals, 'commission') * (st.charityPct || 0) / 100, given = RE.sum(S.donations, 'amount'), left = Math.max(0, pledged - given);
    const joined = S.referrals.filter(r => r.status === 'joined').length;
    return `${RE.codeStrip()}
    <div class="grid">
      <section class="panel span6">
        <header class="ph"><div><h2>${t('Joined through your ID')}</h2><p class="sub">${t('{a} joined, {b} invited', { a: joined, b: S.referrals.length - joined })}</p></div><button class="btn ghost small" data-act="addReferral">${RE.icon('plus')}${t('Invite')}</button></header>
        ${S.referrals.length ? `<ul class="rows">${S.referrals.slice().sort((a, b) => b.date.localeCompare(a.date)).map(r => `<li class="click" data-act="editReferral" data-id="${r.id}" tabindex="0"><span class="grow"><b>${esc(r.name)}</b><small><span class="num">${esc(r.phone || '')}</span> · ${RE.date(r.date)} · ${esc(RE.agentName(r.agentId))}</small></span>${RE.tag(r.status, L('refstatus', r.status))}</li>`).join('')}</ul>` : RE.empty(t('Nobody has joined yet. Share your ID with another office to start.'), 'addReferral', t('Record an invite'))}
      </section>
      <section class="panel span6">
        <header class="ph"><div><h2>${t('Charity pledge')}</h2><p class="sub">${t('{p}% of every commission is set aside.', { p: st.charityPct || 0 })}</p></div><button class="btn ghost small" data-act="addDonation">${RE.icon('plus')}${t('Donation')}</button></header>
        <div class="kpis three">${tile(t('Pledged'), RE.money(pledged))}${tile(t('Given'), RE.money(given))}${tile(t('Still to give'), RE.money(left))}</div>
        <div class="meter" role="img" aria-label="${t('Given')}"><i style="width:${pledged ? Math.min(100, given / pledged * 100).toFixed(1) : 0}%"></i></div>
        ${S.donations.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>${t('Date')}</th><th>${t('Given to')}</th><th class="n">${t('Amount')}</th><th></th></tr></thead><tbody>
          ${S.donations.slice().sort((a, b) => b.date.localeCompare(a.date)).map(d => `<tr><td>${RE.date(d.date)}</td><td><b>${esc(d.to)}</b>${d.note ? `<small>${esc(d.note)}</small>` : ''}</td><td class="n">${RE.money(d.amount)}</td><td class="n"><button class="iconbtn" data-act="delDonation" data-id="${d.id}" aria-label="${t('Delete')}">${RE.icon('trash')}</button></td></tr>`).join('')}
        </tbody></table></div>` : `<p class="quiet">${t('No donation recorded yet.')}</p>`}
      </section>
    </div>`;
  };

  /* ---------------- team ---------------- */
  V.team = function () {
    const S = RE.state;
    const bar = `<div class="toolbar"><p class="sub grow">${t('{n} people', { n: S.agents.length })}</p><button class="btn" data-act="addAgent">${RE.icon('plus')}${t('Team member')}</button></div>`;
    if (!S.agents.length) return bar + RE.empty(t('Add yourself first, then the agents you work with.'), 'addAgent', t('Add a team member'));
    return bar + `<section class="panel flush"><div class="tscroll"><table class="tbl"><thead><tr><th>${t('Name')}</th><th>${t('Role')}</th><th class="n">${t('Active leads')}</th><th class="n">${t('Deals')}</th><th class="n">${t('Sales volume')}</th><th class="n">${t('Commission')}</th><th class="n">${t('Points')}</th></tr></thead><tbody>
      ${S.agents.map(a => { const s = RE.agentStats(a.id); return `<tr class="click" data-act="editAgent" data-id="${a.id}" tabindex="0"><td><span class="row">${RE.avatar(a.name, a.color)}<span><b>${esc(a.name)}</b><small class="num">${esc(a.phone || '')}</small></span></span></td><td>${L('role', a.role)}</td><td class="n">${s.active}</td><td class="n">${s.deals}</td><td class="n">${RE.money(s.volume)}</td><td class="n">${RE.money(s.commission)}</td><td class="n">${RE.num(s.points)}</td></tr>`; }).join('')}
    </tbody></table></div></section>`;
  };

  /* ---------------- market ---------------- */
  V.market = function () {
    const S = RE.state, ui = RE.ui;
    const cities = Array.from(new Set(S.properties.map(p => p.city).filter(Boolean)));
    const props = S.properties.filter(p => !ui.mkCity || p.city === ui.mkCity);
    const sale = props.filter(p => p.purpose !== 'rent');
    const groups = {};
    sale.forEach(p => { const k = p.district || t('Unknown'); (groups[k] = groups[k] || []).push(p); });
    const rows = Object.keys(groups).map(k => {
      const g = groups[k], m2 = g.filter(p => p.area > 0).map(p => p.price / p.area);
      return { k, n: g.length, ask: avg(g.map(p => +p.price || 0)), m2: avg(m2), demand: RE.activeLeads().filter(l => (l.district || '').toLowerCase() === k.toLowerCase()).length, days: avg(g.map(p => p.listedAt ? Math.max(0, Math.round((Date.now() - new Date(p.listedAt + 'T12:00:00')) / 864e5)) : 0)) };
    }).sort((a, b) => b.m2 - a.m2);
    const maxM2 = Math.max(0, ...rows.map(r => r.m2));
    const types = RE.TYPES.map(k => ({ k, supply: props.filter(p => p.type === k && p.status === 'available').length, demand: RE.activeLeads().filter(l => l.type === k && (!ui.mkCity || l.city === ui.mkCity)).length })).filter(x => x.supply || x.demand);
    const maxT = Math.max(1, ...types.map(x => Math.max(x.supply, x.demand)));
    const bar = `<div class="toolbar"><select id="mkCity" data-bind="mkCity" aria-label="${t('City')}">${RE.opts([['', t('All cities')]].concat(cities.map(c => [c, c])), ui.mkCity)}</select><p class="sub grow">${t('Worked out from your own listings and leads. It gets sharper as you record more.')}</p></div>`;
    if (!props.length) return bar + RE.empty(t('Market figures appear once you have listings.'), 'addProp', t('Add a property'));
    return bar + `<div class="grid">
      <section class="panel span8"><header class="ph"><div><h2>${t('Asking price by district')}</h2><p class="sub">${t('Listings for sale, ranked by price per square metre')}</p></div></header>
        ${rows.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>${t('District')}</th><th class="n">${t('Listings')}</th><th class="n">${t('Average asking')}</th><th>${t('Per m²')}</th><th class="n">${t('Leads asking')}</th><th class="n">${t('Days listed')}</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td><b>${esc(r.k)}</b></td><td class="n">${r.n}</td><td class="n">${RE.money(r.ask)}</td><td><span class="barcell">${RE.hbar(r.m2, maxM2)}<b class="num">${r.m2 ? RE.money(r.m2) : '-'}</b></span></td><td class="n">${r.demand}</td><td class="n">${Math.round(r.days)}</td></tr>`).join('')}
        </tbody></table></div>` : `<p class="quiet">${t('No sale listings in this city.')}</p>`}
      </section>
      <section class="panel span4"><header class="ph"><div><h2>${t('Supply and demand')}</h2><p class="sub">${t('Available listings against active leads, by type')}</p></div></header>
        <div class="legend"><i class="lg sup"></i>${t('Listings')}<i class="lg dem"></i>${t('Leads')}</div>
        <div class="sd">${types.map(x => `<div><span>${L('type', x.k)}</span><div>${RE.hbar(x.supply, maxT, 'sup')}<b class="num">${x.supply}</b></div><div>${RE.hbar(x.demand, maxT, 'dem')}<b class="num">${x.demand}</b></div>${x.demand > x.supply ? `<small>${t('Short by {n}: look for more of these', { n: x.demand - x.supply })}</small>` : ''}</div>`).join('')}</div>
      </section>
    </div>`;
  };

  /* ---------------- ads ---------------- */
  V.ads = function () {
    const S = RE.state, C = S.campaigns;
    const spent = RE.sum(C, 'spent'), leads = RE.sum(C, 'leads');
    const bar = `<div class="toolbar"><p class="sub grow">${t('Track what each campaign costs and what it brings in.')}</p><button class="btn" data-act="addCampaign">${RE.icon('plus')}${t('Campaign')}</button></div>`;
    if (!C.length) return bar + RE.empty(t('No campaigns yet. Record a boost, a reel or a sign board to see its cost per lead.'), 'addCampaign', t('Add a campaign'));
    const chan = RE.CHANNELS.map(k => { const cs = C.filter(c => c.channel === k); return { k, spent: RE.sum(cs, 'spent'), leads: RE.sum(cs, 'leads'), crm: S.leads.filter(l => l.source === k).length }; }).filter(x => x.spent || x.leads || x.crm);
    const maxS = Math.max(1, ...chan.map(x => x.spent));
    return bar + `<div class="kpis">${tile(t('Budget'), RE.money(RE.sum(C, 'budget')))}${tile(t('Spent'), RE.money(spent))}${tile(t('Leads from ads'), RE.num(leads))}${tile(t('Cost per lead'), leads ? RE.money(spent / leads) : '-')}</div>
    <div class="grid">
      <section class="panel span8 flush"><div class="tscroll"><table class="tbl"><thead><tr><th>${t('Campaign')}</th><th>${t('Channel')}</th><th>${t('Spent of budget')}</th><th class="n">${t('Leads')}</th><th class="n">${t('Cost per lead')}</th><th>${t('Status')}</th></tr></thead><tbody>
        ${C.map(c => { const p = RE.get('properties', c.propertyId); return `<tr class="click" data-act="editCampaign" data-id="${c.id}" tabindex="0"><td><b>${esc(c.name)}</b><small>${p ? esc(p.title) + ' · ' : ''}${RE.dayMonth(c.start)}${c.end ? ' – ' + RE.dayMonth(c.end) : ''}</small></td><td>${L('source', c.channel)}</td><td><span class="barcell">${RE.hbar(c.spent, c.budget, c.spent > c.budget ? 'over' : '')}<b class="num">${RE.money(c.spent)} / ${RE.money(c.budget)}</b></span></td><td class="n">${RE.num(c.leads)}</td><td class="n">${c.leads ? RE.money(c.spent / c.leads) : '-'}</td><td>${RE.tag(c.status, L('cstatus', c.status))}</td></tr>`; }).join('')}
      </tbody></table></div></section>
      <section class="panel span4"><header class="ph"><div><h2>${t('By channel')}</h2><p class="sub">${t('Spend, with leads the channel reported and leads in your CRM')}</p></div></header>
        <div class="sd">${chan.map(x => `<div><span>${L('source', x.k)}</span><div>${RE.hbar(x.spent, maxS)}<b class="num">${RE.money(x.spent)}</b></div><small>${t('{a} reported · {b} in CRM', { a: x.leads, b: x.crm })}</small></div>`).join('')}</div>
      </section>
    </div>`;
  };

  /* ---------------- reports ---------------- */
  RE.repFrom = function () {
    const now = new Date(), r = RE.ui.repRange;
    if (r === 'month') return RE.iso(new Date(now.getFullYear(), now.getMonth(), 1));
    if (r === 'quarter') return RE.iso(new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1));
    if (r === 'year') return RE.iso(new Date(now.getFullYear(), 0, 1));
    return '0000-00-00';
  };
  V.reports = function () {
    const S = RE.state, ui = RE.ui, from = RE.repFrom();
    const deals = S.deals.filter(d => d.date >= from), leads = S.leads.filter(l => (l.createdAt || '') >= from);
    const won = leads.filter(l => l.stage === 'won').length;
    const byAgent = S.agents.map(a => { const ds = deals.filter(d => d.agentId === a.id); return { a, deals: ds.length, vol: RE.sum(ds, 'amount'), com: RE.sum(ds, 'commission'), leads: leads.filter(l => l.agentId === a.id).length }; }).sort((x, y) => y.com - x.com);
    const bySrc = RE.SOURCES.map(k => { const ls = leads.filter(l => l.source === k); return { k, n: ls.length, won: ls.filter(l => l.stage === 'won').length }; }).filter(x => x.n).sort((a, b) => b.n - a.n);
    const maxSrc = Math.max(1, ...bySrc.map(x => x.n));
    const byStage = RE.STAGES.map(k => ({ k, n: S.leads.filter(l => l.stage === k).length })), maxSt = Math.max(1, ...byStage.map(x => x.n));
    return `<div class="toolbar"><select id="repRange" data-bind="repRange" aria-label="${t('Period')}">${RE.opts([['month', t('This month')], ['quarter', t('This quarter')], ['year', t('This year')], ['all', t('All time')]], ui.repRange)}</select><span class="grow"></span>
      <button class="btn ghost" data-act="exportCsv" data-k="leads">${RE.icon('download')}${t('Leads CSV')}</button><button class="btn ghost" data-act="exportCsv" data-k="properties">${RE.icon('download')}${t('Properties CSV')}</button><button class="btn ghost" data-act="exportCsv" data-k="deals">${RE.icon('download')}${t('Deals CSV')}</button>${RE.embedded ? '' : `<button class="btn ghost" data-act="print">${RE.icon('print')}${t('Print')}</button>`}</div>
    <div class="kpis five">${tile(t('New leads'), leads.length)}${tile(t('Deals closed'), deals.length)}${tile(t('Sales volume'), RE.moneyShort(RE.sum(deals, 'amount')))}${tile(t('Commission'), RE.money(RE.sum(deals, 'commission')))}${tile(t('Lead to deal'), leads.length ? Math.round(won / leads.length * 100) + '%' : '-', t('of leads created in the period'))}</div>
    <div class="grid">
      <section class="panel span8"><header class="ph"><h2>${t('Deals')}</h2></header>
        ${deals.length ? `<div class="tscroll"><table class="tbl"><thead><tr><th>${t('Date')}</th><th>${t('Client')}</th><th>${t('Property')}</th><th>${t('Agent')}</th><th class="n">${t('Amount')}</th><th class="n">${t('Commission')}</th><th></th></tr></thead><tbody>
          ${deals.slice().sort((a, b) => b.date.localeCompare(a.date)).map(d => `<tr><td>${RE.date(d.date)}</td><td><b>${esc(d.client)}</b></td><td>${esc(d.title || '')}</td><td>${esc(RE.agentName(d.agentId))}</td><td class="n">${RE.money(d.amount)}</td><td class="n">${RE.money(d.commission)}</td><td class="n"><button class="iconbtn" data-act="delDeal" data-id="${d.id}" aria-label="${t('Delete')}">${RE.icon('trash')}</button></td></tr>`).join('')}
        </tbody></table></div>` : `<p class="quiet">${t('No deal closed in this period.')}</p>`}
      </section>
      <div class="span4 stack">
        <section class="panel"><header class="ph"><h2>${t('Pipeline now')}</h2></header><div class="sd">${byStage.map(x => `<div class="one"><span>${L('stage', x.k)}</span><div>${RE.hbar(x.n, maxSt)}<b class="num">${x.n}</b></div></div>`).join('')}</div></section>
        <section class="panel"><header class="ph"><h2>${t('Where leads came from')}</h2></header>${bySrc.length ? `<div class="sd">${bySrc.map(x => `<div class="one"><span>${L('source', x.k)}</span><div>${RE.hbar(x.n, maxSrc)}<b class="num">${x.n}</b></div>${x.won ? `<small>${t('{n} became deals', { n: x.won })}</small>` : ''}</div>`).join('')}</div>` : `<p class="quiet">${t('No new leads in this period.')}</p>`}</section>
      </div>
      <section class="panel span12"><header class="ph"><h2>${t('By agent')}</h2></header>
        <div class="tscroll"><table class="tbl"><thead><tr><th>${t('Agent')}</th><th class="n">${t('New leads')}</th><th class="n">${t('Deals')}</th><th class="n">${t('Sales volume')}</th><th class="n">${t('Commission')}</th></tr></thead><tbody>
        ${byAgent.map(r => `<tr><td><span class="row">${RE.avatar(r.a.name, r.a.color, 'sm')}<b>${esc(r.a.name)}</b></span></td><td class="n">${r.leads}</td><td class="n">${r.deals}</td><td class="n">${RE.money(r.vol)}</td><td class="n">${RE.money(r.com)}</td></tr>`).join('') || `<tr><td colspan="5" class="quiet">${t('No team members yet.')}</td></tr>`}
        </tbody></table></div></section>
    </div>`;
  };

  /* ---------------- office (settings) ---------------- */
  V.office = function () {
    const st = RE.state.settings, n = RE.COLLS.reduce((a, c) => a + RE.state[c].length, 0);
    const f = (id, label, input, hint) => `<div class="fld"><label for="${id}">${label}</label>${input}${hint ? `<small>${hint}</small>` : ''}</div>`;
    return `<div class="grid">
      <section class="panel span8"><header class="ph"><h2>${t('Office details')}</h2></header>
        <form id="officeForm" class="fgrid">
          ${f('o-office', t('Office name'), `<input id="o-office" name="office" value="${esc(st.office)}" required>`)}
          ${f('o-me', t('Your name'), `<input id="o-me" name="me" value="${esc(st.me)}">`)}
          ${f('o-currency', t('Currency'), `<select id="o-currency" name="currency">${RE.opts([['USD', 'US dollar ($)'], ['IQD', 'Iraqi dinar (IQD)']], st.currency)}</select>`, t('Changes the label only. Amounts are not converted.'))}
          ${f('o-goal', t('Yearly commission goal'), `<input id="o-goal" name="goal" type="number" min="0" step="any" value="${esc(st.goal)}">`)}
          ${f('o-com', t('Usual commission, %'), `<input id="o-com" name="commissionPct" type="number" min="0" max="100" step="any" value="${esc(st.commissionPct)}">`, t('Pre-fills the commission when you close a deal.'))}
          ${f('o-char', t('Charity pledge, % of commission'), `<input id="o-char" name="charityPct" type="number" min="0" max="100" step="any" value="${esc(st.charityPct)}">`)}
          <div class="fld wide"><button class="btn" type="submit">${t('Save details')}</button></div>
        </form>
      </section>
      <section class="panel span4"><header class="ph"><h2>${t('Your records')}</h2></header>
        <p class="sub">${t('{n} records are kept in this browser on this device. Save a backup file regularly, and use it to move to another device.', { n })}</p>
        <div class="stack tight">
          <button class="btn ghost" data-act="exportBackup">${RE.icon('download')}${t('Save a backup')}</button>
          <label class="btn ghost filebtn">${RE.icon('upload')}${t('Restore from a backup')}<input type="file" id="o-import" accept="application/json,.json" data-import="1"></label>
          ${RE.hasSamples() ? `<button class="btn ghost" data-act="removeSamples">${t('Remove samples')}</button>` : `<button class="btn ghost" data-act="loadSamples">${t('Load sample records')}</button>`}
          <button class="btn ghost danger-t" data-act="eraseAll">${RE.icon('trash')}${t('Erase everything')}</button>
        </div>
      </section>
    </div>`;
  };
})(window.RE);
