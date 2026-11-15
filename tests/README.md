# App tests

Browser tests for the member app (`global/index.html`). They run automatically on GitHub
(**Actions → App tests**) after every push, on pull requests, once a day at 03:17 UTC, and on demand.

What they check:

1. Every `<script>` in `global/index.html` parses.
2. Every button on the main screens is clicked once, on a fresh page, with no JavaScript errors
   (home, map, team, academy, wallet, accounts, sales, CRM, profile, ads, projects, register, login, welcome).
3. Every sheet opened from a screen button closes with its ✕.
4. Every side-menu item: pressing Back returns to the menu.

The real database is never used: `stub.js` is a fake Supabase client with fixed demo data, and every
outside site is blocked. Pictures used by the demo data are in `demo/`.

Run them on a computer:

```
cd tests
npm install
npx playwright install chromium
node serve.js &        # serves the app on http://localhost:8766
node run.js            # full run (about 10 minutes)
node run.js --quick    # home, CRM and team only
```

When a new screen, button or menu item is added, the runner picks it up by itself (it clicks every
`data-act` it finds). Fake data for new tables is added in `stub.js`.
