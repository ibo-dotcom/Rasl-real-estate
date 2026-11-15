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

## Project card (tap any ad or best seller)
- **Shows:** photos and videos; price range (from the units); units left / total; buildings; sold; commission % and $; points per unit; a sold-progress bar; payment steps (with $ per step); details; notes; project owner and partners.
- **Buttons:** See the units and buy · 🧭 Directions (Google Maps to the project location) · 🏙 3D towers / 3D tour · 💬 Share · ✎ Edit.
- **Who can edit:** the app owner, or members added to the project as **Project owner / Partner / Agreement holder** (by member code, in ✎ Edit → partners). They can change buildings, details, payment steps (one per line, e.g. `Down payment: 10`), notes, and add or remove photos and videos. Database function: `update_project`.
- **Who sees commission, points and partners:** the owner chooses a rank per project (✎ Edit → 👁). Price, units, buildings and photos are shown to everyone.
- **Ad places:** every empty place shows **＋ Add an ad · Free** to all members. The owner can set a price per place later (📢 Publish → 🏷 price of each ad place; 0 = free). Partners can post ads for their own projects for free, even below the publishing rank. The owner still approves every post.

## More projects: swipe, search, register
- **In the project card:** swipe left/right (or ‹ ›) to go to the next project. "3 / 12" shows where you are, and 🔍 finds a project by name or city. Projects are ordered by most sold.
- **Register a project (any member, free):** 📢 Publish → 🏢 **Register your project for sale** (name, city, price, units, buildings, type, details, photos). It stays hidden until the owner approves it. The person who registers becomes the project's **owner** (`project_members`) and can add more info, photos and videos from the project card. Database function: `submit_project` (limit 10 waiting per member).
- **Owner:** 📢 Publish → **New projects waiting for approval**: 👁 view, ✓ approve (goes live), ✕ delete. The owner still adds projects directly in ⚙ Manage villas & projects.

## Choosing the row, and property types
- Under every ad row there is a small **＋ Add here ① / ② / ③** button, also when the row is already full. More ads in a row slide left/right.
  - Owner: opens the ad form with that row chosen.
  - Members: opens the post form with that row.
  - Both forms also have **Where on home** (① top · ② middle · ③ bottom).
- **Types:** 🏗 Project · 🏞 Land · 🏡 Villa · 🏢 Apartment · 🏪 Commercial, and ✨ New / ♻ Used. Set in the owner's project form, the member registration form, and ✎ Edit on the project card (`listings.ptype`, `listings.cond`; database functions `submit_property`, `set_property_type`).
- **Bottom section of Home:** buttons filter by type and by new/used, separate from projects. Each card shows its type icon and new/used.

## On a computer
- The same link works on laptops and desktops. The app keeps its phone design in a centred frame (500–520 px wide), with a soft background and the brand on both sides on wide screens, so nothing stretches or breaks.
- Rows that slide (ads, icons, cities, photos) can be **dragged with the mouse** or moved with the **mouse wheel**. In the project card, the **← →** keys go to the next or previous project.
- tour.html, towers.html, studio.html and guide/ already fill a computer screen.

## Calm music (🎵)
- The 🎵 icon in the round-button row opens a small player with three calm tracks, made live in the app (no sound files):
  - 🌙 **Focus:** soft pads, a few bell notes, light rain.
  - ☕ **Lounge:** electric-piano chords, soft bass, light hi-hat.
  - 🌊 **Sea:** slow pads and waves.
- **Silent at start.** Press ▶ to play. There's a volume slider, and the chosen track and volume are remembered. The music keeps playing while you move between pages, and a small 🎵 ⏸ button stays visible to reopen the player.

## Rule: no ad without complete project info (and payment)
- An ad (owner ad or member post) is shown to members only when:
  - it is **linked to a project**;
  - the project's info is **complete**: at least 3 photos or videos, a full description, prices, units (not needed for land), buildings (for projects), map location, commission %, payment way (cash / installment, with the steps for installment), and who owns the project;
  - if the place has a price, the ad is **marked paid**.
- The owner still sees the other ads, with a red ⚠ and the reason. The ad form and the member post form refuse an incomplete project and list what is missing.
- **Owner:** 📢 Publish → 📋 **Ads: ready or not**. Link each ad to a project, mark 💵 paid, and see ✅ or ⚠ for each.
- **Project card:**
  - 👤 project owner;
  - 💵 payment way (cash / installment / both);
  - 📊 **business plan**: commission from start to end (total, team wallet, seller, levels 1–5) for that price;
  - payment steps.
  The project's owner, partners and the app owner also see ✅ "can be advertised" or the list of what is missing.
- **✎ Edit** also sets the payment way and the location (map link or "36.19, 44.01"). Database functions: `set_pay_mode`, `set_project_loc`; new columns `ads.paid`, `member_posts.paid`.
- **Fill in on the spot:** in the ad form (owner) and the post form (members), choosing the project opens its checklist. ✅ marks what is done; each ⚠ item has its own field right there:
  - description, buildings, map location (Google Maps link or numbers), cash/installment and the installment steps;
  - owner only: price, units, commission, and the project owner (member code or "Me").
  **💾 Save project info** saves it all. The photos and videos chosen for the ad count toward the project's 3 and are added to the project. Each project in the list shows ✅ or ⚠.

## Map links
- Location fields accept **any Google Maps link, also the short `maps.app.goo.gl/...` links** from the Share button, as well as "36.19, 44.01" or 📍 "I'm here". Short links are opened on the server by the Supabase edge function `resolve-map`, which only follows Google hosts. It reads the place's exact pin (`!3d…!4d…`), or `?q=`, `/place/`, `/search/`, `@lat,lng`.

## Unit card for the owner
- A sold or reserved unit shows who took it, at what amount, and whether it is waiting for approval.
  - **✓ Approve** pays the commission out.
  - **✕ Cancel** rejects the sale and makes the unit green (free) again.
  - Database function: `unit_sales_admin`, owner only.
- **Price per m²:** in the unit editor and in "＋ Add units", the price can be the full price (e.g. 106250) or the price per m², which is multiplied by the area. A live preview shows the result, e.g. $106,250.

## Differences between units (price, area, floor, payment)
- **＋ Add units** has new fields:
  - **area of each position** (e.g. `125, 125, 177, 90` = the 1st–4th unit on every floor) and **rooms of each position**;
  - price per m² with **+ $ per m² for each higher floor**;
  - **installment +%**, which gives each unit an installment price.
- **✎ Change many units at once (owner):** choose a building, floors from–to and positions (e.g. `1, 2`; empty = all). Then set any of: area, rooms, price per m² (+ per higher floor), a full price (+ per floor), installment +%. Database function: `bulk_units`, owner only.
- **Unit card:** shows the cash price and the installment price, with two buy buttons, **💵 Buy · Cash** and **📅 Buy · Installment**. The sale records the way (`sales.pay_way`), and the database takes the matching price from the unit.
- **Unit editor:** also has the installment price.
- **📋 Units table (owner):** on the project's unit board, every unit is listed in one table with its area, rooms, $/m², cash price and installment price. Writing $/m² works out the cash price from the area. **Paste from Excel or a list** (one line per unit: code, area, rooms, cash price, installment price) fills the table. **💾 Save all** saves only the changed units.

## Sales list per project (project, villa, land…)
- **Project card → 📄 Sales list:**
  - totals for free / reserved / sold, each with its $ value;
  - the payment steps;
  - a table of every unit: code, m², rooms, cash price, installment price, first-step amount, and a status colour.
- The owner, project owner and partners get **⬇ Excel** (a CSV with every unit plus one column per payment step), **🖨 PDF** (print-ready page) and **💬 Share**. Members see the list.
- **On the map:** tapping a project pin shows units left, plus **Open** (project card) and **📄 List**.
- **Every sale is visible to everyone:** a 🔥 **Latest sales** strip on Home (project · unit · sold/reserved · cash/installment · how long ago). The project card shows that project's latest sales. Buyers' details are not shown. Database function: `recent_sales`.

## Project owners pay first, then work like agents
- **Listing fee:** set in 📢 Publish → 🏷 (`settings.listing_fee`). The registration form tells the project, villa or land owner the fee. The app owner marks 💵 paid (`listings.fee_paid`) before ✓ approving; until then the project is not public.
- **🏢 My projects** (round icon and 📢 menu, shown to anyone who registered a project or is a project owner, partner or agreement holder). For each project:
  - live / waiting, and fee paid or not;
  - free / reserved / sold counts;
  - that project's latest sales;
  - buttons: 📄 sales list (with Excel/PDF), 🏢 units, ✎ info.
- **Shared sales:** the project owner and partners see who sold or reserved each of their units (approve/cancel stays with the app owner). Every sale, whether by a member, an agent or the project owner, appears in 🔥 Latest sales for everyone.

## Taxes, fees, fines & charity

- **🏛 Government (owner only)** — circle icon on the home screen. Set the government tax % and the charity % taken from each sale's commission (both are shown to everyone in the commission split). Summary of approved sales: total commission, tax owed / paid / still to pay, fees paid, fines paid. Record payments (tax, fee, fine, charity spending, other) with amount, date and note; delete wrong entries.
- **🤲 Charity (everyone)** — circle icon on the home screen. Charity projects with photo, details, goal and a progress bar of confirmed gifts and donor count. Members tap **Give**, write an amount and note; the gift waits for the owner's confirmation and shows in "My gifts" with its status. The owner sees the charity fund (from sales %, members' gifts, spent, balance), confirms or rejects pending gifts, adds new charity projects (with photo) and hides or deletes them.
- Tables: `ledger`, `charity_projects`, `donations`; settings `tax_pct`, `charity_pct`; functions `charity_totals()` and `finance_summary()` (owner only).

### Contracts & government tax (per contract)

- In the 🏛 sheet the owner sets: government tax %, whether it is taken **from the sale price or from the commission**, government fees (% of price and/or a fixed amount per contract), and a *suggested* charity % (charity is optional).
- Every sale the owner approves (signed contract) automatically gets a row in `contract_taxes` with the rates of that moment: price, tax %, tax $, fees $, total to government. Old approved sales were back-filled.
- The list shows each contract (project, unit, contract no., buyer, seller, date) with paid / not paid. Filter by status and month; edit the contract no., buyer, tax, fees, optional charity (one tap applies the suggested %), receipt and note; mark **✓ Tax paid** with the government receipt number.
- **Excel (CSV)** and **Print for government** produce the report (with totals, signature and stamp lines) to hand to the government.
- `finance_summary()` now counts tax owed/paid from the contracts; charity from sales = the optional charity entered per contract.

### Agents and partners handle their own project's tax

- In **🏢 My projects** each project now has **🏛 Tax & fees**. The agent (project owner) and the partners of that project — and the company owner — can open it; nobody else.
- They set that project's own tax %, tax base (sale price or commission), fees % and fixed fee per contract (`project_tax`, via `set_project_tax`). Everything starts at **0**; **⓪ Back to 0** returns the project and its unpaid contracts to zero at any time.
- They see only their project's contracts and can change only tax, fees, optional charity, contract no., buyer, receipt, note and paid status (`update_contract_tax`); nothing else in the app becomes editable. **⓪** on a contract zeroes that contract's tax and fees.
- **↻ Recalculate unpaid** reapplies the current rates to unpaid contracts (`recalc_contract_taxes`); paid contracts never change. Project rates override the company rates; without them the company rates (default 0) apply.

## Payment methods (bank, wallet, Visa card, cash)

- **💵 Payment** circle on the home screen: everyone sees the company's payment details; the owner turns each method on/off and fills them in (`settings.pay_methods`):
  - 🏦 **Bank** — bank, account name, account no., IBAN (each with a copy button).
  - 👛 **Wallet** — one wallet per line, `Name: number` (e.g. FIB, FastPay, ZainCash).
  - 💳 **Visa card** — a payment link from the bank / payment company (must start with https://). The app opens it; the card is charged there, not inside the app.
  - 💵 **Cash** — office address and hours.
- The "How will you pay?" picker (with the details of the chosen method and a transfer/receipt number) appears when **buying or reserving a unit** (`sales.pay_method`, `sales.pay_ref`), **giving to charity** (`donations.pay_method`, `pay_ref`) and when an agent **pays the ad fee** (`report_fee_payment` → `listings.fee_method`, `fee_ref`; the owner sees it next to 💵 before approving).
- **Tax payments**: each contract and each ledger entry records how it was paid (`contract_taxes.pay_method` via `set_contract_tax_method`, `ledger.pay_method`); the contract card also shows how the buyer paid.

## Points per sale in the wallet

- Rule (database, `sales.points` = price ÷ 1,000): every **approved sale** gives 1 ⭐ point per $1,000. Points count for the seller and for the team points of everyone above them (ranks); reservations give no points.
- **Wallet page** now shows a ⭐ **My points** card (my points, team points, current rank and %, points left to the next rank with a progress bar) and **My sales — points and money**: each own sale with price, sold/reserved, date, status, ⭐ points (or "after approval"), and the money it put in the wallet (≈ expected amount while pending).
- Each wallet entry shows the sale's points (my points for my own sale, team points for a sale from the team).
- The commission split in the unit card starts with "⭐ Points you get +N".

### Points are paid as money (1 point = $1)

- `settings.point_value` (default **$1**; the owner changes it on the wallet page). When a sale is approved, `sale_payout` adds a `points` wallet entry for the seller: points × point value. It is taken from the office's share of the pool, so the commission split of the team does not change.
- Approved sales that already existed were back-filled (5 sales, 195 points → $195).
- Wallet: "⭐ 1 point = $1" banner, **Points money** total, each points entry shown as "⭐ Points money × $1"; the unit card shows "⭐ Points you get (+N × $1) = $N"; pending sales show the expected money including points.

## Forgot password (self-service reset)

- The login screen has a **"Forgot password?"** link under Sign in. The member types their email, taps it, and Supabase sends a reset link (`auth.resetPasswordForEmail`, redirect back to the app).
- Opening the link signs them in (recovery session); the app detects `type=recovery` in the URL, goes to the profile, and prompts them to set a new password with the existing change-password form (`auth.updateUser`). Nobody — not even the owner — can read an existing password; it can only be reset.
- Note: reliable delivery of the reset email needs Supabase Auth email (custom SMTP) and the app URL in the allowed redirect URLs.

## Design system — navy & white (Rasl Estate Global)

The whole app was restyled without changing any feature, route, database call or business rule.

- **Colours:** Deep Navy `#102B46`, Royal Navy `#173F63`, White `#FFFFFF`, Soft Background `#F5F8FB`, Light Blue `#EAF1F7`, Text `#172B3A`, Secondary text `#718096`, Borders `#DFE7EF`. The old dark/gold palette is mapped to these at build time (`theme.py`, the last build step); status colours (sold red, reserved amber, free green) are kept but toned for a light background. No purple, neon or decorative gradients.
- **Shapes:** smaller corner radii (no pill-shaped cards), soft navy shadows instead of heavy black ones.
- **Icons:** emoji in the circle row, header, section titles and payment methods replaced by one consistent line-icon set (`ICO`, `icoIn`).
- **Glass:** only where it helps — the bottom navigation, the sheet backdrop and the language button on the welcome screen use a light blur with thin borders.
- **Welcome screen:** the "HERO PHOTO" placeholder is replaced by a navy brand panel with an architectural skyline; brand name is now **RASL ESTATE GLOBAL**.
- **Map:** light "Positron" map style, navy price markers with white borders, white info panels.
- **Interaction:** smooth colour/border transitions, navy focus ring for keyboard users, white input fields with navy focus, and reduced motion when the phone asks for it.
- **Other pages:** the 3D towers, home tour, studio and training guide keep their dark immersive scenes but now use navy surfaces and white accents instead of gold.

## Zero emoji, mobile responsiveness, search / filter / sort

- **No emoji anywhere.** One line-icon set (`ICO`, same 1.6 stroke, 24px grid, `currentColor` so icons are navy, white or grey with their background). A small runtime pass (`emoji_fix.js`, built into the page) turns any emoji in text — including translations, messages and content that appears later — into the matching icon, removes it from dropdown options, titles and tooltips, and strips it from alerts and share text. Checked on 22 screens and panels: 0 emoji left.
- **Mobile header + menu.** Compact header: menu button, search (name, property number or city), map, profile. The menu opens from the side (right in Kurdish/Arabic, left in English/Turkish) with all sections grouped: properties, my account, tools, company, language and sign out. Under 360px the map button moves into the menu so the search box keeps its room.
- **Property list.** Cards are one column on narrow phones, two from about 360px, three on wide screens; 4:3 photos, price first, two-line title, city, a reference number (`R-XXXXXX`, from the project id), size and units left.
- **Search, filter and sort that change the results.** Search matches name, reference number, city/area and price. Filter drawer: property type, sale/rent/off-plan/investment, new/used, country/city/area, price min–max, size min–max. Active filters show as removable chips with a working "Reset filters". Sort: best selling, newest, oldest, lowest price, highest price, largest size. Price comes from the units (or the first number in the price text); size comes from unit areas or the plot size — map coordinates are ignored.
- **Layout fixes.** Mobile-first widths: full width up to 600px, 640px column on tablets, 560px column with side branding on large screens. Fixed a bug where a hidden label made the page taller than the screen (a blank strip could scroll into view). Inputs use 16px text so iPhones don't zoom in. Tap targets enlarged (44px buttons and header, 40px chips). Images lazy-load. Verified at 320, 360, 375, 390, 414, 430, 600, 768, 1024 and 1440px on 22 screens: no sideways scrolling, nothing off-screen, no console errors.

### Typing no longer redraws the page (ad photos stay, no jumping)

- The home search updates only the property list (`#homeRes`) as you type; the header, ads and shortcut row are not rebuilt, and the list keeps its height while you type so the page does not jump.
- Every full redraw (`render()`) now keeps photos that are already loaded (`keepBefore` / `keepAfter` move the same `<img>` elements into the new screen) and restores the scroll position of each scrolling area. This also fixes the project-card search and the CRM search, which redraw on each letter.

### Automatic updates on every phone

- Each deploy stamps a version into `index.html` (`APP_VER`) and writes the same value to `global/version.json`.
- The app checks `version.json` (never cached) when it opens, whenever it comes back from the background, and every 5 minutes. If the server has a newer version it reloads itself with a fresh copy, staying on the same screen. If the member is typing or has a panel open, it shows a small "A new version is ready — Update" bar instead of interrupting. A reload is tried only once per version, so it can never loop.
- Deploy: `VER=$(date -u +%Y%m%d%H%M%S); sed "s/__APP_VER__/$VER/" reg/index.html > global/index.html; printf '{"v":"%s"}\n' "$VER" > global/version.json`.
- Home-screen app name and colours updated to Rasl Estate Global (navy / white).

### Owner adds members directly

- Menu → **Add a member** (owner only), or the button under **My members** on the home screen.
- Enter full name, mobile, email and a password (a strong one is suggested; tap ↻ for a new one). "Under the code of" is your own code by default (direct member); write another member's code to place the new person under them.
- The account is ready at once — no confirmation email. The app shows the login details to copy or send by WhatsApp. Members can change the password later in their profile.
- Server side: edge function `add-member` (see `supabase/functions/add-member`). The limit of 10 direct members per code still applies.
- One person can have several accounts with the same name or the same email; each gets its own code. If the email is already used, the new account's login email becomes an alias of the same inbox (e.g. `name+r2@gmail.com`), shown in the result card.
- **No limit on the owner's code.** `private.direct_limit_for(sponsor)` returns 0 (no limit) for the owner and 10 for everyone else; the sign-up trigger, `check_code_v2` and the `add-member` function all use it. Names, phone numbers and emails may repeat across accounts — only the code is unique.

## Identity check and team leadership

- **Identity (KYC).** Every member except the company owner and the owner's direct members must send a passport or national ID (number, full legal name, birth date, nationality, city, address) with photos of the document (front/back) and of their face. Photos go to a **private** storage bucket `kyc` (each member writes only to their own folder; only the owner can view them). Table `kyc`, status pending → approved / rejected with a reason.
- **Team leadership.** New members' codes start **inactive** (the owner's direct members start active; all existing members were kept active). An inactive code cannot bring members (sign-up with it is refused with a clear message) and receives no commission or points money — its share stays with the office. To activate, the member opens **Team leadership** (crown icon in the shortcut row and the menu), sends the identity, and pays the leadership price with the usual payment methods (`leader_requests`). The owner sets the price, checks identities with the photos, and taps **Activate code** (`decide_leader`, which requires an approved identity unless the member is exempt).
- Members who still need to act see a banner on the home screen.
- Database: `profiles.active`, `settings.leader_price`, `kyc`, `leader_requests`, `my_status()`, `check_code_v3()`, `decide_leader()`, `set_member_active()`; `handle_new_user` and `sale_payout` updated. `add-member` refuses inactive sponsor codes.

### Owner edits direct members

- In a member's card (tap a member), the owner sees **Edit member** for their own direct members: name, last name, phone, country, city, sign-in email (stays confirmed) and a new password (leave empty to keep; ↻ suggests one). Server side: edge function `edit-member` (owner only, direct members only).

### First line keeps 1% forever

- The owner's direct members ("first line") are never cut off: from every approved sale in their branch they receive at least 1% of the team pool, at any depth. Inside generations 1–5 they get their generation % (5/4/3/2/1); beyond generation 5 `sale_payout` adds a `firstline` wallet entry of `settings.firstline_pct` (default 1%) for the owner's direct member at the top of the seller's branch (only if that code is active), taken from the office remainder. New people joining below never change this.
- Shown in the wallet ("First line 1% (generation N)") and in the unit card's commission split.
- Tested on a temporary 7-level chain inside a rolled-back transaction: generations 1–5 = $50/$40/$30/$20/$10, first line at generation 6 = $10, seller $400 + $100 points, office $340 (for a $100,000 sale).

### Code numbering

- The owner's direct members have their own series: **RASL-01, RASL-02, …** (RASL-100 after RASL-99). The six existing direct members were renumbered in the order they joined (IBO-1-1 → RASL-01 … IBO-1-6 → RASL-06; nobody was under them yet).
- Everyone else keeps the normal style: members under RASL-01 get RASL-01-1, RASL-01-2, … (up to 10 per code). Codes are case-insensitive when typed.

## New commission plan (shares of the whole commission)

| Share | Default |
|---|---|
| Company — taxes & fees (not paid to anyone) | 15% |
| Buyer — discount to the buyer's wallet | 25% |
| Buyer's sponsor | 10% |
| Seller | 25% |
| Generations 1–5 above the seller | 5 / 4 / 3 / 2 / 1% |
| First line (owner's direct member) beyond generation 5 | 1% |
| Points money ($1 per point, 1 point per $1,000) | ~5% at 2% commission |
| Rest → rank bonus pool (`rankpool` entry, to distribute) | ~4% |

- **No sale without a buyer code.** The unit card, the project deal box and the Sales form ask for the buyer's code; the database refuses a sale without a valid code (`buyer_code_required` / `buyer_code_bad`) and stores `sales.buyer_id`.
- Buying a property activates the buyer's code (identity still required unless the buyer is the owner's direct member; if identity is approved later, the code activates then).
- Only active codes receive seller, generation, first-line and points money; the buyer's discount is always paid; the buyer's sponsor share is paid if that sponsor is active. Anything not paid goes to the rank bonus pool.
- The owner changes every percentage on the **Accounts** page (`settings.company_pct`, `buyer_pct`, `buyer_sponsor_pct`, `seller_share_pct`, `firstline_pct`, levels).
- Verified on a temporary chain (rolled back) for a $500,000 villa: buyer $2,500, buyer's sponsor $1,000, seller $2,500 + $500 points, generations $500/$400/$300/$200/$100, first line $100, rank pool $400 — members $8,500 (85%), company $1,500 (15%).

### Weekly rank bonus and 7-day withdrawals

- **Rank bonus pool, weekly.** Every Friday 18:00 UTC (21:00 Erbil) a `pg_cron` job runs `distribute_rank_pool()`: the pool balance (all `rankpool` entries minus what was already paid) is shared among **active members who hold a rank**, weighted by their rank's bonus % (`rankbonus` wallet entries, `rank_distributions` log, at most once per week). If nobody holds a rank, it stays for next week. The owner sees the pool and can press **Distribute now** on the Accounts page.
- **Withdrawals after 7 days.** Money can be withdrawn `settings.hold_days` (7) days after it reaches the wallet. The Wallet page shows *available now / waiting 7 days / requested* and a **Request a withdrawal** form (amount, how to receive, account/number). The database refuses more than the available amount. The owner sees requests on the Accounts page and taps **Mark as paid** (creates the payout) or rejects with a reason (`decide_withdrawal`).

### Points never stop

- Money stops after generation 5 (plus the first-line 1%), but **points continue up the whole line to the owner** with no generation limit.
- Every approved sale's points count for the **seller and the buyer** and for **everyone above either of them**; each sale is counted once per person (no double counting when both lines meet). The buyer also gets the purchase points as their own points.
- Used for ranks (`team_stats_v2`) and the weekly rank bonus (`private.team_points_all`). Verified on a temporary 8-level chain (rolled back): a $100,000 sale gave 100 points to every person above the seller, to the buyer and the buyer's sponsor, and 100 (once) to the owner.
- Money from a sale is split and credited to wallets at the moment the sale is approved; it can be withdrawn after 7 days.
- **Buying team leadership gives points too:** when the owner approves a leadership payment, the member gets `greatest(1, price / 1000)` points (at least 1 point, even under $1,000) in `point_awards`. These points count like sale points: for the member and everyone above them up to the owner (ranks and weekly rank bonus). Verified (rolled back): a $250 leadership purchase under RASL-07 gave 1 point to the member, RASL-07 and the owner.

## Offers (price discount and extra points for a set time)

- **Offers** (tag icon in the shortcut row, the menu, and a strip on the home screen while an offer runs). The owner adds, edits, hides or deletes offers: title, benefit (what the member gets), details, photo, project (one project or all), **price discount %**, **points ×** (e.g. ×2), **extra points per sale**, start and end dates.
- While an offer runs, its project's cards show an "Offers" badge, the unit card shows the offer and the purchase is recorded at the discounted price (`sales.offer_id`).
- When a sale made during the offer is approved, the extra points (`points × (multiplier − 1) + extra points`) are added for the seller and the buyer (`point_awards`, source `offer`) and flow up the whole line like all points. Verified (rolled back): ×2 and +5 on a 100-point sale → +105, so 205 points for everyone above, counted once for the owner.
- Charity and activities stay as they are.

### Home members row and smarter world map (2026-11-15)
- Home "My members" is now one compact row that scrolls sideways; the owner's "Add member" is a small link next to "See all".
- World map search respells Kurdish typed with Arabic letters (قه لاي هه ولير → قەلای هەولیر), tries Kurdish, Arabic and English forms, and shows a list of other matches to pick from.
- Places are suggested while typing (Photon, OpenStreetMap data).
- A number with a city (e.g. "هەولێر 120") first looks for plots registered in the app, then house numbers on OpenStreetMap; if the number is not on the public map, the area is shown with a note.
- Satellite view now shows names of cities, neighbourhoods, streets, places and house numbers (OpenFreeMap labels); the street view also shows house numbers at close zoom.
- Government land-registry plot numbers are not public data, so only plots entered in the app can be found by number.

### World map v3 (2026-11-15)
- Suggestions are a short list (up to 4) inside a panel capped at 38% of the screen, so the map stays visible; only names that really contain what was typed are suggested.
- An exact name (e.g. «قه لاي هه ولير» → Citadel of Erbil) goes straight to the place with no extra list.
- Typing a type of place (hospital / نەخۆشخانە / خەستەخانە, clinic, pharmacy, school, university, mosque, church, restaurant, café, hotel, bank, fuel, park, market, police, airport, gym), optionally with a city, lists every one found (up to 40, nearest first) with small icons on the map; tapping one shows address, phone, opening hours.
- Every picked place offers Walk / Car / Plane: road route from your location (OSRM car, FOSSGIS foot), distance and time, alternative car routes in grey, plane as a great-circle line (800 km/h + 30 min), and an arrow that moves along the line showing direction.
- Small coloured dots for shops, schools, mosques, hospitals etc. on both map styles at close zoom.
- "Safest" route is not measurable from open data; the car route is the fastest one, which uses main roads.

### Counts, licensed offices and team board (2026-11-15)
- Home shows four separate counts: members, projects, app visits (total and today) and approved offices/companies (`app_stats()`, public).
- Visits are logged once per device per day (`log_visit(key)` → `app_visits`, readable only through `app_stats`).
- A member can register an office or a company (`offices`): licensed name, licence number, licence photo/PDF (private `kyc` bucket), logo (`avatars` bucket), city, phone. It starts as pending; the owner checks the licence and approves or rejects with a reason (`decide_office`). Changing the name, type or licence sends it back to pending.
- An approved office brands the member and their whole downline (logo + name + team size bar on Home and Team; `my_office()` picks the nearest approved upline).
- Approved offices get a team meeting link and a team board (`office_posts`) visible only to their own team. Meeting links must be https Zoom, Google Meet, Teams, Jitsi or Whereby; unapproved offices cannot set a link or post (enforced by triggers).
- Owner sees "Office and company requests" on the Team page with the licence document.

### Name check and Academy confirmations (2026-11-15)
- Team page (owner): "Check member names" lists every member with flags (no last name, name too short, differs from the ID/passport name in KYC, not verified). The owner edits first/last name, can copy the ID name with one tap, and saves with or without marking it verified (`name_review()`, `owner_set_name()`).
- `profiles.name_verified`: only the owner can set it; if a member changes their own name it is cleared automatically (trigger `profiles_name_guard`).
- Academy (Learn): every company meeting and lesson has "I have seen it"; team posts also have "I will attend" (`content_acks`).
- A sponsor can share a company meeting or lesson with their team with a note (`team_shares`); it appears at the top of Learn for their whole team under "From your sponsor".
- "My team" on each item shows how many of the sponsor's own team saw it and how many will attend, with a progress bar and names (`team_reach(kind, id)`, only the caller's downline).
- Approved office posts (with Zoom/Meet time) also appear in Learn under "Team meetings and messages".

### Member card with QR, join page, one-account rules (2026-11-15)
- Team page: "My card and QR code" shows the member's public card (name, code, name-verified badge, office/company, rank, points, team points, team size, direct members, and this month's income only if the member ticks the box) with a QR code (vendor/qrcode.js) and Share / Copy link / Save QR buttons. Link: `/?card=CODE`.
- Opening the link shows the card over the app, a short company summary (what the app is, team work, profit only from real sales, training after joining) and the rules: sponsor cannot be changed, one person one account, no two teams, duplicates found by ID and removed, name as on ID. The visitor must tick "I have read this and decide myself" before "Join X's team", which opens Register with the sponsor code filled in. Signed-in visitors are told they already have an account.
- Register page shows the same summary and rules; sign-up is blocked until the box is ticked.
- Database: `member_card(code)` (public), `set_show_income(bool)`, `profiles.show_income`; unique index on KYC document type + number so the same ID cannot register twice.
- Button sweep: every `data-act` button on 14 screens (and the sheets on Home) clicked one by one in a test browser; no runtime errors.
