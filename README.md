# Rasl Estate

Office system for a real-estate brokerage: leads (CRM), listings, map, appointments, deals and commission, team rewards, referrals and charity pledge, market figures, ad campaigns and reports. English, Arabic and Kurdish (Sorani), light and dark.

## Run

No build step. Open `index.html`, or serve the folder with any static host:

    npx serve .

## Data

Records are kept in the browser (`localStorage`) on the device. Use **Office → Save a backup** to export everything as a JSON file and **Restore from a backup** to load it on another device. Sample records load on first run and can be removed in one step.

## Layout

    index.html        page shell
    css/app.css       design tokens and styles
    js/i18n.js        translations (rows of English, Arabic, Kurdish)
    js/store.js       state, persistence, selectors, sample data
    js/ui.js          formatting, icons, dialogs, forms, charts
    js/views1.js      dashboard, leads, property, map
    js/views2.js      rewards, join & charity, team, market, ads, reports, office
    js/app.js         routing and actions
    tools/build-artifact.mjs   bundles everything into one HTML file

The map uses MapLibre GL (in `vendor/`) with OpenFreeMap vector tiles for streets and 3D buildings, and Esri World Imagery for the satellite view. It needs an internet connection and WebGL; without them it falls back to a plain grid and pins still work.
