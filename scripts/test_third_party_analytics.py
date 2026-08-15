from __future__ import annotations

from pathlib import Path
import json
import os
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))

from ahaframe.third_party_analytics import (  # noqa: E402
    GA_MARKER,
    VERCEL_MARKER,
    ga4_head_snippet,
    google_analytics_id,
    inject_html_document,
    vercel_body_snippet,
)


def with_env(name:str,value:str|None):
    prior=os.environ.get(name)
    if value is None: os.environ.pop(name,None)
    else: os.environ[name]=value
    return prior


def restore_env(name:str,prior:str|None):
    if prior is None: os.environ.pop(name,None)
    else: os.environ[name]=prior


def test_ga_id_contract():
    prior_next=with_env('NEXT_PUBLIC_GA_MEASUREMENT_ID','g-test123')
    prior_legacy=with_env('AHAFRAME_GA_MEASUREMENT_ID',None)
    try:
        assert google_analytics_id()=='G-TEST123'
        os.environ['NEXT_PUBLIC_GA_MEASUREMENT_ID']='not-valid'
        try:
            google_analytics_id()
        except SystemExit as exc:
            assert 'G-XXXXXXXXXX' in str(exc)
        else:
            raise AssertionError('invalid GA4 ID must fail')
    finally:
        restore_env('NEXT_PUBLIC_GA_MEASUREMENT_ID',prior_next)
        restore_env('AHAFRAME_GA_MEASUREMENT_ID',prior_legacy)


def test_static_injection():
    source='<!doctype html><html><head><title>x</title></head><body><main>x</main></body></html>'
    rendered=inject_html_document(source,enable_vercel=True,measurement_id='G-TEST123')
    assert rendered.count(GA_MARKER)==2
    assert rendered.count(VERCEL_MARKER)==2
    assert 'https://www.googletagmanager.com/gtag/js?id=G-TEST123' in rendered
    assert "gtag('config',\"G-TEST123\")" in rendered
    assert '/_vercel/insights/script.js' in rendered
    assert rendered.index(GA_MARKER)<rendered.index('<title>')
    twice=inject_html_document(rendered,enable_vercel=True,measurement_id='G-TEST123')
    assert twice==rendered,'analytics injection must be idempotent'
    assert not ga4_head_snippet('')
    assert '/_vercel/insights/script.js' in vercel_body_snippet()


def test_generated_public_site():
    homepage=ROOT/'site/en/index.html'
    if not homepage.exists():
        raise AssertionError('build the static site before running analytics integration test')
    source=homepage.read_text(encoding='utf-8')
    assert VERCEL_MARKER in source,'public CI build must contain Vercel Web Analytics'
    assert '/_vercel/insights/script.js' in source


def test_next_migration_contract():
    package=json.loads((ROOT/'web/package.json').read_text(encoding='utf-8'))
    assert package['dependencies'].get('@vercel/analytics')=='^2.0.1'
    component=(ROOT/'web/components/third-party-analytics.tsx').read_text(encoding='utf-8')
    assert '@vercel/analytics/next' in component
    assert '<Analytics />' in component
    assert 'NEXT_PUBLIC_GA_MEASUREMENT_ID' in component
    assert 'googletagmanager.com/gtag/js' in component
    layout=(ROOT/'web/app/layout.tsx').read_text(encoding='utf-8')
    assert '<ThirdPartyAnalytics />' in layout


def main():
    test_ga_id_contract()
    test_static_injection()
    test_generated_public_site()
    test_next_migration_contract()
    print('PASS Traffic Analytics: static Vercel Analytics, GA4 configuration contract, idempotent injection, and Next.js migration integration.')


if __name__=='__main__': main()
