# Stream assets — Valorant Skirmish 2v2

Everything shown on the Twitch stream on 31 October, grouped by how it gets made:

- **Automatic**: live from the website, added in OBS as a *Browser source*. It updates by itself when staff record winners in the admin.
- **OBS text**: a generated background plus OBS *Text* sources that the producer edits between matches.
- **Generated**: a static image, made once from the prompt below.

## Brand rules for every asset

- Colours: Night `#0E0E10` (background), Burnt Orange `#E35205` (accent), Off-white `#F5F3EF` (text), Graphite `#2A2A2E` (panels).
- Fonts: **Space Grotesk** Bold uppercase for titles and team names, **Inter** for small text. Generate images **without text**, then add the text in OBS or Canva, because image models misspell words.
- Logo: always place the real file from `structure/` on top. Never let the AI draw a logo; leave an empty space for it.
- Style: flat, angular esports HUD with cut corners, thin lines and a subtle grid. No neon, glow or lens flares.
- Size: 1920×1080 PNG unless stated otherwise.

**Shared prompt suffix** (append it to every prompt below):

> flat vector esports broadcast graphic, matte near-black background #0E0E10, burnt orange #E35205 accents, dark graphite #2A2A2E panels, off-white #F5F3EF details, angular HUD shapes with 45-degree cut corners, thin technical lines and a faint square grid, minimal, clean, high contrast, no text, no letters, no logos, no neon, no glow, no lens flare, 16:9

## 1. Full screens

| # | Element | How | When it's shown |
|---|---|---|---|
| 1.1 | Starting soon | Generated + OBS text (countdown) | Before 22:00 |
| 1.2 | Technical pause / BRB | Generated + OBS text | Technical pauses |
| 1.3 | Full bracket | **Automatic** | Between matches |
| 1.4 | Seeding / standings | **Automatic** | Opening, after starting soon |
| 1.5 | Match intro (versus) | Generated + OBS text | Before each match |
| 1.6 | Prize pool | Generated + OBS text | Opening, before the final |
| 1.7 | Champion | Generated + OBS text | After the final |
| 1.8 | Thanks / ending | Generated + OBS text | End of stream |

**1.1 Starting soon**
> Wide esports broadcast holding screen, large empty centered rectangle area for a logo and a countdown, angular orange frame lines converging toward the center, layered graphite panels at the left and right edges, small tactical corner brackets, abstract hint of a Valorant-like stylised map silhouette in the background at 10% opacity,

OBS text: "LE TOURNOI COMMENCE BIENTÔT" plus an Inter countdown (use the *Countdown* script or a text source updated by hand).

**1.2 Technical pause**
> Esports broadcast pause screen, a single wide horizontal graphite band across the middle with an orange left edge accent, large empty band for a title, small diagonal hazard-stripe details in orange at the band ends, calm and minimal,

OBS text: "PAUSE TECHNIQUE" / "ON REVIENT VITE".

**1.3 Full bracket — automatic**
- OBS Browser source: `https://egc-landing.dryalapah.workers.dev/fr/events/valorant-skirmish-2v2-31-octobre-2026#bracket`, 1920×1080.
- Crop to the dark bracket board, or ask for a clean `/stream/bracket` page without the site menu.
- Press *Refresh cache of current page* after each recorded winner (or set a refresh interval).

**1.4 Seeding / standings — automatic**
- Same URL ending in `#standings`. It shows the 6 byes and the 4 play-in teams with their seeds and average ranks.

**1.5 Match intro (versus)**
> Esports versus screen split diagonally into two halves, left half graphite, right half near-black, a sharp burnt-orange diagonal slash dividing them through the center, two large empty angular nameplates on each side for team names, small empty square badges for seed numbers above each nameplate, empty center diamond for a 'VS' label,

OBS text: team names (Space Grotesk 96 px), seeds, "VS", round name ("PLAY-IN", "QUARTS DE FINALE"…).

**1.6 Prize pool**
> Esports prize announcement screen, two stacked angular plaques, the top plaque larger with a solid burnt-orange border and subtle metallic sheen, the lower plaque smaller graphite with a thin orange edge, abstract geometric trophy shape built from flat triangles above the plaques, minimal,

OBS text: "CASHPRIZE", "VAINQUEUR — 300 DH", "FINALISTE — 100 DH".

**1.7 Champion**
> Esports champion celebration screen, large flat geometric trophy built from angular orange and off-white facets in the center, radiating thin orange lines, sparse angular confetti shapes in orange and off-white, wide empty plaque below the trophy for the team name,

OBS text: "CHAMPIONS", team name, the two Riot IDs, "300 DH".

**1.8 Thanks / ending**
> Esports end-of-stream screen, minimal layout with an empty area on the left for a logo and an empty column on the right for three stacked social-media rows, thin orange separator lines,

OBS text: "MERCI D'AVOIR REGARDÉ", Instagram / Discord / Twitch handles (from the site footer).

## 2. In-game overlays (on top of the Valorant feed, transparent PNG)

| # | Element | How | Size |
|---|---|---|---|
| 2.1 | Score bar (top centre) | Generated frame + OBS text | 1920×1080 transparent |
| 2.2 | Mini bracket / "road to final" | **Automatic** (cropped browser source) | ≈480×300 |
| 2.3 | Caster / host lower third | Generated + OBS text | 1920×1080 transparent |
| 2.4 | Ticker bar (bottom) | Generated + OBS text (scrolling) | 1920×60 |
| 2.5 | Facecam frame | Generated | 1920×1080 transparent |

**2.1 Score bar.** Leave the centre of the screen and the Valorant HUD free: the game shows its own score at the top centre, so this sits just below it or in a top corner.
> Transparent background PNG, thin compact esports scoreboard bar shaped like a flat angular trapezoid, two graphite team panels left and right each with an empty small square seed badge, center small orange panel for the round name, everything else fully transparent,

OBS text: seed, team name, round name ("QUART 1", "FINALE — BO3 · CARTE 2").

**2.2 Mini bracket — automatic.** The same browser source as 1.3, scaled down and cropped to the team's half of the bracket. Show it during the buy phase or a replay.

**2.3 Lower third**
> Transparent background PNG, esports lower-third nameplate in the bottom left, a long graphite bar with a short burnt-orange block on its left end and a thin orange underline, angular cut corners, everything else fully transparent,

OBS text: name + role ("CASTER", "ARBITRE").

**2.4 Ticker bar**
> Transparent background PNG, full-width thin bottom bar in near-black with a small solid orange tab on the left end, thin orange top border line,

OBS scrolling text: "CASHPRIZE 300 DH · 100 DH — Rejoins le club : discord · instagram — Règlement sur le site EGC".

**2.5 Facecam frame**
> Transparent background PNG, rectangular camera frame with thin off-white border, burnt-orange cut corner accents at the top-left and bottom-right, small empty graphite name tab attached under the frame, inside of the frame fully transparent,

## 3. Small items

| # | Element | How |
|---|---|---|
| 3.1 | Stinger transition (logo wipe, 1 s) | Generated frames or made in Canva: orange diagonal panels wipe across, logo appears in the centre |
| 3.2 | "Live" / "Replay" tag | Generated, 300×80 transparent: small orange angular tag shape |
| 3.3 | Twitch offline banner | Same prompt as 1.1, 1920×1080, with the event date added |
| 3.4 | Twitch panels (About, Règlement, Cashprize, Discord) | Generated, 320×100: graphite plaque with an orange left edge, title added in Canva |

## 4. Producer checklist

- [ ] Logo PNG ready (from `structure/`), white and orange versions.
- [ ] Space Grotesk and Inter installed on the streaming PC (OBS needs local fonts).
- [ ] Browser sources tested: `#bracket` and `#standings`.
- [ ] Every team name checked against the bracket (e.g. `.gitignore`, `Mammy's`) for spelling.
- [ ] Prize amounts match the site: 300 DH winner, 100 DH runner-up.
