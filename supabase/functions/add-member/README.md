# add-member

Lets the company owner create a member account directly from the app (menu → "Add a member", or the button under "My members").

- Owner only: the caller's token is checked and their profile must have `role = 'owner'`.
- The account is created **already confirmed** (`email_confirm: true`), so no confirmation email is sent — this avoids Supabase's email limit and the localhost link.
- The member is placed under `sponsor_code` (the owner's own code by default). The `private.handle_new_user` trigger gives the new code (e.g. `IBO-1-5`) and enforces the limit of 10 direct members for every code except the owner's (no limit); the function checks the limit first to return a clear error.
- Returns `{ ok, email, code, full_name, sponsor }`. Errors: `not_signed_in`, `owner_only`, `name`, `email`, `password`, `sponsor`, `sponsor_full`, `exists`, `failed`.
- Deployed with `verify_jwt = true`. Uses the built-in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets.

## Same name or same email, different code

One person may hold several accounts. The same name is always allowed. When the email already has an account, the function signs the new account in with an alias of the same inbox — `name+r2@gmail.com`, `name+r3@…` — which most providers (Gmail, Outlook, iCloud) deliver to the same mailbox. The real email is kept in `user_metadata.contact_email`. The response includes `aliased: true` and the login email to give the member.
