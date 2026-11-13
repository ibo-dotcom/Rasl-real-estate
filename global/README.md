# Real Estate Global

The member app at https://rasl-global.netlify.app: join with a sponsor's code, profile, team tree,
project ads, villas and projects. One page, `index.html`, talking to Supabase project
`wmdegnafpgzhnpplnxqo`.

- The first account became the owner (code `IBO-1`). Everyone after joins with a sponsor's code and
  gets a code under it (`IBO-1-1`, `IBO-1-1-1` and so on). Codes cannot be changed.
- Each member sees their own team: everyone who joined under them, at every level.
- Everyone can have at most 10 direct members; an 11th person is refused with that code.
- Only the owner adds or removes project ads and villas/projects. An ad can be a photo, an
  uploaded video (up to 50 MB, plays muted on a loop) or a YouTube link.
- Team map: everyone is drawn under their sponsor. A tap on a person shows rank and percentage,
  own and team points, own and team sales, earnings, sponsor, phone and city. Each sponsor sees
  only their own team; the owner sees everyone.
- World map (the Search tab): opens on the viewer's own position, shows every project that has a
  place, and finds a plot number, project, city, country or coordinates. "Way and time" draws the
  road from the viewer with distance and driving time, and hands the trip to Google Maps. Streets
  come from OpenFreeMap (rebuilt weekly from OpenStreetMap), satellite from Esri, places from
  Nominatim and roads from the public OSRM server.
- A project can carry a 3D / virtual tour link (Sketchfab, Kuula, Matterport, 3DVista,
  Momento360, YouTube and Vimeo show inside the page; other links open in a new tab) and a number
  of units. Units left = units minus approved sales of that project, read from the database each
  time a project or the home screen opens, so the whole sales team sees the same count.
- CRM (the CRM tab): each member keeps their own clients with phone, what they want, budget,
  project, stage (new, contacted, visit, negotiation, won, lost), next follow-up and notes. It
  shows follow-ups due, the sales funnel, why clients were lost and this month's calls, WhatsApp
  messages, visits and meetings. Call and WhatsApp buttons log the contact. Sponsors and the owner
  can switch to their team's clients (read only) with a per-member performance table.
- Academy (from the home screen): training videos in sections (getting started, business plan
  short and long term, selling, more) as YouTube/Vimeo links or uploaded clips, and company meetings
  with date, place, online link and picture. Members say whether they are coming; the next meeting
  also shows on the home screen as an ad. Only the owner adds videos and meetings.
- Projects carry a commission rate. A sale records its project; its commission and the part
  that goes into the team wallet are fixed when it is recorded.
- When the owner approves a sale, the wallet share is paid out: the seller's part, then each level
  above the seller, and what is left stays with the office. The owner sets all the percentages on
  the Accounts page and records what was paid to each member; each member's Wallet shows what they
  earned, what was paid and the balance.
- Sales: a member records a sale; it counts once the owner approves it. 1 point per $1,000.
  Rank comes from team points against the plan's thresholds; earnings are the rank percentage of
  own approved sales plus the level percentage of every approved sale made under the member.

Published to GitHub Pages at https://ibo-dotcom.github.io/Rasl-real-estate/global/ on every push (`.github/workflows/pages.yml`). Opened as a preview inside Claude, it shows a banner with that address, since accounts cannot work there.

## Buy / Reserve on a project
Members open a project page and, under the 3D tour, fill in the unit and price. Before sending, they see how much commission there is, what goes to the team wallet, what they get, and what each sponsor level gets.
- **🏠 Buy** creates a sale, which pays out after the owner approves it.
- **📌 Reserve** creates a reservation, which holds the unit and pays nothing yet.
- **↩ Back** scrolls back to the 3D tour.

The owner sees approved reservations on the Sales page. Pressing **Became a sale** turns one into a sale and pays the team.

## 3D home tour (`tour.html`) · VANA
This is a 3D walkthrough built with Three.js from a floor plan. It works on phones and laptops:
- **Walk:** drag to look around; use the joystick or WASD to walk.
- **Dollhouse:** a view from above with the ceilings removed.
- **Style:** switch between 3 furniture styles (Modern, Scandinavian, Warm luxury).
- **Light:** a slider from morning to sunset to night; at night the lamps turn on.
- **Guided tour:** walks room by room, showing each room's name, size (m²/ft²) and selling point, with soft music made in code.
- **Rooms 🧭:** pick a room and gold arrows on the floor show the way there; the camera walks in straight lines through the doors.
- **Measurements:** each room's width and length are written on its walls, and in the dollhouse view every room shows its name, size and area.
- **Interior design:** decorative ceilings with LED cove light and downlights, and a feature wall (wood slats or colour) behind beds and sofas, changing with each style.
- **Welcome screen and contact:** shows the project name, address and price, plus Call and WhatsApp buttons.

Link options:
- `tour.html` opens the sample Salam Residence layout.
- `tour.html?p=NAME` loads `plans/NAME.json`.
- Add `&agent=Name&phone=964...` so each member can share the link with their own phone number.
- Add `&lang=ku|ar|tr|en` and `&style=modern|scandi|lux`.

Plan format: `floors[].rooms[]` with `{id, type, rect:[x,z,w,d] in metres, name, note}`, plus `doors[]` / `windows[]` as `{x, z, w, kind}`, and `tour` for the order of rooms.

## 360° · 3D · VR Studio (`studio.html`)
Open it from the **🎥 360° · 3D · VR Studio** button on the home screen.
- **Add:** photos or videos (several at once), or paste a link to a picture, a video, YouTube, or a web tour (Resimo, Matterport, `tour.html`).
- **360°:** a 2:1 panorama (from a 360 camera or the phone's panorama mode) turns slowly all the way around. Drag to look; pinch to zoom.
- **3D:** a normal photo is shown on a curved surface and pans slowly with a gentle zoom. Several photos fade from one to the next.
- **VR:** split screen for a headset; move the phone to look around.
- **🎬 Make video:** records one full slow turn (up to 60 s) with the VANA logo and an optional title. You can then save it or send it.
- **🔗 Link:** uploads the photos to the `studio` storage bucket (signed-in members only, each into their own folder) and makes a link that anyone can open.

## Unit board on a project (buy / reserve a specific unit)
- On the project page, each building shows its floors and units. Each unit shows its code (e.g. `A-10-3`) and price.
- Colours: **green** = free, **orange** = reserved, **red** = sold. A gold border marks your own.
- Tap a unit to see its price, rooms and area, and how the commission is shared (team wallet, you, sponsor levels 1–5). Then press **Buy** or **Reserve**.
- In the database the price comes from the unit itself, and a unit can only be taken once (`unit_taken`). An approved sale pays the commission out to the team as before.
- **Owner:** "＋ Add units" creates a building's floors × units in one go (with a starting price and an optional extra amount per floor). Tap a unit to change its price, rooms or area, or to delete it.
- A rejected sale or reservation frees the unit again.
