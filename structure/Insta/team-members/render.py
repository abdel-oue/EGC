"""Render configurable white-theme carousel slides using Pillow.

Usage: python Insta/team-members/render.py --config Insta/team-members/content.json
Paths in the JSON are relative to that JSON file, not the working directory.
"""
import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

SIZE = (1080, 1350)


class Carousel:
    def __init__(self, config_path):
        self.base = config_path.resolve().parent
        self.config = json.loads(config_path.read_text(encoding='utf-8'))
        self.theme = self.config['theme']
        self.assets = self.config['assets']
        self.output = self.path(self.config.get('output_dir', 'white'))
        self.output.mkdir(parents=True, exist_ok=True)
        self.logo = Image.open(self.path(self.assets['logo'])).convert('RGBA')
        bounds = self.logo.getchannel('A').getbbox()
        if not bounds:
            raise ValueError('Logo is empty')
        self.logo = self.logo.crop(bounds)

    def path(self, value):
        return (self.base / value).resolve()

    def font(self, size, headline=False):
        key = 'headline_font' if headline else 'body_font'
        font = ImageFont.truetype(str(self.path(self.assets[key])), size)
        try:
            axes = font.get_variation_axes()
            values = [700 if b'weight' in axis['name'].lower() and headline
                      else 500 if b'weight' in axis['name'].lower()
                      else axis['default'] for axis in axes]
            font.set_variation_by_axes(values)
        except OSError:
            pass  # Static fonts can be substituted in content.json.
        return font

    def text(self, value, x, y, size, width, headline=False, color=None,
             max_lines=1, min_size=16, line_spacing=1.08, align='left'):
        """Wrap and shrink text to a bounded block; fail instead of clipping."""
        if not value:
            return y
        value = str(value)
        for candidate in range(size, min_size - 1, -1):
            font = self.font(candidate, headline)
            lines = []
            for paragraph in value.split('\n'):
                current = ''
                for word in paragraph.split():
                    proposed = (current + ' ' + word).strip()
                    if current and self.draw.textlength(proposed, font=font) > width:
                        lines.append(current)
                        current = word
                    else:
                        current = proposed
                lines.append(current)
            if len(lines) <= max_lines and all(self.draw.textlength(line, font=font) <= width for line in lines):
                for line in lines:
                    left = x + (width - self.draw.textlength(line, font=font)) / 2 if align == 'center' else x
                    self.draw.text((left, y), line, font=font, fill=color or self.theme['text'], anchor='lt')
                    y += round(candidate * line_spacing)
                return y
        raise ValueError(f'Text is too long for its block: {value!r}')

    def background(self, kind):
        value = self.assets['backgrounds'].get(kind)
        if value:
            return ImageOps.fit(Image.open(self.path(value)).convert('RGB'), SIZE, method=Image.Resampling.LANCZOS)
        return Image.new('RGB', SIZE, self.theme['background'])

    def chrome(self, index, count):
        logo = self.logo.copy()
        logo.thumbnail((self.config.get('logo_width', 285), 140), Image.Resampling.LANCZOS)
        self.image.paste(logo, (80, 65), logo)
        self.draw.text((1000, 86), f'{index:02} / {count:02}', font=self.font(24), fill=self.theme['accent'], anchor='rt')
        accent = self.theme['accent']
        self.draw.line([(80, 1240), (725, 1240), (742, 1226), (1000, 1226)], fill=accent, width=2)
        self.text(self.config.get('footer', 'ESISA GAMING CLUB'), 80, 1270, 18, 480)

    def portrait(self, photo, box, offset_y=0):
        x, y, width, height = box
        cut = 34
        polygon = [(0, 0), (width - 1, 0), (width - 1, height - cut),
                   (width - cut, height - 1), (0, height - 1)]
        mask = Image.new('L', (width, height))
        ImageDraw.Draw(mask).polygon(polygon, fill=255)
        image = self.image.crop((x, y, x + width, y + height))
        if photo and self.path(photo).is_file():
            with Image.open(self.path(photo)) as source:
                source = ImageOps.exif_transpose(source).convert('RGBA')
                scale = max(width / source.width, height / source.height)
                overflow = max(0, source.height * scale - height)
                # Positive offsets move the person down, while keeping the frame filled.
                center_y = max(0, min(1, 0.35 - offset_y / overflow)) if overflow else 0.35
                portrait = ImageOps.fit(source, (width, height),
                                     method=Image.Resampling.LANCZOS, centering=(0.5, center_y))
                image.paste(portrait, (0, 0), portrait)
        elif photo:
            print(f'Photo pending: {photo}')
        self.image.paste(image, (x, y), mask)
        points = [(x + px, y + py) for px, py in polygon]
        self.draw.line(points + [points[0]], fill=self.theme['border'], width=2)
        self.draw.line([(x - 7, y + 28), (x - 7, y - 7), (x + 28, y - 7)], fill=self.theme['accent'], width=3)

    def cover(self, slide):
        end = self.text(slide['title'], 80, 290, 148, 920, True, max_lines=2, min_size=70)
        self.text(slide.get('subtitle'), 80, end + 24, 34, 900, max_lines=3, min_size=26)
        self.draw.text((1000, 1270), slide.get('swipe', 'DÉCOUVRE LA TEAM →'), font=self.font(18),
                       fill=self.theme['accent'], anchor='rt')

    def member(self, slide):
        end = self.text(slide.get('title', 'MEMBRE DE LA TEAM'), 80, 235, 72, 920, True,
                        max_lines=2, min_size=40, align='center')
        person = slide.get('member', {})
        top = end + 28
        width = self.config.get('member_photo_width', 760)
        height = self.config.get('member_photo_height', 580)
        self.portrait(person.get('photo'), ((SIZE[0] - width) // 2, top, width, height),
                      person.get('photo_offset_y', 0))
        bottom = top + height
        self.draw.line([(468, bottom + 26), (612, bottom + 26)], fill=self.theme['accent'], width=3)
        self.text(person.get('name'), 100, bottom + 50, 48, 880, True, min_size=24, align='center')
        self.text(person.get('role'), 100, bottom + 120, 27, 880, max_lines=2, min_size=18, align='center')

    def group(self, slide):
        end = self.text(slide.get('title', 'UNE MÊME ÉQUIPE.'), 80, 235, 72, 920, True,
                        max_lines=2, min_size=40, align='center')
        roster = {item['id']: item['member'] for item in self.config['slides'] if item['type'] == 'member'}
        members = [roster[item] if isinstance(item, str) else item for item in slide.get('members', [])]
        if len(members) > 10:
            raise ValueError('Group slides support up to ten members.')
        if len(members) > 4:
            width, height, gap, row_height = 210, 170, 26, 286
            for start in range(0, len(members), 4):
                row = members[start:start + 4]
                left = (SIZE[0] - len(row) * width - (len(row) - 1) * gap) // 2
                y = end + 28 + (start // 4) * row_height
                for column, member in enumerate(row):
                    x = left + column * (width + gap)
                    offset = member.get('photo_offset_y', 0) * width / self.config.get('member_photo_width', 760)
                    self.portrait(member.get('photo'), (x, y, width, height), offset)
                    self.text(member.get('name'), x, y + 184, 22, width, True,
                              max_lines=2, min_size=18, align='center')
                    if slide.get('show_roles', True):
                        self.text(member.get('role'), x, y + 234, 17, width,
                                  max_lines=3, min_size=16, line_spacing=1, align='center')
            return
        members = members + [{} for _ in range(4 - len(members))]
        for i, member in enumerate(members):
            x, y = 100 + (i % 2) * 460, 430 + (i // 2) * 395
            self.portrait(member.get('photo'), (x, y, 420, 280), member.get('photo_offset_y', 0))
            self.text(member.get('name'), x, y + 297, 28, 420, True, min_size=18)
            if slide.get('show_roles', True):
                self.text(member.get('role'), x, y + 337, 21, 420, max_lines=2, min_size=16)

    def closing(self, slide):
        end = self.text(slide['title'], 80, 330, 104, 860, True, max_lines=4, min_size=58)
        end = self.text(slide.get('subtitle'), 80, end + 38, 34, 830, max_lines=2, min_size=26)
        self.draw.rectangle((80, end + 32, 210, end + 40), fill=self.theme['accent'])
        top = max(960, end + 95)
        if top + 90 > 1195:
            raise ValueError('Closing content is too tall; shorten title or subtitle.')
        self.draw.line([(80, top), (910, top), (910, top + 62), (880, top + 90),
                        (80, top + 90), (80, top)], fill=self.theme['accent'], width=2)
        self.text(slide.get('cta'), 110, top + 30, 28, 750, True, min_size=18)

    def render(self):
        slides = self.config['slides']
        if not slides:
            raise ValueError('Add at least one slide')
        thumbnails = []
        for index, slide in enumerate(slides, 1):
            kind = slide['type']
            if kind not in ('cover', 'member', 'group', 'closing'):
                raise ValueError(f'Unknown slide type: {kind}')
            self.image = self.background(kind)
            self.draw = ImageDraw.Draw(self.image)
            self.chrome(index, len(slides))
            getattr(self, kind)(slide)
            slug = re.sub(r'[^a-zA-Z0-9_-]', '-', slide.get('id', kind))
            target = self.output / f'{index:02}-{slug}.png'
            self.image.save(target)
            thumbnails.append(self.image.resize((270, 338), Image.Resampling.LANCZOS))
            print(target)
        columns = min(4, len(thumbnails))
        rows = (len(thumbnails) + columns - 1) // columns
        preview = Image.new('RGB', (270 * columns, 338 * rows), self.theme['background'])
        for index, thumb in enumerate(thumbnails):
            preview.paste(thumb, (270 * (index % columns), 338 * (index // columns)))
        preview.save(self.output / 'preview.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, default=Path(__file__).with_name('content.json'))
    args = parser.parse_args()
    Carousel(args.config).render()


if __name__ == '__main__':
    main()
