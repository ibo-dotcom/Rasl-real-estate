// edit-member: the company owner reads and edits the details of their own direct members
// (name, phone, country, city, sign-in email and password). Nobody else can use it.
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
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: who, error: whoErr } = await admin.auth.getUser(token);
  if (whoErr || !who?.user) return json({ error: "not_signed_in" }, 401);
  const { data: me } = await admin.from("profiles").select("id, role").eq("id", who.user.id).maybeSingle();
  if (!me || me.role !== "owner") return json({ error: "owner_only" }, 403);

  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const id = String(b.member_id ?? "");
  const { data: m } = await admin.from("profiles").select("id, sponsor_id, full_name, last_name, phone, country, city, code").eq("id", id).maybeSingle();
  if (!m || m.sponsor_id !== me.id) return json({ error: "not_direct" }, 403);
  const { data: au } = await admin.auth.admin.getUserById(id);
  const curEmail = au?.user?.email ?? "";

  if (b.action === "get") return json({ ok: true, ...m, email: curEmail });

  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const full_name = s(b.full_name, 120);
  if (full_name.length < 2) return json({ error: "name" }, 400);
  const prof = { full_name, last_name: s(b.last_name, 120), phone: s(b.phone, 40), country: s(b.country, 80), city: s(b.city, 80) };
  const { error: pe } = await admin.from("profiles").update(prof).eq("id", id);
  if (pe) return json({ error: "failed", detail: pe.message }, 400);

  const upd: Record<string, unknown> = {};
  const email = s(b.email, 200).toLowerCase().replace(/\s+/g, "");
  if (email && email !== curEmail) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "email" }, 400);
    upd.email = email; upd.email_confirm = true;
  }
  const password = String(b.password ?? "");
  if (password) {
    if (password.length < 6) return json({ error: "password" }, 400);
    upd.password = password;
  }
  if (Object.keys(upd).length) {
    const { error: ue } = await admin.auth.admin.updateUserById(id, upd);
    if (ue) {
      const msg = String(ue.message || "").toLowerCase();
      return json({ error: msg.includes("already") || msg.includes("registered") ? "exists" : "failed", detail: ue.message }, 400);
    }
  }
  return json({ ok: true, code: m.code, email: (upd.email as string) || curEmail, password_changed: !!password });
});
