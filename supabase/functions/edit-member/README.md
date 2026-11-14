# edit-member

The company owner reads (`action: "get"`) and edits the details of **their own direct members**: full name, last name, phone, country, city, sign-in email (kept confirmed) and password. The caller must be the owner (`role = 'owner'`) and the member's `sponsor_id` must be the owner; anyone else gets `owner_only` / `not_direct`. Deployed with `verify_jwt = true`, uses the built-in service-role secret.
