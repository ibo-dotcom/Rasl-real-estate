// Turns a Google Maps link (also short maps.app.goo.gl links) into latitude/longitude.
// Only Google Maps hosts are followed.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
const HOST = /^(maps\.app\.goo\.gl|goo\.gl|g\.co|maps\.google\.[a-z.]+|(www\.)?google\.[a-z.]+|consent\.google\.[a-z.]+)$/i;

function parse(s: string): { lat: number; lng: number } | null {
  const t = decodeURIComponent(s);
  const pats = [
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/,
    /[?&](?:q|query|ll|destination|center|daddr)=(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/,
    /\/place\/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/,
    /\/search\/(-?\d{1,3}\.\d+)\s*,\s*\+?(-?\d{1,3}\.\d+)/,
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/,
  ];
  for (const p of pats) {
    const m = t.match(p);
    if (m) {
      const lat = Number(m[1]), lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { url } = await req.json();
    let cur = String(url || '').trim();
    let u: URL;
    try { u = new URL(cur); } catch { return json({ error: 'bad_url' }, 400); }
    if (u.protocol !== 'https:' || !HOST.test(u.hostname)) return json({ error: 'not_maps_link' }, 400);
    const direct = parse(cur);
    if (direct) return json({ ...direct, url: cur });
    for (let i = 0; i < 6; i++) {
      const r = await fetch(cur, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', 'Accept-Language': 'en' } });
      const loc = r.headers.get('location');
      if (r.status >= 300 && r.status < 400 && loc) {
        const next = new URL(loc, cur);
        if (!HOST.test(next.hostname)) return json({ error: 'left_google' }, 422);
        cur = next.toString();
        const c = parse(cur);
        if (c) return json({ ...c, url: cur });
        continue;
      }
      const body = (await r.text()).slice(0, 600000);
      const c = parse(body) || (body.match(/\[null,null,(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)\]/) ? { lat: Number(RegExp.$1), lng: Number(RegExp.$2) } : null);
      if (c) return json({ ...c, url: cur });
      break;
    }
    return json({ error: 'no_coords', url: cur }, 422);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
