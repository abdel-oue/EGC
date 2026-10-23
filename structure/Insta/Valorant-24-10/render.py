"""Render the white club tournament posters using official branding assets."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
BG = '#F5F3EF'
INK = '#0E0E10'
ORANGE = '#E35205'
ASSETS = ROOT / 'Recrutement/visuels/assets'


def font(size, bold=False):
    f = ImageFont.truetype(str(ASSETS / ('SpaceGrotesk.ttf' if bold else 'Inter.ttf')), size)
    try:
        f.set_variation_by_axes([700 if bold else 500])
    except (OSError, ValueError):
        pass
    return f


def text(draw, value, xy, size, color=INK, bold=False, anchor='lt'):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def artwork(canvas, box):
    x, y, w, h = box
    art = ImageOps.fit(Image.open(BASE / 'arena-white.png').convert('RGB'), (w, h), method=Image.Resampling.LANCZOS)
    # Fade into the club's off-white paper at both horizontal boundaries.
    mask = Image.new('L', (w, h))
    md = ImageDraw.Draw(mask)
    for row in range(h):
        a = int(255 * min(1, row / (h * .12), (h - 1 - row) / (h * .18)))
        md.line((0, row, w, row), fill=max(0, a))
    canvas.paste(art, (x, y), mask)


def logo(canvas, x, y, width):
    source = Image.open(ASSETS / 'full-logo.png').convert('RGBA')
    source = source.crop(source.getchannel('A').getbbox())
    source = source.resize((width, round(width * source.height / source.width)), Image.Resampling.LANCZOS)
    canvas.paste(source, (x, y), source)


def render(story=False):
    w, h = (900, 1600) if story else (1600, 900)
    im = Image.new('RGB', (w, h), BG)
    artwork(im, (0, 520, 900, 506) if story else (0, 155, 1600, 590))
    d = ImageDraw.Draw(im)
    m = 62 if story else 78
    logo(im, m, 50 if story else 36, 355 if story else 315)
    # A small editorial marker balances the official logo.
    text(d, 'TOURNOI / 2V2', (w-m, 78 if story else 65), 19, anchor='rt')
    d.line((m, 226 if story else 185, w-m, 226 if story else 185), fill='#D6D2CC', width=2)
    if story:
        text(d, 'TOURNOI', (m, 278), 70, bold=True)
        text(d, 'VALORANT', (m-3, 356), 122, ORANGE, True)
        # Bottom details sit on paper, clear of the artwork.
        text(d, 'SKIRMISH 2V2', (m, 1140), 57, bold=True)
        text(d, 'FORMEZ VOTRE DUO ET REJOIGNEZ', (m, 1224), 29)
        d.line((m, 1296, w-m, 1296), fill=ORANGE, width=3)
        d.ellipse((m, 1344, m+14, 1358), fill=ORANGE)
        text(d, 'LIVE TWITCH', (m+32, 1335), 32, bold=True)
        text(d, 'SAMEDI 24/10', (m-3, 1395), 74, bold=True)
        text(d, 'ESISA GAMING CLUB', (m, 1530), 20)
        d.line((w-m-98, 1538, w-m, 1538), fill=ORANGE, width=3)
    else:
        text(d, 'TOURNOI', (w//2, 243), 76, bold=True, anchor='mt')
        text(d, 'VALORANT', (w//2, 323), 152, ORANGE, True, 'mt')
        text(d, 'SKIRMISH 2V2', (w//2, 490), 57, bold=True, anchor='mt')
        text(d, 'FORMEZ VOTRE DUO ET REJOIGNEZ', (w//2, 572), 26, anchor='mt')
        d.line((m, 731, w-m, 731), fill=ORANGE, width=3)
        d.ellipse((m, 789, m+14, 803), fill=ORANGE)
        text(d, 'LIVE TWITCH', (m+32, 778), 35, bold=True)
        text(d, 'SAMEDI 24/10', (w-m, 769), 61, bold=True, anchor='rt')
    dest = BASE / ('valorant-story-white.png' if story else 'valorant-landscape-white.png')
    im.save(dest)
    print(dest)


if __name__ == '__main__':
    render()
    render(story=True)
