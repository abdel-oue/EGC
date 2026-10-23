import urllib.request
import re
import zipfile
import io
from pathlib import Path
from html import unescape

base = Path(__file__).resolve().parent / 'assets'
base.mkdir(exist_ok=True)
h = urllib.request.urlopen('https://www.riotgames.com/en/press').read().decode()
links = re.findall(r'href="([^"]+valorant[^" ]+\.zip)"', h)
print(links)
u = unescape(links[0])
if u.startswith('/'):
    u = 'https://www.riotgames.com' + u
z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(u).read()))
print(z.namelist())
z.extractall(base / 'riot')
