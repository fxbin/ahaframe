from __future__ import annotations

from pathlib import Path
import sys

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
sys.path.insert(0, str(ROOT / 'scripts'))

from ahaframe.i18n import HREFLANG, PUBLIC_ROUTE_RELATIVES, SUPPORTED_LOCALES, equivalent_paths, route_prefix  # noqa: E402


def page_file(locale: str, relative: str) -> Path:
    base = SITE / route_prefix(locale)
    return base / 'index.html' if not relative else base / relative / 'index.html'


def main() -> None:
    for relative in PUBLIC_ROUTE_RELATIVES:
        equivalents = equivalent_paths(f'/en/{relative}')
        for locale in SUPPORTED_LOCALES:
            soup = BeautifulSoup(page_file(locale, relative).read_text(encoding='utf-8'), 'html.parser')

            desktop = soup.select_one('.nav-actions > details.language-switcher')
            assert desktop is not None, (locale, relative, 'desktop language details missing')
            assert desktop.select_one('summary') is not None, (locale, relative, 'desktop summary missing')
            assert desktop.select_one('details') is None, (locale, relative, 'nested details not allowed')

            current = desktop.select_one('[aria-current="page"]')
            assert current is not None, (locale, relative, 'active locale not marked')

            counterpart_locale = 'zh-CN' if locale == 'en' else 'en'
            counterpart = equivalents[counterpart_locale]
            link = desktop.find('a', href=counterpart)
            assert link is not None, (locale, relative, 'desktop counterpart route missing')
            assert link.get('hreflang') == HREFLANG[counterpart_locale]

            mobile = soup.select_one('.mobile-panel .mobile-language-list')
            assert mobile is not None, (locale, relative, 'mobile locale rows missing')
            assert mobile.find('details') is None, (locale, relative, 'mobile must not nest language dropdown')
            mobile_link = mobile.find('a', href=counterpart)
            assert mobile_link is not None, (locale, relative, 'mobile counterpart route missing')
            assert mobile.select_one('[aria-current="page"]') is not None

    css = (SITE / 'assets' / 'styles.css').read_text(encoding='utf-8')
    assert '.language-switcher>summary' in css
    assert '.language-switcher-menu' in css
    assert '.mobile-language-list' in css
    assert '.nav-links,.nav-actions{display:none}' in css

    print('PASS language switcher: desktop native dropdown, equivalent-route links, direct mobile locale rows, and responsive de-duplication.')


if __name__ == '__main__':
    main()
