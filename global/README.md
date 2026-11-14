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
