/* Rasl Estate — where I am, and the way to a place.
   The map opens on the person's own position, shows it as a blue dot, and for any place asked for
   draws the road there with its distance and driving time. */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s);
  const U = () => RE.ui;
  const onMap = () => U().route === 'map';
  let seq = 0;

  const rad = d => d * Math.PI / 180;
  function straightKm(a, b) {
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }
  // A map view that holds every point of a line, for both the live map (bbox) and the plain one (centre and zoom).
  function viewOf(line) {
    const xs = line.map(p => p[0]), ys = line.map(p => p[1]);
    const w = Math.min(...xs), e = Math.max(...xs), s = Math.min(...ys), n = Math.max(...ys);
    const span = Math.max(e - w, (n - s) * 2, 0.004);
    return { lat: (s + n) / 2, lng: (w + e) / 2, z: Math.max(3, Math.min(16, Math.floor(Math.log2(360 / span)))), bbox: [[w, s], [e, n]] };
  }
  RE.distText = km => km < 1 ? Math.round(km * 1000 / 10) * 10 + ' ' + t('m') : (km < 100 ? km.toFixed(1) : Math.round(km).toLocaleString('en-US')) + ' ' + t('km');
  RE.timeText = min => { min = Math.max(1, Math.round(min)); const h = Math.floor(min / 60), m = min % 60; return h ? h + ' ' + t('h') + (m ? ' ' + m + ' ' + t('min') : '') : m + ' ' + t('min'); };

  /* ---------- where I am ---------- */
  RE.locate = function (opt) {
    opt = opt || {};
    const ui = U();
    if (!navigator.geolocation) { ui.meDenied = true; if (opt.loud) RE.toast(t('This device cannot tell where it is.')); return; }
    if (ui.locating) return;
    ui.locating = true; if (onMap() && opt.loud) RE.render();
    navigator.geolocation.getCurrentPosition(pos => {
      ui.locating = false; ui.meDenied = false;
      ui.me = { lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) };
      if (ui.tripWant) return RE.tripTo(ui.tripWant);
      if (opt.center) { ui.mapCity = ''; ui.map = { lat: ui.me.lat, lng: ui.me.lng, z: 14, gz: 14 }; }
      if (onMap()) RE.render();
    }, err => {
      ui.locating = false; ui.meDenied = true;
      if (opt.loud) RE.toast(err && err.code === 1 ? t('Allow location for this page, then press the location button again.') : t('Your location could not be found. Try again outdoors or with location switched on.'));
      if (onMap()) RE.render();
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };

  /* ---------- the way to a place ---------- */
  RE.tripTo = async function (dest) {
    const ui = U();
    ui.tripWant = dest;
    if (!ui.me) { if (!ui.meDenied) RE.locate({}); if (onMap()) RE.render(); return; }
    const id = ++seq, me = ui.me;
    ui.trip = { to: dest, loading: true }; if (onMap()) RE.render();
    let road = null;
    try {
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${me.lng},${me.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`);
      const j = r.ok ? await r.json() : null;
      if (j && j.code === 'Ok' && j.routes && j.routes[0]) road = j.routes[0];
    } catch (e) { road = null; }
    if (id !== seq) return;
    ui.trip = road
      ? { to: dest, km: road.distance / 1000, min: road.duration / 60, line: road.geometry.coordinates }
      : { to: dest, km: straightKm(me, dest), straight: true, line: [[me.lng, me.lat], [dest.lng, dest.lat]] };
    ui.map = viewOf(ui.trip.line.concat([[me.lng, me.lat], [dest.lng, dest.lat]]));
    if (onMap()) RE.render();
  };
  // What the map should show when it has to start over: the trip, else my own position, else everything.
  RE.tripView = function () {
    const ui = U();
    if (ui.trip && ui.trip.line && ui.me) return viewOf(ui.trip.line.concat([[ui.me.lng, ui.me.lat]]));
    if (ui.me && !ui.mapSel && !ui.mapMark && !ui.placing) return { lat: ui.me.lat, lng: ui.me.lng, z: 14, gz: 14 };
    return null;
  };
  RE.tripClear = function () { seq++; U().trip = null; U().tripWant = null; };

  RE.tripBar = function () {
    const ui = U(), tr = ui.trip, want = ui.tripWant;
    if (!want) return '';
    const name = `<b>${esc(String(want.label).split(',')[0])}</b>`;
    const clear = `<button class="btn small ghost" data-act="tripClear">${t('Clear')}</button>`;
    if (!ui.me) return `<div class="notice trip"><span>${ui.meDenied ? t('Allow location for this page to see the way and the distance to {p}.', { p: name }) : t('Finding where you are…')}</span><span class="row">${ui.meDenied ? `<button class="btn small" data-act="locate">${RE.icon('target')}${t('Use my location')}</button>` : ''}${clear}</span></div>`;
    if (!tr || tr.loading) return `<div class="notice trip"><span>${t('Finding the way to {p}…', { p: name })}</span>${clear}</div>`;
    const gm = `https://www.google.com/maps/dir/?api=1&origin=${ui.me.lat},${ui.me.lng}&destination=${tr.to.lat},${tr.to.lng}`;
    return `<div class="notice trip"><span class="trip-t">${RE.icon('route')}<span>${t('From your location to {p}', { p: name })}</span><strong>${RE.distText(tr.km)}</strong>${tr.straight ? `<small>${t('in a straight line; no road was found')}</small>` : `<strong>${RE.timeText(tr.min)}</strong><small>${t('by car')}</small>`}</span>
      <span class="row"><a class="btn small" target="_blank" rel="noopener" href="${gm}">${t('Start in Google Maps')}</a>${clear}</span></div>`;
  };

  /* ---------- drawing ---------- */
  // Live map: the road is a layer, my position a marker.
  RE.tripDrawGl = function (map, g) {
    const ui = U(), data = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: ui.trip && ui.trip.line ? ui.trip.line : [] } };
    try {
      const src = map.getSource('trip');
      if (src) src.setData(data);
      else {
        map.addSource('trip', { type: 'geojson', data });
        const lay = { 'line-cap': 'round', 'line-join': 'round' };
        map.addLayer({ id: 'trip-edge', type: 'line', source: 'trip', layout: lay, paint: { 'line-color': '#ffffff', 'line-width': 9 } });
        map.addLayer({ id: 'trip-line', type: 'line', source: 'trip', layout: lay, paint: { 'line-color': '#2F6FD0', 'line-width': 5 } });
      }
    } catch (e) { /* the style is still loading; it is drawn when the style arrives */ }
    if (ui.me && g) {
      const el = document.createElement('div'); el.className = 'gme'; el.title = t('You are here');
      g.markers.push(new maplibregl.Marker({ element: el }).setLngLat([ui.me.lng, ui.me.lat]).addTo(map));
    }
  };
  // Plain map: the same two things as HTML over the tiles.
  RE.tripDrawFlat = function (proj, m, ox, oy) {
    const ui = U(); let h = '';
    if (ui.trip && ui.trip.line) {
      const step = Math.ceil(ui.trip.line.length / 500);
      const pts = ui.trip.line.filter((p, i, a) => i % step === 0 || i === a.length - 1).map(p => { const xy = proj(p[1], p[0], m.z); return Math.round(xy[0] - ox) + ',' + Math.round(xy[1] - oy); }).join(' ');
      h += `<svg class="trip-svg" aria-hidden="true"><polyline points="${pts}" class="edge"/><polyline points="${pts}"/></svg>`;
    }
    if (ui.me) { const xy = proj(ui.me.lat, ui.me.lng, m.z); h += `<div class="gme flat" title="${esc(t('You are here'))}" style="left:${Math.round(xy[0] - ox)}px;top:${Math.round(xy[1] - oy)}px"></div>`; }
    return h;
  };

  // The first time the map opens it asks where the person is and starts there.
  const after = RE.after.map;
  RE.after.map = function () {
    after();
    const ui = U();
    if (ui.meAsked) return;
    ui.meAsked = true;
    RE.locate({ center: !ui.mapMark && !ui.mapSel && !ui.placing });
  };
})(window.RE);
