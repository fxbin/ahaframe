from pathlib import Path
import json
import re
import subprocess
import sys
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'

required_assets=['validation-context.js','validation-ui.js','app.js']
for name in required_assets:
    path=SITE/'assets'/name
    if not path.exists():
        raise SystemExit(f'missing validation asset: {name}')

config=(SITE/'assets/config.js').read_text(encoding='utf-8').strip()
match=re.fullmatch(r'window\.AHAFRAME_CONFIG = (\{.*\});',config)
if not match:
    raise SystemExit('config.js is not a valid AHAFRAME_CONFIG assignment')
parsed=json.loads(match.group(1))
for key in ['analyticsEndpoint','waitlistEndpoint','feedbackEndpoint']:
    if key not in parsed:
        raise SystemExit(f'config.js missing {key}')

landing=SITE/'en/index.html'
landing_source=landing.read_text(encoding='utf-8')
landing_soup=BeautifulSoup(landing_source,'html.parser')
landing_scripts=[node.get('src') for node in landing_soup.find_all('script',src=True)]
landing_expected=['/assets/config.js','/assets/validation-context.js','/assets/app.js','/assets/home.js']
for item in landing_expected:
    if item not in landing_scripts:
        raise SystemExit(f'{landing.relative_to(SITE)} missing {item}')
for item in ['/assets/validation-ui.js','/assets/lab-engine.js','/assets/lab-scenarios.js']:
    if item in landing_scripts:
        raise SystemExit(f'{landing.relative_to(SITE)} eagerly loads {item}')
if 'data-ahaframe-feedback-bootstrap' not in landing_source or "script.src='/assets/validation-ui.js'" not in landing_source:
    raise SystemExit(f'{landing.relative_to(SITE)} missing lazy product feedback bootstrap')
if 'mailto:support@ahaframe.com' not in landing_source:
    raise SystemExit(f'{landing.relative_to(SITE)} missing support contact surface')

pages=[SITE/'en/pricing/index.html',SITE/'en/early-access/index.html']
pages+=sorted((SITE/'en/labs').glob('*/index.html'))
pages+=sorted((SITE/'en/build').glob('*/index.html'))
for page in pages:
    soup=BeautifulSoup(page.read_text(encoding='utf-8'),'html.parser')
    scripts=[node.get('src') for node in soup.find_all('script',src=True)]
    expected=['/assets/config.js','/assets/validation-context.js','/assets/app.js','/assets/validation-ui.js','/assets/lab-engine.js','/assets/lab-scenarios.js']
    for item in expected:
        if item not in scripts:
            raise SystemExit(f'{page.relative_to(SITE)} missing {item}')
    indexes=[scripts.index(item) for item in expected]
    if indexes!=sorted(indexes):
        raise SystemExit(f'{page.relative_to(SITE)} has invalid validation/runtime script order: {scripts}')

context_source=(SITE/'assets/validation-context.js').read_text(encoding='utf-8')
for token in ['anonymousUserId','sessionId','returnVisit','firstUtmSource','feedbackEndpoint','strongAha','buildProductFeedbackPayload','submitProductFeedback','ahaframe_product_feedback_v1','buildWaitlistPayload','submitWaitlist']:
    if token not in context_source:
        raise SystemExit(f'validation-context.js missing {token}')

ui_source=(SITE/'assets/validation-ui.js').read_text(encoding='utf-8')
for event in ['meaningful_interaction','failure_tradeoff_observed','aha_feedback_submitted','second_lab_started','capstone_completed','paid_intent_clicked','product_feedback_opened','product_feedback_submitted']:
    if event not in ui_source:
        raise SystemExit(f'validation-ui.js missing canonical event {event}')
for token in ['data-product-feedback-trigger','productFeedbackDialog','mailto:support@ahaframe.com','Something is broken','Content is confusing','Feature request']:
    if token not in ui_source:
        raise SystemExit(f'validation-ui.js missing product feedback/contact surface token {token}')

app_source=(SITE/'assets/app.js').read_text(encoding='utf-8')
for token in ['schemaVersion','eventId','getValidationContext','waitlist_submitted','waitlist_demo_saved','early_access_viewed','early_access_form_started','early_access_submit_attempt','early_access_submit_success','early_access_submit_error','inFlight','aria-busy']:
    if token not in app_source:
        raise SystemExit(f'app.js missing validation/conversion integration token {token}')

for early_page in [SITE/'en/early-access/index.html',SITE/'zh-cn/early-access/index.html']:
    soup=BeautifulSoup(early_page.read_text(encoding='utf-8'),'html.parser')
    form=soup.select_one('[data-waitlist-form]')
    if not form:
        raise SystemExit(f'{early_page.relative_to(SITE)} missing waitlist form')
    email=form.select_one('input[name="email"][type="email"][required]')
    submit=form.select_one('button[type="submit"]')
    status=soup.select_one('[data-status][role="status"][aria-live="polite"]')
    success=soup.select_one('[data-waitlist-success][hidden]')
    trust=soup.select_one('[data-waitlist-trust]')
    if not all([email,submit,status,success,trust]):
        raise SystemExit(f'{early_page.relative_to(SITE)} missing production Early Access UX contract')
    if 'Demo mode' in trust.get_text(' ',strip=True) or '演示模式' in trust.get_text(' ',strip=True):
        raise SystemExit(f'{early_page.relative_to(SITE)} exposes demo-mode copy in production trust text')

pricing_contracts=[
    (SITE/'en/pricing/index.html',['$39','foundations-39','3 flagship production incidents','1 cross-layer Final Boss','Lifetime access as the Foundations track expands','Separate purchase','Advanced production incident simulations'],['$49','Everything in Foundations','12 interactive engineering labs','3 build projects']),
    (SITE/'zh-cn/pricing/index.html',['$39','foundations-39','3 个旗舰生产事故 Mission','1 个跨层 Final Boss','Foundations 路线持续扩展，已购用户长期访问','需单独购买','高级生产事故模拟'],['$49','包含基础版全部内容','12 个交互式工程实验','3 个 Build 项目']),
]
for pricing_page,required,forbidden in pricing_contracts:
    source=pricing_page.read_text(encoding='utf-8')
    for token in required:
        if token not in source:
            raise SystemExit(f'{pricing_page.relative_to(SITE)} missing pricing contract token {token}')
    for token in forbidden:
        if token in source:
            raise SystemExit(f'{pricing_page.relative_to(SITE)} contains stale pricing contract token {token}')

backend=subprocess.run([sys.executable,str(ROOT/'scripts/test_validation_backend.py')],capture_output=True,text=True)
if backend.returncode:
    raise SystemExit(f'validation backend contract failed\n{backend.stdout}\n{backend.stderr}')

print(f'PASS Validation Build: lean landing validation, {len(pages)} full-runtime generated pages, anonymous context, semantic analytics, production-ready Early Access conversion, Aha feedback, global product feedback/contact UX, the truthful $39 Foundations / separate Production Labs pricing contract, Lab Engine, and the storage backend contract.')
