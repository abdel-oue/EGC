# Team photos

Put photos in this folder with these exact filenames:

- `ouedghiri-abdelaziz.jpeg` — OUEDGHIRI Abdelaziz, Président
- `loutaoui-adam.jpeg` — LOUTAOUI Adam, Vice-président
- `bassim-rayan.jpeg` — BASSIM Rayan, Trésorier
- `idrissi-kaitouni-mehdi.jpeg` — IDRISSI KAITOUNI Mehdi, Secrétaire
- `arayane-nabil.jpeg` — ARAYANE Nabil, Responsable communication & contenu
- `essalhi-ilyass.jpeg` — ESSALHI Ilyass, Responsable Minecraft
- `el-kerraz-saad.jpeg` — EL KERRAZ Saad, Responsable logistique
- `lachkar-yasser.jpeg` — LACHKAR Yasser, Chargé des opérations
- `squalli-omar.jpeg` — SQUALLI Omar, Chargé des opérations
- `fazghoun-yassmine.jpeg` — FAZGHOUN Yassmine, Chargée des opérations

Use portrait photos, ideally at least 880 x 670 pixels. JPEG photos fill the portrait frame. Keep the face near the upper center.

If using another extension or filename, update the corresponding `photo` field in `../content.json`.
Missing photos leave the background visible and print a notice during rendering.

From the workspace root, run: `python Insta/team-members/render.py`.

## Adjust size and vertical position

Edit `../content.json`. The top-level `member_photo_width` and `member_photo_height` set all individual portrait frames (currently 760 x 580 pixels). Frames remain horizontally centered; captions follow the bottom of the frame.

Each member has a `photo_offset_y` in output pixels: positive moves the person lower inside the frame, negative moves them higher, and `0` uses the default crop. Mehdi uses `35`; Saad uses `-35`. For a smaller adjustment, try `15` or `-15`. Movement is limited at the photo edges so no blank strips appear; a photo that already fits the frame height has no vertical room to move.

Rerun the renderer after saving to update `white/` and its preview. Original JPEG files stay unchanged.
