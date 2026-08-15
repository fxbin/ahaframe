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

pages=[SITE/'en/index.html',SITE/'en/pricing/index.html',SITE/'en/early-access/index.html']
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
for token in ['anonymousUserId','sessionId','returnVisit','firstUtmSource','feedbackEndpoint','strongAha','buildWaitlistPayload','submitWaitlist']:
    if token not in context_source:
        raise SystemExit(f'validation-context.js missing {token}')

ui_source=(SITE/'assets/validation-ui.js').read_text(encoding='utf-8')
for event in ['meaningful_interaction','failure_tradeoff_observed','aha_feedback_submitted','second_lab_started','capstone_completed','paid_intent_clicked']:
    if event not in ui_source:
        raise SystemExit(f'validation-ui.js missing canonical event {event}')

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

backend=subprocess.run([sys.executable,str(ROOT/'scripts/test_validation_backend.py')],capture_output=True,text=True)
if backend.returncode:
    raise SystemExit(f'validation backend contract failed\n{backend.stdout}\n{backend.stderr}')

print(f'PASS Validation Build: {len(pages)} generated pages load anonymous context, semantic analytics, production-ready Early Access conversion, Aha feedback, Lab Engine, and the storage backend contract.')
