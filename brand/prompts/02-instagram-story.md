# Instagram Story — 1080×1920 (9:16)

> Current direction: all new posts use a white theme (Off-White #F5F3EF), Night #0E0E10 text, and Burnt Orange #E35205 accents. Place the official logo at the top-left. Generate backgrounds without text or logos; add exact assets and variable content with the Python renderer.

> Prompt = `00-brand-core.md` + this block.

```
FORMAT: Instagram story, 1080x1920 px, vertical 9:16.
SAFE ZONES: nothing important in top 250px and bottom 300px (UI covers it).
BACKGROUND: Off-White #F5F3EF with Night text. Real photos may be placed inside light panels.
LAYOUT:
- Top (below 250px): ESISA Gaming Club icon, top-left inside the safe zone, small.
- Middle: headline Space Grotesk Bold uppercase, 3–5 words max,
  keyword in Burnt Orange #E35205.
- Below: 1–2 short info lines in Inter.
- Lower third: leave empty space for Instagram sticker
  (link / countdown / poll), framed by orange corner brackets [ ].
RULES: readable in 2 seconds. If you need to read twice, too much text.
```

## Example layout
```
┌─────────────┐
│ (UI zone)   │
│   [icon]    │
│             │
│  ON         │
│  RECRUTE.   │ ← orange
│             │
│ Joueurs ·   │
│ Staff ·     │
│ Créateurs   │
│             │
│ ┌─       ─┐ │
│  [STICKER]  │ ← link / countdown
│ └─       ─┘ │
│ (UI zone)   │
└─────────────┘
```

## Story types
| Type | Usage |
|---|---|
| Announcement | Same visual as feed post, reformatted 9:16 |
| Countdown | Countdown sticker + "J-3" big in orange |
| Poll / Quiz | Question in headline, sticker center |
| Behind the scenes | Raw photo/video, only small icon + 1 line text |
| Results | Score/winner big, orange highlight on winner |
