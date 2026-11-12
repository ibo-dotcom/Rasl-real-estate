# Real Estate Global

The member app at https://rasl-global.netlify.app: join with a sponsor's code, profile, team tree,
project ads, villas and projects. One page, `index.html`, talking to Supabase project
`wmdegnafpgzhnpplnxqo`.

- The first account became the owner (code `IBO-1`). Everyone after joins with a sponsor's code and
  gets a code under it (`IBO-1-1`, `IBO-1-1-1` and so on). Codes cannot be changed.
- Each member sees their own team: everyone who joined under them, at every level.
- Everyone can have at most 10 direct members; an 11th person is refused with that code.
- Only the owner adds or removes project ads and villas/projects.
- Team map: everyone is drawn under their sponsor. A tap on a person shows rank and percentage,
  own and team points, own and team sales, earnings, sponsor, phone and city. Each sponsor sees
  only their own team; the owner sees everyone.
- Sales: a member records a sale; it counts once the owner approves it. 1 point per $1,000.
  Rank comes from team points against the plan's thresholds; earnings are the rank percentage of
  own approved sales plus the level percentage of every approved sale made under the member.

Published to GitHub Pages at https://ibo-dotcom.github.io/Rasl-real-estate/global/ on every push (`.github/workflows/pages.yml`). Opened as a preview inside Claude, it shows a banner with that address, since accounts cannot work there.
