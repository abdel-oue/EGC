"""Build the EGC game icon family from editable vector artwork."""
from pathlib import Path
from html import escape
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ORANGE = '#E35205'

# Reuse the original crest verbatim, including its asymmetric inner cuts.
LOGO_SOURCE = ROOT.parent / 'svg' / 'cropped' / 'icon' / 'icon.svg'
logo_tree = ET.parse(LOGO_SOURCE)
crest = next(element for element in logo_tree.iter()
             if element.tag.endswith('path') and element.get('data-index') == '0')
FRAME = f'''
  <path transform="matrix(.11 0 0 -.11 -236.25 934.4)" d="{crest.get('d')}"/>
  <path d="M182 425H330L306 437H206Z"/>
'''

ART = {
    'minecraft': ('Minecraft', '''
      <path fill-rule="evenodd" d="M188 160H324L345 181V339L324 360H188L167 339V181Z
        M201 204V243H239V204Z M273 204V243H311V204Z
        M239 242V266H219V322H244V296H268V322H293V266H273V242Z"/>
    '''),
    'valorant': ('Valorant', '''
      <path d="M167 172 278 305H338L291 361H250L167 262Z"/>
      <path d="M345 172V248L309 287H248Z"/>
    '''),
    'fc': ('FC / FIFA', '''
      <path d="M173 190H248L228 218H201V244H236L216 272H201V310L173 337Z"/>
      <path d="M271 190H340L320 218H282L272 228V277L282 287H318L340 315H271L244 289V217Z"/>
      <path d="M239 332 256 322 273 332 269 350H243Z"/>
      <path d="M232 329 222 346 230 363 241 354Z M280 329 290 346 282 363 271 354Z
        M234 367 256 376 278 367 268 358H244Z"/>
    '''),
    'league': ('League of Legends', '''
      <defs>
        <path id="league-l" d="M190 160H250L242 180V321H337L324 365H190L205 336V189Z"/>
        <mask id="league-ring-gap" maskUnits="userSpaceOnUse" x="100" y="130" width="300" height="270">
          <rect x="100" y="130" width="300" height="270" fill="white"/>
          <use href="#league-l" fill="black" stroke="black" stroke-width="14" stroke-linejoin="miter"/>
        </mask>
      </defs>
      <circle cx="256" cy="269" r="89" fill="none" stroke="#E35205" stroke-width="14" mask="url(#league-ring-gap)"/>
      <use href="#league-l"/>
    '''),
    'discord': ('Discord', '''
      <path fill-rule="evenodd" d="M200 202Q217 195 234 194L241 207Q256 204 271 207L278 194Q295 195 312 202
        C336 235 351 274 354 315Q330 335 302 344L290 323Q301 319 311 313L307 308
        Q256 334 205 308L201 313Q211 319 222 323L210 344Q182 335 158 315
        C161 274 176 235 200 202Z
        M212 273C212 287 221 297 231 297C241 297 250 287 250 273C250 259 241 249 231 249C221 249 212 259 212 273Z
        M262 273C262 287 271 297 281 297C291 297 300 287 300 273C300 259 291 249 281 249C271 249 262 259 262 273Z"/>
    '''),
}

def svg(name, label, artwork):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 512 512" role="img" aria-labelledby="title desc">
  <title id="title">EGC — {escape(label)}</title>
  <desc id="desc">{escape(label)} emblem in EGC orange, framed by the original logo's upper half-star and a simple tapered underline. Transparent background.</desc>
  <g fill="{ORANGE}">{FRAME}<g transform="translate(33.28 72) scale(.87)">{artwork}</g></g>
</svg>
'''

def main():
    for name, (label, artwork) in ART.items():
        (ROOT / f'{name}.svg').write_text(svg(name, label, artwork), encoding='utf-8')
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1024, 'height': 1024}, device_scale_factor=1)
        for name in ART:
            content = (ROOT / f'{name}.svg').read_text(encoding='utf-8')
            page.set_content('<html><body style="margin:0;background:transparent">' + content + '</body></html>')
            page.locator('svg').screenshot(path=str(ROOT / f'{name}.png'), omit_background=True)
        browser.close()

    board = Image.new('RGB', (400 * len(ART), 650), '#0E0E10')
    draw = ImageDraw.Draw(board)
    font_path = Path('C:/Windows/Fonts/seguisb.ttf')
    title = ImageFont.truetype(str(font_path), 32)
    label_font = ImageFont.truetype(str(font_path), 21)
    small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 17)
    draw.text((52, 40), 'EGC / ICONS', font=title, fill='#F5F3EF')
    draw.text((52, 90), 'Brand orange  #E35205   /   Angular emblems', font=small, fill='#909096')
    for index, (name, (label, _)) in enumerate(ART.items()):
        icon = Image.open(ROOT / f'{name}.png').convert('RGBA')
        assert icon.size == (1024, 1024)
        assert icon.getpixel((0, 0))[3] == 0
        icon.thumbnail((360, 360), Image.Resampling.LANCZOS)
        x = 20 + index * 400
        board.paste(icon, (x, 155), icon)
        draw.text((x + 180, 546), label.upper(), font=label_font, fill='#F5F3EF', anchor='mt')
    board.save(ROOT / 'preview.png')
    print(f'Created {len(ART)} SVGs, {len(ART)} transparent 1024px PNGs and preview.png')

if __name__ == '__main__':
    main()
