/* Rasl Estate — office database (Supabase): sign-in, offices, two-way sync and live updates.
   The browser keeps a full copy in localStorage, so the app opens instantly and keeps working offline;
   changes are pushed as a diff against what the server last confirmed. */
(function (RE) {
  const t = (s, v) => RE.t(s, v);
  const C = RE.cloud = { status: 'off', user: null, office: null, role: '', members: [], msg: '', mode: 'signin' };
  const MKEY = 'rasl-estate-sync';
  const SHARED = ['office', 'phone', 'currency', 'goal', 'commissionPct', 'charityPct', 'agentCode', 'codeIsSample'];
  const DEVICE = ['lang', 'theme', 'me'];
  let meta = { officeId: null, synced: {} }, timer = null, busy = false, again = false, channel = null, renderT = null;

  try { meta = Object.assign(meta, JSON.parse(localStorage.getItem(MKEY)) || {}); } catch (e) { /* first run */ }
  const saveMeta = () => { try { localStorage.setItem(MKEY, JSON.stringify(meta)); } catch (e) { /* quota */ } };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); };
  const pick = (o, keys) => { const r = {}; keys.forEach(k => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };

  function localMap() {
    const m = {};
    RE.COLLS.forEach(c => RE.state[c].forEach(x => { m[c + '/' + x.id] = { coll: c, id: x.id, data: x }; }));
    m['settings/office'] = { coll: 'settings', id: 'office', data: pick(RE.state.settings, SHARED) };
    Object.keys(m).forEach(k => { m[k].h = hash(JSON.stringify(m[k].data)); });
    return m;
  }
  function applyRow(state, coll, id, data) {
    if (coll === 'settings') { Object.assign(state.settings, pick(data, SHARED)); return; }
    const list = state[coll]; if (!list) return;
    const i = list.findIndex(x => x.id === id);
    if (i >= 0) list[i] = data; else list.push(data);
  }
  function removeRow(state, coll, id) { if (state[coll] && coll !== 'settings') state[coll] = state[coll].filter(x => x.id !== id); }
  function freshState() {
    const s = RE.blank();
    Object.assign(s.settings, pick(RE.state.settings, DEVICE));
    s.seeded = true;
    return s;
  }
  function setStatus(s, msg) { C.status = s; if (msg !== undefined) C.msg = msg; softRender(); }
  function softRender() { clearTimeout(renderT); renderT = setTimeout(() => RE.render(), 60); }
  function errText(e) {
    const m = (e && (e.message || e.error_description)) || String(e);
    if (/Invalid login credentials/i.test(m)) return t('That email and password do not match an account.');
    if (/Email not confirmed/i.test(m)) return t('Confirm your email first. Open the link we sent you, then sign in.');
    if (/already registered|already exists/i.test(m)) return t('An account with this email exists. Sign in instead.');
    if (/No office has that code/i.test(m)) return t('No office has that code. Check it with the person who sent it.');
    if (/Password should be/i.test(m)) return t('Use a password of at least 6 characters.');
    if (/fetch|network/i.test(m)) return t('Cannot reach the office database. Check the connection and try again.');
    return m;
  }

  /* ---------- push local changes ---------- */
  RE.cloudChanged = function () {
    if (!C.office || C.applying) return;
    clearTimeout(timer); timer = setTimeout(push, 400);
  };
  async function push() {
    if (!C.office) return;
    if (busy) { again = true; return; }
    busy = true; again = false;
    const office = C.office.id, m = localMap(), rows = [], done = {};
    Object.keys(m).forEach(k => { if (meta.synced[k] !== m[k].h) { rows.push({ office_id: office, coll: m[k].coll, id: m[k].id, data: m[k].data, deleted: false }); done[k] = m[k].h; } });
    Object.keys(meta.synced).forEach(k => {
      if (!m[k] && meta.synced[k] !== 'x') { const i = k.indexOf('/'); rows.push({ office_id: office, coll: k.slice(0, i), id: k.slice(i + 1), data: {}, deleted: true }); done[k] = 'x'; }
    });
    if (!rows.length) { busy = false; if (C.status === 'saving' || C.status === 'offline') setStatus('synced'); return; }
    setStatus('saving');
    try {
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error } = await C.client.from('records').upsert(chunk, { onConflict: 'office_id,coll,id' });
        if (error) throw error;
        chunk.forEach(r => { const k = r.coll + '/' + r.id; meta.synced[k] = done[k]; });
        saveMeta();
      }
      busy = false;
      if (again) push(); else setStatus('synced', '');
    } catch (e) {
      busy = false;
      setStatus('offline', errText(e));
      clearTimeout(timer); timer = setTimeout(push, 15000);
    }
  }

  /* ---------- pull everything for the office ---------- */
  async function pull() {
    const office = C.office.id, remote = {}, rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await C.client.from('records').select('coll,id,data,deleted').eq('office_id', office).range(from, from + 999);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 1000) break;
    }
    const same = meta.officeId === office, local = same ? localMap() : {};
    const dirty = Object.keys(local).filter(k => meta.synced[k] !== local[k].h);
    const gone = same ? Object.keys(meta.synced).filter(k => meta.synced[k] !== 'x' && !local[k]) : [];
    const s = freshState();
    rows.forEach(r => {
      const k = r.coll + '/' + r.id;
      if (r.deleted) { remote[k] = 'x'; return; }
      remote[k] = hash(JSON.stringify(r.data));
      applyRow(s, r.coll, r.id, r.data);
    });
    dirty.forEach(k => applyRow(s, local[k].coll, local[k].id, local[k].data));
    gone.forEach(k => { const i = k.indexOf('/'); removeRow(s, k.slice(0, i), k.slice(i + 1)); });
    meta.officeId = office; meta.synced = remote; saveMeta();
    C.applying = true; RE.state = s; RE.persist(); C.applying = false;
    RE.ui.map = null;
  }

  function subscribe() {
    if (channel) C.client.removeChannel(channel);
    const office = C.office.id;
    channel = C.client.channel('office-' + office)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'records', filter: 'office_id=eq.' + office }, p => {
        const r = p.new; if (!r || !r.coll || r.office_id !== office) return;
        const k = r.coll + '/' + r.id, h = r.deleted ? 'x' : hash(JSON.stringify(r.data));
        if (meta.synced[k] === h) return;
        meta.synced[k] = h; saveMeta();
        C.applying = true;
        if (r.deleted) removeRow(RE.state, r.coll, r.id); else applyRow(RE.state, r.coll, r.id, r.data);
        RE.persist(); C.applying = false;
        softRender();
      })
      .subscribe(st => { if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') setStatus('offline'); });
  }

  async function loadMembers() {
    const { data } = await C.client.from('members').select('user_id,name,role,joined_at').eq('office_id', C.office.id).order('joined_at');
    C.members = data || []; softRender();
  }

  async function connect(office, role) {
    C.office = office; C.role = role || 'agent';
    setStatus('saving');
    try {
      await pull();
      subscribe(); loadMembers();
      setStatus('synced', '');
      push();
    } catch (e) { setStatus('offline', errText(e)); setTimeout(() => { if (C.office && C.status === 'offline') connect(C.office, C.role); }, 15000); }
  }

  async function afterSignIn(user) {
    C.user = user;
    const { data, error } = await C.client.from('members').select('role, offices(id,name,code)').eq('user_id', user.id);
    if (error) { setStatus('offline', errText(error)); return; }
    if (!data.length) { C.office = null; setStatus('nooffice', ''); return; }
    const row = data.find(r => r.offices && r.offices.id === meta.officeId) || data[0];
    connect(row.offices, row.role);
  }

  function myName() {
    const md = C.user && C.user.user_metadata, email = C.user && C.user.email || '';
    const n = RE.state.settings.me || (md && md.name) || email.split('@')[0];
    if (!RE.state.settings.me && n) { RE.state.settings.me = n; }
    return n;
  }

  /* ---------- public actions ---------- */
  C.init = async function () {
    const cfg = window.RASL_CONFIG;
    if (!cfg || !window.supabase) return;
    try {
      C.client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    } catch (e) { return; }
    C.status = 'signedout';
    C.client.auth.onAuthStateChange((ev, session) => {
      if (ev === 'SIGNED_IN' && session && (!C.user || C.user.id !== session.user.id)) afterSignIn(session.user);
    });
    try {
      const { data } = await C.client.auth.getSession();
      if (data.session) await afterSignIn(data.session.user); else softRender();
    } catch (e) { setStatus('signedout', errText(e)); }
    window.addEventListener('online', () => { if (C.office) push(); });
  };

  C.signIn = async function (email, password) {
    const { data, error } = await C.client.auth.signInWithPassword({ email, password });
    if (error) return errText(error);
    await afterSignIn(data.user);
  };
  C.signUp = async function (email, password, name) {
    const { data, error } = await C.client.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: location.origin + location.pathname } });
    if (error) return errText(error);
    if (name && !RE.state.settings.me) { RE.state.settings.me = name; RE.persist(); }
    if (!data.session) { C.mode = 'signin'; setStatus('signedout', t('Check {e} for a confirmation link, then sign in here.', { e: email })); return; }
    await afterSignIn(data.user);
  };
  C.createOffice = async function (name, bring) {
    const me = myName();
    const { data, error } = await C.client.rpc('create_office', { office_name: name, member_name: me });
    if (error) return errText(error);
    C.applying = true;
    if (!bring) RE.state = freshState();
    RE.state.settings.office = name;
    RE.persist(); C.applying = false;
    meta.officeId = data.id; meta.synced = {}; saveMeta();   // everything on the device counts as new, so it all uploads
    await connect(data, 'owner');
  };
  C.joinOffice = async function (code) {
    const me = myName();
    const { data, error } = await C.client.rpc('join_office', { office_code: code, member_name: me });
    if (error) return errText(error);
    C.applying = true; RE.state = freshState(); RE.persist(); C.applying = false;
    meta.officeId = data.id; meta.synced = {}; saveMeta();
    await connect(data, 'agent');
  };
  C.signOut = async function () {
    if (channel) { C.client.removeChannel(channel); channel = null; }
    clearTimeout(timer);
    try { await C.client.auth.signOut(); } catch (e) { /* signed out locally anyway */ }
    C.user = null; C.office = null; C.members = [];
    meta = { officeId: null, synced: {} }; saveMeta();
    C.applying = true; RE.state = freshState(); RE.persist(); C.applying = false;
    RE.ui.map = null; RE.ui.mapSel = null;
    setStatus('signedout', '');
  };
  C.rename = async function (name) {
    if (!C.office || !C.user) return;
    await C.client.from('members').update({ name }).eq('office_id', C.office.id).eq('user_id', C.user.id);
    loadMembers();
  };
  C.renameOffice = async function (name) {
    if (!C.office || C.role !== 'owner' || !name || name === C.office.name) return;
    const { error } = await C.client.from('offices').update({ name }).eq('id', C.office.id);
    if (!error) { C.office.name = name; softRender(); }
  };
  C.retry = () => { if (C.office) push(); };
  C.pending = function () {
    if (!C.office) return 0;
    const m = localMap(); let n = 0;
    Object.keys(m).forEach(k => { if (meta.synced[k] !== m[k].h) n++; });
    Object.keys(meta.synced).forEach(k => { if (!m[k] && meta.synced[k] !== 'x') n++; });
    return n;
  };
})(window.RE);
