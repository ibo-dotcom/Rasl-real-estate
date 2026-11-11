/* Rasl Estate — the ad screen. Plays each featured project's photos and videos in turn, at the top of the home
   screen and full-screen on an office TV. Videos play to the end, photos stay six seconds. */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s), L = (g, k) => RE.label(g, k);
  const PHOTO_MS = 6000, LINK_MS = 25000, MAX_VIDEO_MS = 120000;

  // One playlist entry per photo or video; a project with no media shows its drawing.
  RE.adItems = function () {
    const out = [];
    RE.showcaseList().forEach(p => {
      const own = [];
      (p.videos || []).forEach(v => own.push({ kind: 'video', src: v.url || v, p }));
      (p.photos || []).slice(0, 6).forEach(src => own.push({ kind: 'img', src, p }));
      const e = p.videoUrl && RE.embedUrl(p.videoUrl);
      if (e && e.kind === 'video') own.push({ kind: 'embed', src: e.src, p });
      if (e && e.kind === 'file') own.push({ kind: 'video', src: e.src, p });
      if (!own.length) own.push({ kind: 'art', p });
      out.push(...own);
    });
    return out;
  };
  const sig = items => items.map(x => x.kind + (x.src ? x.src.slice(-40) : '') + x.p.id + x.p.name + x.p.priceFrom + x.p.unitsAvailable).join('|');

  RE.AdPlayer = function (opts) {
    let items = opts.items, i = Math.min(opts.start || 0, items.length - 1), timer = null, paused = false, muted = true, video = null;
    const el = document.createElement('div');
    el.className = 'adscreen' + (opts.kiosk ? ' in-kiosk' : '');
    el.innerHTML = `<div class="ad-stage"></div>
      ${opts.caption === false ? '' : '<div class="ad-cap"></div>'}
      <div class="ad-ctl" role="group" aria-label="${esc(t('Ad screen'))}">
        <button class="ad-b" data-ad="prev" aria-label="${esc(t('Previous'))}">${RE.icon('prev')}</button>
        <button class="ad-b" data-ad="pause" aria-label="${esc(t('Pause'))}">${RE.icon('pause')}</button>
        <button class="ad-b" data-ad="mute" aria-label="${esc(t('Sound on'))}" hidden>${RE.icon('muted')}</button>
        <button class="ad-b" data-ad="next" aria-label="${esc(t('Next'))}">${RE.icon('next')}</button>
        ${opts.kiosk ? '' : `<button class="ad-b" data-ad="full" aria-label="${esc(t('Show on a screen'))}">${RE.icon('fit')}</button>`}
      </div>
      <span class="ad-count"></span><div class="ad-prog"><i></i></div>`;
    const stage = el.querySelector('.ad-stage'), cap = el.querySelector('.ad-cap'), bar = el.querySelector('.ad-prog i');
    const btn = n => el.querySelector(`[data-ad="${n}"]`);

    function progress(ms) {
      bar.style.transition = 'none'; bar.style.width = '0';
      if (!ms || paused) return;
      void bar.offsetWidth; bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%';
    }
    function schedule(ms) { clearTimeout(timer); if (!paused && items.length > 1) timer = setTimeout(() => go(i + 1), ms); progress(ms); }
    function caption(p) {
      if (!cap) return;
      const wa = RE.waLink(p), price = p.priceFrom ? t('From {a}', { a: `<bdi dir="ltr">${RE.money(p.priceFrom)}</bdi>` }) : '';
      const left = p.status === 'soldout' ? t('Sold out') : p.unitsTotal ? t('{a} of {b} units left', { a: `<bdi dir="ltr">${RE.num(p.unitsAvailable)}</bdi>`, b: `<bdi dir="ltr">${RE.num(p.unitsTotal)}</bdi>` }) : '';
      cap.innerHTML = `<div class="ad-cap-t"><span class="eyebrow">${esc(L('pstatus', p.status))} · ${esc([p.district, p.city].filter(Boolean).join(', '))}</span><h2>${esc(p.name)}</h2><p>${[price, left, p.handover ? `<bdi>${esc(p.handover)}</bdi>` : ''].filter(Boolean).join(' · ')}</p></div>
        <div class="ad-cap-a">${wa ? `<a class="btn" href="${wa}" target="_blank" rel="noopener">${RE.icon('chat')}${t('Ask on WhatsApp')}</a>` : ''}<button class="btn ghost" data-act="viewProject" data-id="${p.id}">${t('Details')}</button></div>`;
    }
    function go(n) {
      if (!items.length) return;
      clearTimeout(timer);
      if (video) { video.pause(); video = null; }
      i = (n + items.length) % items.length;
      const it = items[i], p = it.p;
      btn('mute').hidden = it.kind !== 'video';
      if (it.kind === 'img') { stage.innerHTML = `<img class="kb" src="${esc(it.src)}" alt="${esc(p.name)}">`; schedule(PHOTO_MS); }
      else if (it.kind === 'art') { stage.innerHTML = `<div class="kb art">${RE.projectArt(p)}</div>`; schedule(PHOTO_MS); }
      else if (it.kind === 'embed') {
        stage.innerHTML = `<iframe src="${esc(it.src)}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1" title="${esc(p.name)}" allow="autoplay; encrypted-media; fullscreen" tabindex="-1"></iframe>`;
        schedule(LINK_MS);
      } else {
        stage.innerHTML = `<video src="${esc(it.src)}" playsinline preload="auto"${muted ? ' muted' : ''}></video>`;
        video = stage.querySelector('video'); video.muted = muted;
        video.addEventListener('loadedmetadata', () => { if (video && isFinite(video.duration)) schedule(Math.min(MAX_VIDEO_MS, video.duration * 1000 + 300)); });
        video.addEventListener('ended', () => go(i + 1));
        video.addEventListener('error', () => schedule(1500));
        if (!paused) video.play().catch(() => { muted = true; video.muted = true; video.play().catch(() => schedule(PHOTO_MS)); });
        schedule(MAX_VIDEO_MS);
      }
      caption(p);
      el.querySelector('.ad-count').textContent = items.length > 1 ? `${i + 1} / ${items.length}` : '';
      const nx = items[(i + 1) % items.length]; if (nx && nx.kind === 'img') { const im = new Image(); im.src = nx.src; }
      if (opts.onChange) opts.onChange(p, it);
    }
    function setPaused(v) {
      paused = v; btn('pause').innerHTML = RE.icon(v ? 'play' : 'pause'); btn('pause').setAttribute('aria-label', t(v ? 'Play' : 'Pause'));
      if (video) { if (v) video.pause(); else video.play().catch(() => {}); }
      if (v) { clearTimeout(timer); progress(0); } else if (video && isFinite(video.duration)) schedule(Math.max(500, (video.duration - video.currentTime) * 1000)); else schedule(PHOTO_MS);
    }
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-ad]'); if (!b) return;
      e.stopPropagation();
      const a = b.dataset.ad;
      if (a === 'next') go(i + 1); else if (a === 'prev') go(i - 1);
      else if (a === 'pause') setPaused(!paused);
      else if (a === 'mute') { muted = !muted; if (video) video.muted = muted; b.innerHTML = RE.icon(muted ? 'muted' : 'sound'); b.setAttribute('aria-label', t(muted ? 'Sound on' : 'Sound off')); }
      else if (a === 'full') RE.kioskOpen(i);
    });
    const api = {
      el, get index() { return i; }, sig: sig(items),
      start() { go(i); }, stop() { clearTimeout(timer); if (video) video.pause(); },
      resume() { if (video && !paused) video.play().catch(() => {}); else if (!video) go(i); },
      update(next) { const s = sig(next); if (s === api.sig) return false; items = next; api.sig = s; go(Math.min(i, items.length - 1)); return true; }
    };
    return api;
  };

  /* ---------- home screen slot ---------- */
  let player = null;
  RE.after.home = function () {
    const slot = document.getElementById('adslot'); if (!slot) return;
    const items = RE.adItems();
    if (!items.length) { if (player) { player.stop(); player = null; } return; }
    if (player && player.sig === RE.adSig) { slot.appendChild(player.el); player.resume(); return; }
    if (player) { slot.appendChild(player.el); player.update(items); RE.adSig = player.sig; return; }
    player = RE.AdPlayer({ items, start: 0 }); RE.adSig = player.sig;
    slot.appendChild(player.el); player.start();
  };
  // leaving the home screen stops playback so videos don't play unseen
  window.addEventListener('hashchange', () => { if (player && location.hash !== '#home' && location.hash !== '') player.stop(); });

  /* ---------- full-screen office display ---------- */
  function qr(text) {
    if (!window.qrcode || !text) return '';
    try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ''; }
  }
  let kp = null, idle = null;
  RE.kioskOpen = function (start) {
    const items = RE.adItems();
    if (!items.length) { RE.toast(t('Mark at least one project as featured first.')); return; }
    if (player) player.stop();
    const el = document.createElement('div'); el.id = 'kiosk'; el.className = 'kiosk';
    el.innerHTML = `<div class="k-stage"><div class="k-art"></div><div class="k-txt"></div></div><button class="btn small k-close" data-k="x">${t('Close display')}</button>`;
    document.body.appendChild(el);
    const txt = el.querySelector('.k-txt'), st = RE.state.settings;
    kp = RE.AdPlayer({ items, start: start || 0, caption: false, kiosk: true, onChange: p => {
      const wa = RE.waLink(p), phone = (p.phone || st.phone || '').trim();
      txt.innerHTML = `<div class="k-brand">${RE.logo()}<span>${esc(st.office || 'Rasl Estate')}</span></div>
        <span class="eyebrow">${esc(L('pstatus', p.status))} · ${esc(L('ptype', p.ptype))} · ${esc([p.district, p.city].filter(Boolean).join(', '))}</span>
        <h2>${esc(p.name)}</h2>${p.developer ? `<p class="k-dev">${t('By {d}', { d: esc(p.developer) })}</p>` : ''}
        ${RE.projStats(p)}${p.payment ? `<p class="pay">${esc(p.payment)}</p>` : ''}
        ${wa ? `<div class="k-qr"><div class="qr">${qr(wa)}</div><p>${t('Scan to ask about this project on WhatsApp')}<b class="num">${esc(phone)}</b></p></div>` : (phone ? `<p class="k-phone num">${esc(phone)}</p>` : '')}`;
    } });
    el.querySelector('.k-art').appendChild(kp.el); kp.start();
    try { if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); } catch (e) { /* stays as an overlay */ }
    const wake = () => { el.classList.add('awake'); clearTimeout(idle); idle = setTimeout(() => el.classList.remove('awake'), 2500); };
    el.addEventListener('mousemove', wake); el.addEventListener('click', e => { if (e.target.closest('[data-k="x"]')) RE.kioskClose(); else wake(); });
    el._key = e => { if (e.key === 'Escape') RE.kioskClose(); };
    document.addEventListener('keydown', el._key);
    el._fs = () => { if (!document.fullscreenElement && el._wasFs) RE.kioskClose(); el._wasFs = !!document.fullscreenElement; };
    document.addEventListener('fullscreenchange', el._fs);
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then(l => { el._lock = l; }).catch(() => {}); } catch (e) { /* screen may sleep */ }
    wake();
  };
  RE.kioskClose = function () {
    const el = document.getElementById('kiosk'); if (!el) return;
    if (kp) { kp.stop(); kp = null; }
    document.removeEventListener('keydown', el._key); document.removeEventListener('fullscreenchange', el._fs);
    if (el._lock) try { el._lock.release(); } catch (e) { /* released */ }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    el.remove();
    if (player && RE.ui.route === 'home') player.resume();
  };

  /* ---------- uploads to the office's media storage ---------- */
  RE.canUpload = () => !!(RE.cloud && RE.cloud.office && RE.cloud.client);
  RE.uploadMedia = async function (blob, folder, ext, type) {
    const path = `${RE.cloud.office.id}/${folder}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await RE.cloud.client.storage.from('project-media').upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return RE.cloud.client.storage.from('project-media').getPublicUrl(path).data.publicUrl;
  };
})(window.RE);
