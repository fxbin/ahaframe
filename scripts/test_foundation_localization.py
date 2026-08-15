from __future__ import annotations

from pathlib import Path
import json
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'

EXPECTED_ADAPTER={
    'token-playground':'/assets/token.js',
    'context-window':'/assets/context.js',
    'agent-loop':'/assets/agent.js',
}


def load(locale: str, slug: str):
    path=SITE/('en' if locale=='en' else 'zh-cn')/'lessons'/slug/'index.html'
    assert path.exists(), f'missing localized lesson: {path.relative_to(SITE)}'
    return BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')


def main():
    assert not list((SITE/'assets').glob('*-zh.js')), 'locale-specific JS adapters are forbidden'
    assert not list((SITE/'assets').glob('*.zh.js')), 'locale-specific JS adapters are forbidden'

    for slug,adapter in EXPECTED_ADAPTER.items():
        en=load('en',slug)
        zh=load('zh-CN',slug)
        assert en.html.get('lang')=='en'
        assert zh.html.get('lang')=='zh-CN'

        en_scripts=[node.get('src') for node in en.find_all('script',src=True)]
        zh_scripts=[node.get('src') for node in zh.find_all('script',src=True)]
        for required in ('/assets/lab-engine.js','/assets/lab-scenarios.js',adapter):
            assert required in en_scripts, (slug,'en',required)
            assert required in zh_scripts, (slug,'zh-CN',required)
        assert en_scripts==zh_scripts, f'{slug}: locale pages must use the same runtime/adapters'

        en_canonical=en.find('link',rel='canonical')['href']
        zh_canonical=zh.find('link',rel='canonical')['href']
        assert f'/en/lessons/{slug}/' in en_canonical
        assert f'/zh-cn/lessons/{slug}/' in zh_canonical

        zh_text=zh.get_text(' ',strip=True)
        cjk=sum('\u3400'<=ch<='\u9fff' for ch in zh_text)
        assert cjk>=200, f'{slug}: zh-CN copy is unexpectedly thin ({cjk} CJK chars)'

    context=load('zh-CN','context-window').select_one('[data-context-copy]')
    assert context is not None
    context_copy=json.loads(context['data-context-copy'])
    assert set(context_copy)=={'drop','summarize','rag','memory'}
    assert all(value.strip() for value in context_copy.values())

    agent=load('zh-CN','agent-loop').select_one('[data-agent-copy]')
    assert agent is not None
    agent_copy=json.loads(agent['data-agent-copy'])
    assert len(agent_copy['status'])==6
    assert agent_copy['errorStatus'].strip()
    assert agent_copy['waiting'].strip()
    assert agent_copy['result'].strip()

    # Internal semantic names remain locale-neutral: localized content changes
    # labels, not analytics or Lab scenario identity.
    for asset in ('token.js','context.js','agent.js'):
        text=(SITE/'assets'/asset).read_text(encoding='utf-8')
        assert '_zh' not in text and '-zh' not in text
    assert "createLab('token-playground')" in (SITE/'assets'/'token.js').read_text(encoding='utf-8')
    assert "createLab('context-window')" in (SITE/'assets'/'context.js').read_text(encoding='utf-8')
    assert "createLab('agent-loop')" in (SITE/'assets'/'agent.js').read_text(encoding='utf-8')

    print('PASS: en/zh-CN Foundation lessons share one Lab runtime, one adapter per lesson, valid localized adapter copy, and stable scenario IDs.')


if __name__=='__main__':
    main()
