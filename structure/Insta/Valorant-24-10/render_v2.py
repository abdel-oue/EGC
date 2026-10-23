"""Balanced charcoal/stone revision, using Riot's supplied wordmark and symbol."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps, ImageEnhance
from render import font, text, BASE, ASSETS, BG, INK, ORANGE

RIOT = BASE / 'assets/riot/VALORANT Logos'


def asset(im, path, xy, width, color=None):
    a = Image.open(path).convert('RGBA')
    a = a.crop(a.getchannel('A').getbbox())
    if color:
        alpha = a.getchannel('A')
        a = Image.new('RGBA', a.size, color)
        a.putalpha(alpha)
    a = a.resize((width, round(a.height * width / a.width)), Image.Resampling.LANCZOS)
    im.paste(a, xy, a)
    return a.height


def arena(im, box):
    x, y, w, h = box
    a = ImageOps.fit(Image.open(BASE / 'arena-white.png').convert('RGB'), (w, h), method=Image.Resampling.LANCZOS)
    a = ImageEnhance.Color(a).enhance(.65)
    a = ImageEnhance.Brightness(a).enhance(.79)
    im.paste(a, (x,y))


def render(story=False):
    w,h = (900,1600) if story else (1600,900)
    im = Image.new('RGB',(w,h),BG)
    d=ImageDraw.Draw(im)
    m=58 if story else 72
    # The full club lockup stays crisp; Riot's standalone symbol balances it.
    asset(im,ASSETS/'full-logo.png',(m,36 if story else 22),320 if story else 265,INK)
    asset(im,RIOT/'Logomark/V_Logomark_Black.png',(w-m-88,52 if story else 35),88)
    if story:
        d.polygon([(0,198),(842,198),(900,256),(900,544),(0,544)],fill=INK)
        d.line((m,242,m+58,242),fill=ORANGE,width=4)
        text(d,'TOURNOI',(m,273),54,BG,True)
        asset(im,RIOT/'Logotype/V_Logotype_Off-White.png',(m,365),784)
        text(d,'SKIRMISH 2V2',(m,493),30,BG,True)
        arena(im,(0,554,900,540))
        # Angular white corner cuts borrow the game's visual structure.
        d=ImageDraw.Draw(im)
        d.polygon([(0,554),(42,554),(0,596)],fill=BG)
        d.polygon([(900,1052),(900,1094),(858,1094)],fill=BG)
        d.rectangle((0,1094,900,1600),fill=INK)
        d.line((m,1152,w-m,1152),fill='#41454A',width=2)
        text(d,'FORMEZ VOTRE DUO',(m,1190),40,BG,True)
        text(d,'ET REJOIGNEZ LE TOURNOI',(m,1244),27,'#BFC0C2')
        d.ellipse((m,1335,m+12,1347),fill=ORANGE)
        text(d,'LIVE TWITCH',(m+30,1325),30,BG,True)
        text(d,'SAMEDI 24/10',(m-2,1396),76,BG,True)
        d.line((m,1518,m+80,1518),fill=ORANGE,width=4)
        text(d,'ESISA GAMING CLUB',(m+100,1508),19,'#BFC0C2')
    else:
        arena(im,(0,151,1600,587))
        d=ImageDraw.Draw(im)
        # Opaque title plate gives the white game wordmark reliable contrast.
        d.polygon([(366,215),(1188,215),(1234,261),(1234,643),(412,643),(366,597)],fill=INK)
        d.line((417,254,477,254),fill=ORANGE,width=4)
        text(d,'TOURNOI',(800,279),58,BG,True,'mt')
        asset(im,RIOT/'Logotype/V_Logotype_Off-White.png',(419,371),762)
        text(d,'SKIRMISH 2V2',(800,519),43,BG,True,'mt')
        text(d,'FORMEZ VOTRE DUO ET REJOIGNEZ',(800,591),22,'#BFC0C2',False,'mt')
        d.rectangle((0,738,1600,900),fill=INK)
        d.line((m,738,w-m,738),fill=ORANGE,width=3)
        d.ellipse((m,806,m+13,819),fill=ORANGE)
        text(d,'LIVE TWITCH',(m+32,794),34,BG,True)
        text(d,'SAMEDI 24/10',(w-m,779),65,BG,True,'rt')
    dest=BASE/('valorant-story-v2.png' if story else 'valorant-landscape-v2.png')
    im.save(dest)
    print(dest)


if __name__=='__main__':
    render()
    render(True)
