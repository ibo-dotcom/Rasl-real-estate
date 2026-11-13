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
Open it from the round **360°** button at the top of the home screen (next to it, **3D** opens the 3D home tour).
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

## Apartments on the towers in 3D (`towers.html?l=LISTING_ID`)
Open it from the gold **🏙 See the apartments on the towers (3D)** button on a project's unit board.
- Every building is drawn as a tower, floor by floor, and every apartment is a box on the facade: **green** free, **orange** reserved, **red** sold.
- Turn, zoom, and tap an apartment. You see its price, rooms and area, and how the commission is shared. Then press **Buy** (it turns red at once) or **Reserve** (it turns orange).
- Tapping a colour in the legend hides or shows that group, e.g. to see only the free apartments.

## Training guide (`guide/`)
Open it from the **📘 Full training** card at the top of the Academy page, or at `guide/index.html`.
- **12 parts, 50 steps:** getting started, profile, home, projects and units, the 3D tour, the map, CRM, team, sales and wallet, the academy, the studio, and the owner's tools.
- **How it plays:** each step shows the real screen in a phone frame, with the button being explained circled in gold, a tap animation and a caption. It plays by itself like a video. Swipe or use ⏮ ⏭ to move; ☰ opens the list of parts; KU/EN switches the language.
- **Videos:** `guide/video/*.mp4` holds one MP4 per part plus `all.mp4` (Kurdish captions, 1280×720), ready to send on WhatsApp or post. They are also added as lessons in the Academy.
- **Rebuilding:** the screenshots come from the app with sample data (scratchpad `cap.js` + `guide_steps.json`); `rec.js` records the MP4s.

## Home layout
- **Header:** profile, search, map 📍, and language.
- **Top:** a big ad banner that slides by itself.
- **Under the banner:** small buttons for Training & meetings 🎓, the 360° Studio and the 3D tour.
- **Middle:** cities as photo cards (two per screen width). Tap a city to see only its projects.
- **Bottom:** 🔥 **Best sellers**, a 3-column grid sorted by units sold, with the sale / rent / off-plan / invest filters.
- **Under the best sellers:** 👥 **My members**. Each person sees their own team with photo, name and code; direct members (up to 10) have a gold ring, and ★ marks members who have a rank. Tap a member to see their points, sales and earnings. "See all" opens the team map, and ＋ invites someone new.
- **📢 Publish card** (in the cities row): opens a menu.
  - Owner: new ad, or a new project/villa.
  - Everyone: share on social media with your code, invite a member, or make a 360° video.
- The small buttons (🎓 / 360° / 3D and the filters) and the bottom bar are smaller, so the screen keeps more room for the ads.
- The home screen is grouped into **three main panels**: ① 📣 Ads (with the 🎓 / 360° / 3D buttons), ② 📍 Cities (with 📢 Publish), ③ 🔥 Best sellers. My members follows underneath. The next meeting shows in the Academy.

## Members publish once they reach a rank
- **Owner:** 📢 Publish → **Who can publish**. Choose a rank, or "Only the owner". Rank names and points are set in the business plan (Admin), e.g. Leader · 1,000 points.
- Rank is based on **team points** (own + team approved sales; 1 point per $1,000), exactly as the ranks page.
- A member who has reached the rank sees **Post my ad** (title, city, price, phone, details, up to 8 photos). Posts wait for the owner's approval (✓ / ✕). Approved posts appear in the ads banner with the member's name.
- A member below the rank sees which rank is needed and a progress bar (e.g. 350 / 1,000 points).
- **Database:** `settings.publish_rank`, `publish_status()`, and the `member_posts` table. Its row rules let only eligible members insert, and only the owner approve. Photos go to the `studio` bucket in the member's own folder.

## Home: six ad places of three kinds (owner's sketch)
- **Header:** profile · search · 📍 map · 🏠 3D · 📢 Ad (publish).
- **① Top:** 1 large ad (slides when there are several).
- A row of round city buttons (photo + name; tap to filter).
- **② Middle:** 2 ads side by side.
- A row of round buttons: 📢 publish, 🎓 academy, 360° studio, 🏠 3D, 🗺 map, language.
- **③ Bottom:** 3 ads side by side. Then the best sellers and my members.
- When adding an ad, the owner chooses **Where on home** (① top / ② middle / ③ bottom) and, if they want, a project it opens. Empty places show a dashed "＋ Add an ad" to the owner only. When there are more ads than places, the row slides. Approved member posts go to the bottom row.
- **Database:** `ads.slot`, `ads.listing_id`, `member_posts.slot`.
- Update: all round buttons are now **one row under the large ad**: CRM, Team, Wallet, Publish, Academy, 360°, 3D, Map, Language, then the cities. The bottom bar is hidden on Home, so ① + ② + ③ (all six places) fit on one phone screen. Other pages keep the bottom bar.
