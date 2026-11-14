// add-member: the company owner creates a member account directly (already confirmed, no email needed).
// The account is placed under a sponsor code (the owner's own code by default). The database trigger
// `private.handle_new_user` gives the new code and enforces the direct-member limit.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service, { auth: { persistSession: false } });

  // who is calling?
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: who, error: whoErr } = await admin.auth.getUser(token);
  if (whoErr || !who?.user) return json({ error: "not_signed_in" }, 401);
  const { data: me } = await admin.from("profiles").select("id, code, role").eq("id", who.user.id).maybeSingle();
  if (!me || me.role !== "owner") return json({ error: "owner_only" }, 403);

  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const full_name = s(b.full_name, 120), phone = s(b.phone, 40), country = s(b.country, 80);
  const email = s(b.email, 200).toLowerCase().replace(/\s+/g, "");
  const password = String(b.password ?? "");
  const sponsor_code = (s(b.sponsor_code, 60) || me.code || "").toUpperCase();
  if (full_name.length < 2) return json({ error: "name" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "email" }, 400);
  if (password.length < 6) return json({ error: "password" }, 400);

  const { data: sp } = await admin.from("profiles").select("id, code").eq("code", sponsor_code).maybeSingle();
  if (!sp) return json({ error: "sponsor" }, 400);
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("sponsor_id", sp.id);
  if ((count ?? 0) >= 10) return json({ error: "sponsor_full", direct: count }, 400);

  const { data: made, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name, phone, country, sponsor_code: sp.code },
  });
  if (error || !made?.user) {
    const m = String(error?.message || "").toLowerCase();
    return json({ error: m.includes("already") || m.includes("registered") ? "exists" : m.includes("sponsor_full") ? "sponsor_full" : "failed", detail: error?.message }, 400);
  }
  const { data: prof } = await admin.from("profiles").select("code, full_name").eq("id", made.user.id).maybeSingle();
  return json({ ok: true, email, code: prof?.code ?? null, full_name: prof?.full_name ?? full_name, sponsor: sp.code });
});
