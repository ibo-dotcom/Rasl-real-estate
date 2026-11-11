# Rasl Estate

Office system for a real-estate brokerage, in the steel blues and pale greys of the office wall. The start screen opens with an ad screen that plays the photos and videos of the residential projects the office sells, with a full-screen mode for a TV in the office (rotating ads with a WhatsApp QR code). The other sections sit in four folders: Sales (dashboard, leads, property, map), Marketing (projects, ads, market), Team (team, rewards, join & charity) and Office (reports, settings). It covers leads (CRM), listings, map, appointments, deals and commission, team rewards, referrals and charity pledge, market figures, ad campaigns and reports. English, Arabic and Kurdish (Sorani), light and dark.

## Run

No build step. Open `index.html`, or serve the folder with any static host:

    npx serve .

## Projects

Each residential project has its own price range and commission rate. Its project file ties together:

- **Media**: photos, a video link (YouTube, Vimeo or a video file) and a VR tour link (Matterport, Kuula, Momento360…).
- **Sales**: recording a sale uses the project's commission rate and takes a unit off what is available.
- **Ads**: each campaign gets its own link; visitors who register through it are counted for that campaign.
- **Team**: the agents assigned to the project, with their sales and buyers.
- **Business plan**: units, commission and ad budget targets against actual results and pace.

The project link opens `project.html`, a public page with the photos, video, VR and prices. Visitors who register their interest arrive in the CRM as new leads within a second. Commission, targets and team never reach the public page.

## Ask by typing or by voice

The box at the top of every screen (or the `/` key) and the microphone beside it take one request and act on it:

- **A plot number** (`E-1024`, `ژمارەی زەوی E 1024`) opens the map on that property. A plot with no pin yet asks you to tap where it stands; an unknown number offers to add it. Public maps do not carry land registry numbers, so a plot is found once it has been added here with its place.
- **A country, city, address or coordinates** (`Dubai`, `36.19, 44.01`) flies the map there and drops a marker. The same search sits above the map. Place names are looked up with OpenStreetMap Nominatim, so the words typed there are sent to that service.
- **A section name** (`ads`, `تیم`, `الخريطة`) opens it; **"new" plus a thing** (`new lead`, `کڕیاری نوێ`) opens that form.
- **Any other name** lists matching properties, projects, leads and team members.

It understands English, Arabic and Kurdish, including Kurdish typed on an Arabic keyboard. Voice uses the browser's own speech recognition (Chrome, Edge, Safari). Browsers do not recognise Kurdish speech yet, so in Kurdish the microphone falls back to Arabic; typing works in all three.

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
    js/views4.js      project file (media, sales, ads, team, plan) and business plan
    js/adscreen.js    ad screen player, office TV display, photo and video uploads
    js/public.js      public project page (project.html) where clients register interest
    js/app.js         routing and actions
    js/ask.js         ask box: plot numbers, places, sections and voice
    js/cloud.js       sign-in, offices, sync with the database
    js/config.js      database address and public key
    assets/           logo, favicon and app icons
    supabase/         database schema
    tools/build-artifact.mjs   bundles everything into one HTML file

The map uses MapLibre GL (in `vendor/`) with OpenFreeMap vector tiles for streets and 3D buildings, and Esri World Imagery for the satellite view. It needs an internet connection and WebGL; without them it falls back to a plain grid and pins still work.
