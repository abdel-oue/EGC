# White theme team carousel

The generated backgrounds contain no text or logos. `render.py` adds the official transparent logo in the top-left corner, typography, member photos, captions, slide numbers and footer. The four older dark PNGs remain as references; current exports are in `white/`.

Run from the workspace root:

```powershell
python Insta/team-members/render.py
```

Pillow is already available in this workspace. On another machine, install `requirements.txt` with pip.

## Change the content

Edit `content.json`, then rerun the command. Update titles, subtitles, CTA, footer, logo width, fonts, colors, or background paths. Add, remove, or reorder slide objects; the renderer calculates slide numbers automatically. Every export is 1080 × 1350 pixels.

Member fields:

```json
{"name": "Member name", "role": "Member role", "photo": "photos/member.jpg"}
```

Photo and asset paths are relative to the JSON file. The ten member slides already point to their expected JPEG files in `photos/`; see `photos/README.md` for the exact filenames. Missing or `null` photos leave the reusable artwork visible in the portrait frame. Transparent PNG cutouts retain the artwork behind the person; opaque photos fill the frame. Photos are cropped with orientation corrected automatically. Member headings, names and roles are centered, with the portrait positioned directly below the heading. Headlines wrap and shrink to fit; overly long content raises an error instead of being silently clipped.

Supported slide types: `cover`, `member`, `group` (up to ten members), and `closing`. Group `members` can contain member slide IDs or full member objects. The full-team slide references the ten individual slides, so their names, photos and crop offsets stay in sync. It uses show_roles: false to display only names; individual slides retain their roles. Groups of five to ten use four columns with the final row centered; photo offsets scale to the smaller frames. Set `output_dir` to a different folder when making a new post; matching filenames in that output folder are regenerated on each run. If you remove slides, older PNGs remain, so use a fresh output folder for the final selection.

The white backgrounds are reusable assets in `assets/`. Their generation briefs are in `background-prompts.md`. Regular content changes require no image generation.
