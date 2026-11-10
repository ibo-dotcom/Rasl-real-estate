/* Rasl Estate — data layer: state, persistence, selectors, sample data */
window.RE = window.RE || {};
(function (RE) {
  const KEY = 'rasl-estate-v1';
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const uid = () => Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 8);
  const COLLS = ['agents', 'properties', 'leads', 'deals', 'appointments', 'campaigns', 'donations', 'referrals'];

  RE.uid = uid;
  RE.iso = iso;
  RE.today = () => iso(new Date());
  RE.addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  RE.COLLS = COLLS;
  RE.STAGES = ['new', 'contacted', 'followup', 'visit', 'negotiation', 'won', 'lost'];
  RE.TYPES = ['villa', 'house', 'apartment', 'land', 'commercial'];
  RE.STATUSES = ['available', 'reserved', 'sold', 'rented'];
  RE.SOURCES = ['facebook', 'instagram', 'tiktok', 'snapchat', 'walkin', 'referral', 'signboard', 'website'];
  RE.CHANNELS = ['facebook', 'instagram', 'tiktok', 'snapchat', 'signboard', 'website'];
  RE.ROLES = ['manager', 'agent', 'assistant'];
  RE.COLORS = ['#2F7D62', '#B7791F', '#3F6FA8', '#9A4F7C', '#6B6FB5', '#A8552B'];
  RE.POINTS = { deal: 100, visit: 15, lead: 5, referral: 50 };
  RE.TIERS = [['Bronze', 0], ['Silver', 300], ['Gold', 800], ['Platinum', 1500]];

  function blank() {
    const s = {
      v: 1,
      settings: { office: 'Rasl Estate', me: '', currency: 'USD', goal: 100000, commissionPct: 2, charityPct: 5, lang: 'en', theme: 'system', agentCode: '' },
      seeded: false
    };
    COLLS.forEach(c => { s[c] = []; });
    return s;
  }
  RE.blank = blank;

  RE.load = function () {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    if (!s || !s.settings) {
      RE.state = blank();
      RE.seed();
      RE.persist();
    } else {
      const b = blank();
      s.settings = Object.assign(b.settings, s.settings);
      COLLS.forEach(c => { if (!Array.isArray(s[c])) s[c] = []; });
      RE.state = s;
    }
  };

  RE.persist = function () {
    try { localStorage.setItem(KEY, JSON.stringify(RE.state)); return true; }
    catch (e) { RE.storageFailed = true; return false; }
  };

  RE.get = (coll, id) => RE.state[coll].find(x => x.id === id);
  RE.put = function (coll, obj) {
    const list = RE.state[coll];
    if (obj.id) {
      const i = list.findIndex(x => x.id === obj.id);
      if (i >= 0) list[i] = Object.assign({}, list[i], obj); else list.push(obj);
    } else { obj.id = uid(); list.push(obj); }
    RE.persist();
    return obj;
  };
  RE.del = function (coll, id) {
    RE.state[coll] = RE.state[coll].filter(x => x.id !== id);
    RE.persist();
  };

  /* ---------- selectors ---------- */
  RE.isActive = l => l.stage !== 'won' && l.stage !== 'lost';
  RE.activeLeads = () => RE.state.leads.filter(RE.isActive);
  RE.sum = (list, key) => list.reduce((a, x) => a + (+x[key] || 0), 0);

  // A lead matches a listing when purpose, type and budget line up (and city, when the lead named one).
  RE.matches = function (lead, p) {
    const want = p.purpose === 'rent' ? 'rent' : 'buy';
    if (lead.want !== want) return false;
    if (lead.type && p.type && lead.type !== p.type) return false;
    if (lead.city && p.city && lead.city.trim().toLowerCase() !== p.city.trim().toLowerCase()) return false;
    if (lead.budget && p.price && +lead.budget < +p.price * 0.9) return false;
    return true;
  };
  RE.leadsFor = p => RE.activeLeads().filter(l => RE.matches(l, p));
  RE.propsFor = l => RE.state.properties.filter(p => p.status === 'available' && RE.matches(l, p));

  RE.dueLeads = () => { const t = RE.today(); return RE.activeLeads().filter(l => l.nextFollowUp && l.nextFollowUp <= t); };
  RE.expiring = () => { const lim = RE.addDays(RE.today(), 7); return RE.state.properties.filter(p => p.status === 'available' && p.expiresAt && p.expiresAt <= lim); };

  RE.points = function (agentId) {
    const S = RE.state, P = RE.POINTS;
    return S.deals.filter(d => d.agentId === agentId).length * P.deal +
      S.appointments.filter(a => a.agentId === agentId && a.done).length * P.visit +
      S.leads.filter(l => l.agentId === agentId).length * P.lead +
      S.referrals.filter(r => r.agentId === agentId && r.status === 'joined').length * P.referral;
  };
  RE.tier = function (pts) {
    let i = 0;
    RE.TIERS.forEach((t, k) => { if (pts >= t[1]) i = k; });
    const next = RE.TIERS[i + 1];
    return { name: RE.TIERS[i][0], next: next ? next[0] : null, nextAt: next ? next[1] : null, from: RE.TIERS[i][1] };
  };
  RE.agentStats = function (id) {
    const S = RE.state, deals = S.deals.filter(d => d.agentId === id);
    return {
      active: S.leads.filter(l => l.agentId === id && RE.isActive(l)).length,
      deals: deals.length, volume: RE.sum(deals, 'amount'), commission: RE.sum(deals, 'commission'), points: RE.points(id)
    };
  };
  RE.newCode = () => 'RE' + String(Math.floor(10000000 + Math.random() * 89999999));

  /* ---------- sample data (dated relative to today so reminders are live) ---------- */
  RE.seed = function () {
    const S = RE.state, td = RE.today(), D = n => RE.addDays(td, n);
    const mk = o => Object.assign(o, { id: uid(), sample: true });
    const ag = [['Karwan Mahmood', 'manager', '+9647501234567'], ['Media Faraj', 'agent', '+9647502345678'], ['Omar Hussein', 'agent', '+9647703456789']]
      .map((a, i) => mk({ name: a[0], role: a[1], phone: a[2], color: RE.COLORS[i] }));
    S.agents.push(...ag);

    const props = [
      ['Sunrise Villa', 'E-1024', 'villa', 'sale', 'Erbil', 'Ankawa', 690000, 1, 5, 4, 400, 2024, 'available', 145, 40, 50, 36.2290, 43.9930, 0],
      ['The Orchid', 'E-2051', 'villa', 'sale', 'Erbil', 'Bakhtiary', 420000, 1, 4, 3, 320, 2021, 'available', 985, 75, 3, 36.1972, 44.0310, 1],
      ['Shorsh Land', 'L-3307', 'land', 'sale', 'Erbil', 'Shorsh', 180000, 1, null, null, 250, null, 'available', 610, 20, 70, 36.2010, 44.0190, 2],
      ['Palm Court', 'E-4412', 'villa', 'sale', 'Erbil', 'Ankawa', 610000, 1, 5, 5, 380, 2023, 'reserved', 402, 55, 35, 36.2335, 43.9860, 0],
      ['Harbor View', 'B-5120', 'apartment', 'sale', 'Baghdad', 'Karrada', 180000, 30, 3, 2, 145, 2025, 'available', 610, 28, 2, 33.3005, 44.4250, 2],
      ['Dream City House', 'E-6018', 'house', 'sale', 'Erbil', 'Dream City', 540000, 1, 4, 4, 300, 2019, 'available', 233, 12, 78, 36.2093, 43.9690, 1],
      ['Empire Tower Flat', 'E-7240', 'apartment', 'rent', 'Erbil', 'Empire World', 1400, 1, 2, 2, 120, 2018, 'available', 318, 9, 51, 36.1961, 43.9655, 1],
      ['Italian Village Shop', 'C-8103', 'commercial', 'rent', 'Erbil', 'Italian Village', 2600, 1, null, 1, 85, 2016, 'rented', 97, 120, null, 36.2278, 43.9603, 0]
    ].map(r => mk({
      title: r[0], plot: r[1], type: r[2], purpose: r[3], city: r[4], district: r[5], price: r[6], units: r[7], beds: r[8], baths: r[9],
      area: r[10], built: r[11], status: r[12], views: r[13], listedAt: D(-r[14]), expiresAt: r[15] == null ? '' : D(r[15]),
      lat: r[16], lng: r[17], agentId: ag[r[18]].id, photos: [], notes: ''
    }));
    S.properties.push(...props);

    const leads = [
      ['Michael Reynolds', '+9647504410021', 'buy', 'villa', 430000, 'Erbil', 'Bakhtiary', 'followup', 'facebook', 0, 13, -1, 30],
      ['Robert Fox', '+9647504410388', 'buy', 'villa', 690000, 'Erbil', 'Ankawa', 'won', 'referral', 1, 14, null, 61],
      ['Sara Ali', '+9647704415520', 'buy', 'villa', 650000, 'Erbil', 'Ankawa', 'negotiation', 'instagram', 0, 2, 0, 24],
      ['Dilan Aziz', '+9647504417713', 'buy', 'land', 200000, 'Erbil', 'Shorsh', 'contacted', 'walkin', 2, 6, -2, 11],
      ['Ahmed Jabbar', '+9647804419046', 'buy', 'apartment', 190000, 'Baghdad', 'Karrada', 'new', 'facebook', 2, 3, 2, 3],
      ['Shilan Othman', '+9647504412277', 'rent', 'apartment', 1500, 'Erbil', 'Empire World', 'visit', 'instagram', 1, 1, 1, 8],
      ['Hawre Kamal', '+9647504418895', 'buy', 'house', 420000, 'Erbil', 'Dream City', 'won', 'signboard', 1, 44, null, 90],
      ['Noor Al-Tamimi', '+9647804413302', 'buy', 'apartment', 150000, 'Baghdad', 'Mansour', 'lost', 'tiktok', 2, 37, null, 58]
    ].map(r => mk({
      name: r[0], phone: r[1], want: r[2], type: r[3], budget: r[4], city: r[5], district: r[6], stage: r[7], source: r[8],
      agentId: ag[r[9]].id, lastContact: D(-r[10]), nextFollowUp: r[11] == null ? '' : D(r[11]), createdAt: D(-r[12]), notes: ''
    }));
    S.leads.push(...leads);

    const now = new Date();
    const clients = ['Robert Fox', 'Hawre Kamal', 'Lana Barzani', 'Yusuf Kareem', 'Rebin Salih', 'Zainab Hadi', 'Aram Jalal', 'Mariam Yousif', 'Soran Ali', 'Huda Nasser', 'Bestun Rashid', 'Tara Ismail', 'Ali Kadhim'];
    const places = ['Villa, Ankawa', 'House, Dream City', 'Apartment, Empire World', 'Land, Shorsh', 'Villa, Bakhtiary', 'Apartment, Karrada', 'Villa, Ankawa', 'Land, Kasnazan', 'House, Zakaria', 'Apartment, Mansour', 'Land, Shorsh', 'House, Havalan', 'Apartment, Gulan'];
    [[0, 690000], [1, 420000], [1, 310000], [2, 180000], [3, 520000], [4, 260000], [5, 610000], [5, 145000], [6, 330000], [8, 240000], [9, 150000], [12, 380000], [13, 220000]]
      .forEach((r, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - r[0], r[0] === 0 ? Math.max(1, Math.min(now.getDate(), 12) - 1) : 8 + (i * 5) % 17);
        S.deals.push(mk({
          client: clients[i], title: places[i], amount: r[1], commission: Math.round(r[1] * 0.02), date: iso(d), kind: 'sale',
          agentId: ag[i % 3].id, leadId: i < 2 ? leads[[1, 6][i]].id : '', propertyId: ''
        }));
      });

    S.appointments.push(
      mk({ title: 'Visit with Michael Reynolds', place: 'The Orchid, Bakhtiary', date: td, time: '11:00', agentId: ag[0].id, done: false }),
      mk({ title: 'Contract signing, Sara Ali', place: 'Office', date: td, time: '15:30', agentId: ag[0].id, done: false }),
      mk({ title: 'Viewing with Shilan Othman', place: 'Empire Tower Flat', date: D(1), time: '10:00', agentId: ag[1].id, done: false }),
      mk({ title: 'Site survey', place: 'Shorsh Land, plot L-3307', date: D(3), time: '09:00', agentId: ag[2].id, done: false }),
      mk({ title: 'Viewing with Robert Fox', place: 'Sunrise Villa', date: D(-16), time: '12:00', agentId: ag[1].id, done: true }),
      mk({ title: 'Viewing with Hawre Kamal', place: 'Dream City', date: D(-47), time: '17:00', agentId: ag[1].id, done: true })
    );
    S.campaigns.push(
      mk({ name: 'Ankawa villas, autumn', channel: 'facebook', propertyId: props[0].id, budget: 1200, spent: 860, leads: 31, start: D(-25), end: D(20), status: 'running' }),
      mk({ name: 'Harbor View launch reels', channel: 'instagram', propertyId: props[4].id, budget: 2000, spent: 1975, leads: 44, start: D(-28), end: D(2), status: 'running' }),
      mk({ name: 'Shorsh plot sign board', channel: 'signboard', propertyId: props[2].id, budget: 300, spent: 300, leads: 9, start: D(-60), end: D(-5), status: 'ended' })
    );
    S.donations.push(
      mk({ date: D(-70), amount: 1500, to: 'Erbil orphan care fund', note: 'Second quarter pledge' }),
      mk({ date: D(-12), amount: 900, to: 'Winter school supplies drive', note: '' })
    );
    S.referrals.push(
      mk({ name: 'Baran Estate Office', phone: '+9647505550101', date: D(-40), agentId: ag[0].id, status: 'joined' }),
      mk({ name: 'Rawa Properties', phone: '+9647505550144', date: D(-9), agentId: ag[1].id, status: 'joined' }),
      mk({ name: 'Nashwan Qadir', phone: '+9647705550187', date: D(-2), agentId: ag[0].id, status: 'invited' })
    );
    S.settings.agentCode = S.settings.agentCode || 'RE26334228';
    S.settings.codeIsSample = S.settings.agentCode === 'RE26334228';
    S.seeded = true;
  };

  RE.hasSamples = () => RE.COLLS.some(c => RE.state[c].some(x => x.sample));
  RE.removeSamples = function () {
    RE.COLLS.forEach(c => { RE.state[c] = RE.state[c].filter(x => !x.sample); });
    if (RE.state.settings.codeIsSample) { RE.state.settings.agentCode = ''; RE.state.settings.codeIsSample = false; }
    RE.persist();
  };
})(window.RE);
