# Rasl Estate

Office system for a real-estate brokerage. The start screen is a showcase of the residential projects the office sells, with a full-screen mode for a TV in the office (rotating ads with a WhatsApp QR code). The other sections sit in four folders: Sales (dashboard, leads, property, map), Marketing (projects, ads, market), Team (team, rewards, join & charity) and Office (reports, settings). It covers leads (CRM), listings, map, appointments, deals and commission, team rewards, referrals and charity pledge, market figures, ad campaigns and reports. English, Arabic and Kurdish (Sorani), light and dark.

## Run

No build step. Open `index.html`, or serve the folder with any static host:

    npx serve .

## Data

Without signing in, records stay in the browser on that device.

Signed in, records live in the office database (Supabase project `uejkzdpyvlaxjziknzuy`, schema in `supabase/schema.sql`):

- The owner signs in on **Office**, chooses **Create an office** and gets a team code.
- Agents create an account, choose **Join an office** and enter the code.
- Changes save automatically and appear on teammates' screens within a second or two. The device keeps a copy, so the app opens instantly and works offline; changes made offline upload when the connection returns.
- Access is enforced in the database with row-level security: a person can only read and write the records of offices they belong to.

**Office → Save a backup** still exports everything as a JSON file.

## Layout

    index.html        page shell
    css/app.css       design tokens and styles
    js/i18n.js        translations (rows of English, Arabic, Kurdish)
    js/store.js       state, persistence, selectors, sample data
    js/ui.js          formatting, icons, dialogs, forms, charts
    js/views1.js      dashboard, leads, property, map
    js/views2.js      rewards, join & charity, team, market, ads, reports, office
    js/views3.js      residential projects showcase and office display
    js/app.js         routing and actions
    js/cloud.js       sign-in, offices, sync with the database
    js/config.js      database address and public key
    assets/           logo, favicon and app icons
    supabase/         database schema
    tools/build-artifact.mjs   bundles everything into one HTML file

The map uses MapLibre GL (in `vendor/`) with OpenFreeMap vector tiles for streets and 3D buildings, and Esri World Imagery for the satellite view. It needs an internet connection and WebGL; without them it falls back to a plain grid and pins still work.
