from pathlib import Path
import re
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent
svg = (root.parents[1] / 'Branding/svg/cropped/Untitled (15).svg').read_text(encoding='utf-8')
svg = re.sub(r'width="1536.000000pt" height="1024.000000pt"', 'width="1800" height="744"', svg)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width':1800,'height':744}, device_scale_factor=1)
    page.set_content('<html><body style="margin:0;background:transparent">'+svg+'</body></html>')
    page.locator('svg').screenshot(path=str(root / 'assets/full-logo.png'), omit_background=True)
    browser.close()
