#!/usr/bin/env python3
"""Audit current Practice evidence density after Core-100 publication."""
from __future__ import annotations
import argparse, json
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]; CONTENT=ROOT/'content'; GUIDES=CONTENT/'guides'; INVENTORY=CONTENT/'ai-knowledge-inventory-v1.0'
PLAN=GUIDES/'coverage-plan-v1.0.json'; PRODUCTION=CONTENT/'ai-content-production-v1.0.json'; RECON=CONTENT/'practice-evidence-reconciliation-v1.0.json'; RUNTIME=ROOT/'web'/'runtime-experiences.json'
def load(p): return json.loads(p.read_text(encoding='utf-8'))
def pct(n,d): return f"{(n/d*100) if d else 0:.1f}%"

def guides():
    out=[]
    for p in sorted(GUIDES.glob('core-*.en.json')): out.extend(load(p).get('guides',[]))
    return out

def inventory():
    concepts=set(); paths=[]
    for p in sorted(INVENTORY.glob('*.json')):
        x=load(p); concepts.update(c['id'] for c in x.get('concepts',[]))
        for item in x.get('paths',[]):
            ids={cid for m in item.get('milestones',[]) for cid in m.get('conceptIds',[])}
            paths.append({'id':item['id'],'title':item['en'],'conceptIds':ids})
    return concepts,paths

def public_route(eid,routes):
    suffix=f'/{eid}/'; matches=sorted(r for r in routes if f'/{r}'.endswith(suffix)); return matches[0] if matches else None

def validate_reconciliation(prod,recon,concepts,path_ids,runtime_ids,routes):
    errors=[]; prod_ids={x['id'] for x in prod}; seen=set()
    policy=recon.get('policy',{})
    if recon.get('version')!='1.0.0': errors.append('Practice evidence reconciliation version drifted')
    if policy.get('productionPlanRemainsCanonicalForWaves') is not True: errors.append('Reconciliation must preserve production waves')
    if policy.get('runtimeSemanticsChanged') is not False: errors.append('Reconciliation must not change runtime semantics')
    if policy.get('evidenceMustBeEarnedByInteraction') is not True: errors.append('Reconciliation evidence must be interaction-earned')
    if policy.get('billingActivation') is not False or policy.get('freeChoiceActivation') is not False: errors.append('Reconciliation must keep monetization dormant')
    for e in recon.get('augmentations',[]):
        eid=e.get('experienceId'); ids=set(e.get('addConceptIds',[]))
        if eid in seen: errors.append(f'Duplicate reconciliation entry: {eid}')
        seen.add(eid)
        if eid not in prod_ids: errors.append(f'Augmentation must target production Experience: {eid}')
        if eid not in runtime_ids: errors.append(f'Augmentation has no runtime: {eid}')
        if not public_route(eid,routes): errors.append(f'Augmentation has no public route: {eid}')
        if not ids or ids-concepts: errors.append(f'Augmentation Concept evidence invalid: {eid} -> {sorted(ids-concepts)}')
        if not e.get('rationale'): errors.append(f'Augmentation needs rationale: {eid}')
        for src in e.get('evidenceSources',[]):
            if not (ROOT/src).is_file(): errors.append(f'Missing reconciliation evidence source: {src}')
    for e in recon.get('referencePractices',[]):
        eid=e.get('experienceId'); pids=set(e.get('pathIds',[])); cids=set(e.get('conceptIds',[]))
        if eid in seen: errors.append(f'Duplicate reconciliation entry: {eid}')
        seen.add(eid)
        if eid in prod_ids: errors.append(f'Reference Practice must remain outside production waves: {eid}')
        if eid not in runtime_ids: errors.append(f'Reference Practice has no runtime: {eid}')
        if not public_route(eid,routes): errors.append(f'Reference Practice has no public route: {eid}')
        if not pids or pids-path_ids: errors.append(f'Reference Practice Path evidence invalid: {eid} -> {sorted(pids-path_ids)}')
        if not cids or cids-concepts: errors.append(f'Reference Practice Concept evidence invalid: {eid} -> {sorted(cids-concepts)}')
        if not e.get('rationale'): errors.append(f'Reference Practice needs rationale: {eid}')
        for src in e.get('evidenceSources',[]):
            if not (ROOT/src).is_file(): errors.append(f'Missing reconciliation evidence source: {src}')
    return errors

def compose(prod,recon):
    out=deepcopy(prod); by={x['id']:x for x in out}
    for e in recon.get('augmentations',[]):
        t=by[e['experienceId']]; t['conceptIds']=list(dict.fromkeys([*t.get('conceptIds',[]),*e['addConceptIds']]))
    for e in recon.get('referencePractices',[]): out.append({'id':e['experienceId'],'nodeType':e['nodeType'],'pathIds':e['pathIds'],'conceptIds':e['conceptIds'],'status':'EXISTING_REFERENCE'})
    return out

def density(exps,guide_ids,paths,wave):
    globally={cid for e in exps for cid in e.get('conceptIds',[])}
    gm=em=pm=wm=we=0; rows=[]
    for p in paths:
        guided=p['conceptIds']&guide_ids; px=[e for e in exps if p['id'] in e.get('pathIds',[])]; explicit={cid for e in px for cid in e.get('conceptIds',[])}; practiced=guided&explicit; wh=p['conceptIds']&wave
        gm+=len(guided); em+=len(practiced); pm+=len(px); wm+=len(wh); we+=len(wh&explicit)
        rows.append({'id':p['id'],'title':p['title'],'guidedConcepts':len(guided),'practiceEvidenceSources':len(px),'explicitlyPracticedGuidedConcepts':len(practiced),'explicitPracticeRatio':len(practiced)/len(guided) if guided else 0,'explicitPracticeGaps':sorted(guided-practiced)})
    return {'experienceCount':len(exps),'pathMemberships':pm,'pathReach':sum(r['practiceEvidenceSources']>0 for r in rows),'guideConceptsExplicitlyCovered':len(guide_ids&globally),'guidedPathConceptMemberships':gm,'samePathExplicitPracticeMemberships':em,'samePathExplicitPracticeCoverage':em/gm,'wavePathConceptMemberships':wm,'waveSamePathExplicitPracticeMemberships':we,'waveSamePathExplicitPracticeCoverage':we/wm,'perPath':sorted(rows,key=lambda r:(r['explicitPracticeRatio'],-r['guidedConcepts'],r['title']))}

def audit():
    gs=guides(); concepts,paths=inventory(); prod_doc=load(PRODUCTION); prod=[e for e in prod_doc['experiences'] if e.get('status')=='EXISTING']; recon=load(RECON); plan=load(PLAN); routes=set(load(CONTENT/'en.json')['availableRoutes']); runtime_ids=set(load(RUNTIME)['experiences'])
    validation=validate_reconciliation(prod,recon,concepts,{p['id'] for p in paths},runtime_ids,routes); evidence=compose(prod,recon); guide_ids={g['conceptId'] for g in gs}; linked=[g for g in gs if g.get('practice')]
    invalid=[{'slug':g['slug'],'href':g['practice']['href']} for g in linked if g['practice']['href'].strip('/')+'/' not in routes]
    target_counts=Counter(g['practice']['href'].strip('/').split('/')[-1] for g in linked)
    wave=set(plan['core100Additions'])
    return {'publishedGuideCount':len(gs),'guidesWithPracticeLink':len(linked),'uniqueGuidePracticeTargets':len(target_counts),'guidePracticeTargetReuse':dict(target_counts.most_common()),'invalidGuidePracticeLinks':invalid,'productionExperienceTypeCounts':dict(sorted(Counter(e['nodeType'] for e in prod).items())),'reconciliationValidationErrors':validation,'productionOnly':density(prod,guide_ids,paths,wave),'reconciled':density(evidence,guide_ids,paths,wave),'monetization':{'billingActivation':prod_doc['principles']['billingActivation'],'freeChoiceActivation':prod_doc['principles']['freeChoiceActivation']}}

def check(a):
    errors=list(a['reconciliationValidationErrors']); p=a['productionOnly']; r=a['reconciled']; types={'BUILD':6,'INCIDENT':3,'LAB':3,'MISSION':4,'PLAYGROUND':1}
    tests=[(a['publishedGuideCount']==100,f"Expected 100 published Guides, got {a['publishedGuideCount']}"),(a['guidesWithPracticeLink']==100,f"Expected 100 Guides with Practice links, got {a['guidesWithPracticeLink']}"),(not a['invalidGuidePracticeLinks'],f"Invalid Guide Practice links: {a['invalidGuidePracticeLinks']}"),(p['experienceCount']==17,f"Expected 17 production Experiences, got {p['experienceCount']}"),(a['productionExperienceTypeCounts']==types,f"Production type distribution drifted: {a['productionExperienceTypeCounts']}"),(p['pathMemberships']==19 and p['pathReach']==15,'Production Practice plan must remain 19 memberships across 15 Paths'),(r['experienceCount']==21 and r['pathMemberships']==25 and r['pathReach']==15,'Reconciled evidence must remain 21 Practices / 25 memberships / 15 Paths'),(r['guideConceptsExplicitlyCovered']==70,f"Expected 70/100 Guide Concepts with reconciled Practice evidence, got {r['guideConceptsExplicitlyCovered']}"),(r['guidedPathConceptMemberships']==163,f"Expected 163 guided Path-Concept memberships, got {r['guidedPathConceptMemberships']}"),(r['samePathExplicitPracticeMemberships']==86,f"Expected 86/163 same-Path explicit Practice memberships, got {r['samePathExplicitPracticeMemberships']}"),(r['wavePathConceptMemberships']==20,f"Expected 20 Core-100 addition memberships, got {r['wavePathConceptMemberships']}"),(r['waveSamePathExplicitPracticeMemberships']==14,f"Expected 14/20 Core-100 additions with explicit same-Path Practice evidence, got {r['waveSamePathExplicitPracticeMemberships']}"),(a['monetization']['billingActivation'] is False and a['monetization']['freeChoiceActivation'] is False,'Practice audit must not activate monetization')]
    errors.extend(msg for ok,msg in tests if not ok); return errors

def report(a):
    p=a['productionOnly']; r=a['reconciled']; print('Practice Density Audit — Core-100 publication'); print(f"Guide links: {a['guidesWithPracticeLink']}/{a['publishedGuideCount']} | unique targets {a['uniqueGuidePracticeTargets']}"); print(f"Production-only: {p['guideConceptsExplicitlyCovered']}/100 Guide Concepts | same-Path {p['samePathExplicitPracticeMemberships']}/163 ({pct(p['samePathExplicitPracticeMemberships'],163)}) | Core-100 {p['waveSamePathExplicitPracticeMemberships']}/20"); print(f"Reconciled: {r['guideConceptsExplicitlyCovered']}/100 Guide Concepts | same-Path {r['samePathExplicitPracticeMemberships']}/163 ({pct(r['samePathExplicitPracticeMemberships'],163)}) | Core-100 {r['waveSamePathExplicitPracticeMemberships']}/20 ({pct(r['waveSamePathExplicitPracticeMemberships'],20)})"); print(); print('| Path | Guided | Explicitly practiced | Coverage |'); print('| --- | ---: | ---: | ---: |');
    for row in r['perPath']: print(f"| {row['title']} | {row['guidedConcepts']} | {row['explicitlyPracticedGuidedConcepts']} | {pct(row['explicitlyPracticedGuidedConcepts'],row['guidedConcepts'])} |")

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--json',action='store_true'); ap.add_argument('--check',action='store_true'); args=ap.parse_args(); a=audit(); errors=check(a) if args.check else []
    if args.json: print(json.dumps({**a,'errors':errors},ensure_ascii=False,indent=2))
    else:
        report(a)
        for e in errors: print(f'ERROR: {e}')
    return 1 if errors else 0
if __name__=='__main__': raise SystemExit(main())
