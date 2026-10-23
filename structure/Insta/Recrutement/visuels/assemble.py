from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parent
NIGHT = '#0E0E10'
WHITE = '#F5F3EF'
ORANGE = '#E35205'
MUTED = '#626267'
ROLES = ['Responsable Sponsoring', 'Responsable Logistique', 'Responsable Communication & Contenu', 'Responsable Minecraft', 'Membre du Staff']

def font(size, headline=False):
    f = ImageFont.truetype(str(ROOT / 'assets' / ('SpaceGrotesk.ttf' if headline else 'Inter.ttf')), size)
    if headline:
        f.set_variation_by_axes([700])
    else:
        f.set_variation_by_axes([14, 500])
    return f

def unique(name):
    p = ROOT / name
    version = 2
    while p.exists():
        p = ROOT / f'{Path(name).stem}-v{version}{Path(name).suffix}'
        version += 1
    return p

def compose(story=False):
    height = 1920 if story else 1350
    plate = Image.open(ROOT / 'assets' / 'white-background.png').convert('RGB').resize((1080, height), Image.Resampling.LANCZOS)
    im = Image.blend(Image.new('RGB', (1080, height), WHITE), plate, 0.45)
    d = ImageDraw.Draw(im)
    title, body, small = font(108, True), font(36), font(28)
    def text(value, x, y, f=small, color=NIGHT, center=False):
        if center:
            x = (1080 - d.textlength(value, font=f)) / 2
        assert x >= 60 and x + d.textlength(value, font=f) <= 1020, value
        d.text((x, y), value, font=f, fill=color, anchor='lt')

    logo = Image.open(ROOT / 'assets' / 'full-logo.png').convert('RGBA')
    logo = logo.crop(logo.getbbox())
    logo.thumbnail((760, 320) if story else (600, 250), Image.Resampling.LANCZOS)
    logo_x = (1080 - logo.width) // 2
    logo_y = 265 if story else 150
    im.paste(logo, (logo_x, logo_y), logo)
    slogan_y = 630 if story else 430
    text('Nouveau logo, nouvelle saison,', 76, slogan_y, center=story)
    text('nouvelle team.', 76, slogan_y + 40, center=story)
    headline_y = 760 if story else 535
    left = 'ON '
    right = 'RECRUTE'
    total = d.textlength(left + right, font=title)
    x = (1080-total)/2 if story else 76
    text(left, x, headline_y, title)
    text(right, x + d.textlength(left, font=title), headline_y, title, ORANGE)

    roles_y = [960, 1036, 1112, 1188, 1264] if story else [685, 747, 809, 871, 933]
    for role, y in zip(ROLES, roles_y):
        d.line((76, y+4, 76, y+30), fill=ORANGE, width=3)
        text(role, 106, y, body)

    separator_y = 1340 if story else 1006
    d.line((76, separator_y, 1004, separator_y), fill=ORANGE, width=2)
    text('Étudiants ESISA', 76, separator_y + 28, center=story)
    text('Candidatures ouvertes jusqu’au 11 octobre 2026', 76, separator_y + 70, color=MUTED, center=story)
    if story:
        text('Postule ici', 76, 1490, body, center=True)
        # Empty area for the native Instagram link sticker, inside safe zone.
        x0, x1, y0, y1, length = 260, 820, 1550, 1610, 24
        for x, dx in [(x0, length), (x1, -length)]:
            for y, dy in [(y0, length), (y1, -length)]:
                d.line((x+dx, y, x, y, x, y+dy), fill=ORANGE, width=3)
    else:
        text('Pour postuler, rendez-vous en story', 76, 1150)
        text('@esisa.gaming.club', 76, 1256, color=MUTED)

    p = unique('recrutement-story.png' if story else 'recrutement-post.png')
    im.save(p, dpi=(72,72))
    orange_pixels = sum(1 for r,g,b in im.get_flattened_data() if r>130 and r>g*1.8 and g>b*1.5)
    assert orange_pixels/(1080*height) < .15
    return {'file': p.name, 'dimensions': [1080,height], 'theme': 'off-white', 'logo': 'Branding/svg/cropped/Untitled (15).svg', 'orange_fraction': round(orange_pixels/(1080*height),4), 'roles': ROLES, 'deadline': '2026-10-11', 'sticker_rectangle': [260,1550,820,1610] if story else None}

if __name__ == '__main__':
    report = [compose(), compose(True)]
    unique('verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))
