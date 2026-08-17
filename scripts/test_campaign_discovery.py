from __future__ import annotations

import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
CONTRACT=json.loads((ROOT/'content'/'lab-reconciliation-v0.8.json').read_text(encoding='utf-8'))
EXPECTED_CAMPAIGN=CONTRACT['primaryCampaign']
BY_ID={item['id']:item for item in CONTRACT['experiences']}
EXPECTED_MISSIONS=[BY_ID[item_id]['missionId'] for item_id in EXPECTED_CAMPAIGN]


def localized(route: str,locale: str) -> str:
    assert route.startswith('/en/')
    return route if locale=='en' else '/zh-cn/'+route[len('/en/'):]


def load(locale: str):
    prefix='en' if locale=='en' else 'zh-cn'
    path=SITE/prefix/'index.html'
    assert path.exists(), f'missing homepage: {path}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def main():
    assert EXPECTED_CAMPAIGN==['rag-failure','agent-reliability','instruction-conflict','reliable-support-agent']
    assert len(EXPECTED_MISSIONS)==4

    for locale in ('en','zh-CN'):
        soup=load(locale)
        assert soup.html.get('lang')==locale
        campaign=soup.select_one('#lessons')
        knowledge=soup.select_one('#roadmap')
        assert campaign is not None and knowledge is not None

        impression_nodes=campaign.select('[data-flagship-impression]')
        assert [node.get('data-mission-id') for node in impression_nodes]==EXPECTED_MISSIONS
        assert [int(node.get('data-position')) for node in impression_nodes]==[1,2,3,4]

        hero_cta=soup.select_one('.hero [data-flagship-cta][data-source="hero"]')
        assert hero_cta is not None
        assert hero_cta.get('data-mission-id')==EXPECTED_MISSIONS[0]
        assert hero_cta.get('href')==localized(BY_ID[EXPECTED_CAMPAIGN[0]]['route'],locale)

        assert soup.select_one('#hero-temperature') is None, 'Token Playground must not remain the homepage primary demo'
        assert soup.select_one('[data-hero-prob]') is None

        knowledge_hrefs=[node.get('href') for node in knowledge.find_all('a',href=True)]
        expected_hrefs=[localized(item['route'],locale) for item in CONTRACT['experiences']]
        assert sorted(knowledge_hrefs)==sorted(expected_hrefs), (
            locale,
            'Knowledge Map must expose each retained experience exactly once',
            knowledge_hrefs,
        )

        nav=[node.get_text(' ',strip=True) for node in soup.select('.nav-links a')]
        assert ('Campaign' in nav), (locale,nav)
        assert ('Knowledge Map' in nav if locale=='en' else '知识地图' in nav), (locale,nav)

        alpha=soup.find('a',href=localized('/en/early-access/',locale)+'?intent=validation-alpha')
        assert alpha is not None

        item_lists=[]
        for node in soup.find_all('script',attrs={'type':'application/ld+json'}):
            data=json.loads(node.string or '{}')
            if data.get('@type')=='ItemList': item_lists.append(data)
        assert len(item_lists)==1
        assert [item['name'] for item in item_lists[0]['itemListElement']]
        assert [item['position'] for item in item_lists[0]['itemListElement']]==[1,2,3,4]
        assert [item['url'].replace('https://ahaframe.com','') for item in item_lists[0]['itemListElement']]==[
            localized(BY_ID[item_id]['route'],locale) for item_id in EXPECTED_CAMPAIGN
        ]

    llms=(SITE/'llms.txt').read_text(encoding='utf-8')
    assert llms.startswith('# AhaFrame\n\n> '), 'llms.txt must start with the required H1 and summary blockquote'
    bullet_lines=[line for line in llms.splitlines() if line.startswith('- ')]
    markdown_link_pattern=re.compile(r'^- \[[^\]\n]+\]\(https?://[^)\s]+\): .+$')
    assert len(bullet_lines)>=20, 'llms.txt should expose a useful curated set of discovery links'
    assert all(markdown_link_pattern.match(line) for line in bullet_lines), 'every llms.txt bullet must be a Markdown link with a description'
    assert not re.search(r'^- https?://',llms,flags=re.M), 'llms.txt must not regress to bare URL bullets'
    for required in [
        '/en/labs/rag-failure/',
        '/en/labs/agent-reliability/',
        '/en/labs/instruction-conflict/',
        '/en/build/reliable-support-agent/',
        '/zh-cn/labs/rag-failure/',
        '/en/pricing/',
        '/en/early-access/',
    ]:
        assert required in llms, f'llms.txt missing discovery route {required}'

    runtime=(ROOT/'src'/'assets'/'home.js').read_text(encoding='utf-8')
    assert "homepage_flagship_impression" in runtime
    assert "homepage_flagship_click" in runtime
    assert "campaignVersion:'0.8'" in runtime
    assert 'hero_temperature_changed' not in runtime and 'hero_sampling_changed' not in runtime

    css=(ROOT/'src'/'styles'/'responsive.css').read_text(encoding='utf-8')
    assert '.campaign-grid{grid-template-columns:1fr!important}' in css
    assert '.campaign-boss{grid-template-columns:1fr;display:grid}' in css

    print('PASS Campaign discovery: contract-driven 4-step Mission path, direct Hero incident entry, 10-item Knowledge Map, llms.txt Markdown discovery links, locale parity, mobile layout, and decision-useful flagship analytics.')


if __name__=='__main__':
    main()
