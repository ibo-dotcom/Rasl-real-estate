# Pending database change

`v2_fresh_start` (Rasl Estate version 2) is waiting for the owner to approve it in Supabase.
It removes the first version's tables and test accounts and creates the new design:

- members (three-part name, phone, personal code, sponsor, owner/member role, verification)
- settings (network name, phone, currency, plan numbers set by the owner)
- properties, sales, requests, ads, offers, leads (CRM), tutorials, wishes, donations, member_documents
- register_member(): the first registration becomes the owner; after that a sponsor code is required
- visibility: each member sees themselves, their sponsor and their downline; the owner sees everyone
- public read access for exploring before joining: settings, properties, ads, offers, lessons
- storage: project-media (public media) and member-docs (private identity documents)
