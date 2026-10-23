"""Club off-white/stone treatment with an uninterrupted arena and exact marks."""
from PIL import Image, ImageDraw, ImageOps, ImageEnhance
from render import BASE, ASSETS, BG, INK, ORANGE, text
from render_v2 import RIOT, asset


def panel(im, points):
    layer=Image.new('RGBA', im.size)
    d=ImageDraw.Draw(layer)
    d.polygon(points,fill=BG)
    im.alpha_composite(layer)


def render(story=False):
    w,h=(900,1600) if story else (1600,900)
    source=BASE/('arena-portrait-v3.png' if story else 'arena-white.png')
    im=ImageOps.fit(Image.open(source).convert('RGB'),(w,h),method=Image.Resampling.LANCZOS)
    im=ImageEnhance.Color(im).enhance(.64)
    im=ImageEnhance.Brightness(im).enhance(.91)
    im=im.convert('RGBA')
    m=58 if story else 72
    if story:
        panel(im,[(0,0),(900,0),(900,433),(839,494),(0,494)])
        panel(im,[(0,1340),(61,1279),(900,1279),(900,1600),(0,1600)])
    else:
        panel(im,[(0,0),(1600,0),(1600,100),(1555,145),(0,145)])
        panel(im,[(0,810),(45,765),(1600,765),(1600,900),(0,900)])
    d=ImageDraw.Draw(im)
    # Subtle grid and angled linework reflect the existing club posts.
    for x in range(m,w,190):
        d.line((x,0,x,165 if not story else 180),fill='#E6E2DC',width=1)
    asset(im,ASSETS/'full-logo.png',(m,34 if story else 21),310 if story else 270,INK)
    asset(im,RIOT/'Logomark/V_Logomark_Black.png',(w-m-76,51 if story else 40),76)
    if story:
        d=ImageDraw.Draw(im)
        d.line((m,202,w-m,202),fill='#C9C4BB',width=2)
        text(d,'TOURNOI',(m,242),54,INK,True)
        asset(im,RIOT/'Logotype/V_Logotype_Black.png',(m,331),784)
        d=ImageDraw.Draw(im)
        text(d,'SKIRMISH 2V2',(m,451),30,INK,True)
        # Restrained orange marks sit against the darker arena edge.
        d.line((23,532,23,638),fill=ORANGE,width=5)
        d.line((877,1134,877,1240),fill=ORANGE,width=5)
        text(d,'FORMEZ VOTRE DUO ET REJOIGNEZ',(m,1330),27,INK)
        d.line((m,1392,w-m,1392),fill='#C9C4BB',width=2)
        d.rounded_rectangle((m,1421,m+236,1465),radius=0,fill=INK)
        d.ellipse((m+14,1438,m+23,1447),fill=ORANGE)
        text(d,'LIVE TWITCH',(m+35,1433),23,BG,True)
        text(d,'SAMEDI 24/10',(m-2,1491),73,INK,True)
    else:
        d=ImageDraw.Draw(im)
        text(d,'TOURNOI',(800,247),66,INK,True,'mt')
        asset(im,RIOT/'Logotype/V_Logotype_Black.png',(392,351),816)
        d=ImageDraw.Draw(im)
        text(d,'SKIRMISH 2V2',(800,515),49,INK,True,'mt')
        text(d,'FORMEZ VOTRE DUO ET REJOIGNEZ',(800,591),25,INK,False,'mt')
        d.line((m,765,w-m,765),fill='#C9C4BB',width=2)
        d.rectangle((m,786,m+265,837),fill=INK)
        d.ellipse((m+16,807,m+26,817),fill=ORANGE)
        text(d,'LIVE TWITCH',(m+41,801),27,BG,True)
        text(d,'SAMEDI 24/10',(w-m,780),65,INK,True,'rt')
    dest=BASE/('valorant-story-v3.png' if story else 'valorant-landscape-v3.png')
    im.convert('RGB').save(dest)
    print(dest)


if __name__=='__main__':
    render()
    render(True)
