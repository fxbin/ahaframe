'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const asset=(name)=>require(path.join(__dirname,'..','src','assets',name));
asset('lab-engine.js');
asset('decision-experience-scenario.js');
asset('content-wave-1-scenarios.js');
asset('mission-engine.js');
asset('content-wave-1-missions.js');

const AhaFrame=globalThis.AhaFrame;

function start(id){
  const mission=AhaFrame.createMission(id,{clock:()=>123});
  mission.start();
  return mission;
}

function finish(mission,decision='SHIP'){
  mission.readyToDecide();
  mission.submitReleaseDecision(decision);
  mission.complete();
  assert.equal(mission.getMissionState().phase,'COMPLETE');
}

function fingerprint(id,actions){
  const mission=start(id);
  for(const [control,value] of actions)mission.intervene(control,{value});
  const run=mission.runSimulation();
  return {outcome:run.attempt.outcomeCode,state:run.attempt.frame.state,metrics:run.attempt.frame.derived.metrics};
}

// AI Code Review: green existing tests are intentionally insufficient. A viable
// review combines diff inspection, targeted tests, a written scope contract and
// dependency provenance without exhausting the review-time budget.
{
  const mission=start('ai-code-review-mission');
  const brief=mission.inspectEvidence('brief').value;
  assert.equal(brief.changedFiles,17);
  assert.equal(brief.testsInitiallyPassing,true);
  const baseline=mission.runSimulation();
  assert.equal(baseline.attempt.outcomeCode,'ARCHITECTURE_REGRESSION');
  mission.intervene('review-depth',{value:'diff-review'});
  mission.intervene('test-strategy',{value:'targeted'});
  mission.intervene('scope-policy',{value:'spec-locked'});
  mission.intervene('dependency-check',{value:'provenance'});
  const viable=mission.runSimulation();
  assert.equal(viable.attempt.outcomeCode,'MERGE_READY');
  assert.ok(viable.attempt.frame.derived.metrics.architectureDriftPercent<=10);
  assert.ok(viable.attempt.frame.derived.metrics.testEvidenceScore>=78);
  assert.ok(viable.attempt.frame.derived.metrics.reviewMinutes<=28);
  const comparison=mission.compareAttempts(1,2);
  assert.equal(comparison.outcomes.before,'ARCHITECTURE_REGRESSION');
  assert.equal(comparison.outcomes.after,'MERGE_READY');
  finish(mission);
}

// Research: snippets + a single source produce fluent but unsupported synthesis.
// A bounded primary/secondary source mix, independent triangulation, claim matrix
// and event-date check creates evidence that can be independently verified.
{
  const mission=start('research-evidence-mission');
  assert.equal(mission.inspectEvidence('signals').value.timeSensitivity,'high');
  const baseline=mission.runSimulation();
  assert.equal(baseline.attempt.outcomeCode,'UNSUPPORTED_CLAIMS');
  mission.intervene('source-mix',{value:'primary-plus-secondary'});
  mission.intervene('triangulation',{value:'two-source'});
  mission.intervene('claim-matrix',{value:'claim-evidence'});
  mission.intervene('freshness-check',{value:'event-date'});
  const viable=mission.runSimulation();
  assert.equal(viable.attempt.outcomeCode,'EVIDENCE_READY');
  const metrics=viable.attempt.frame.derived.metrics;
  assert.ok(metrics.unsupportedClaimRiskPercent<=12);
  assert.ok(metrics.staleEvidenceRiskPercent<=10);
  assert.ok(metrics.sourceDiversityScore>=65);
  assert.ok(metrics.verifiabilityScore>=78);
  assert.ok(metrics.researchMinutes<=50);
  finish(mission);
}

// Data analysis: the model's narrative is not its own verifier. Independent
// extraction/arithmetical/outlier/uncertainty controls must turn a wrong-looking
// denominator into a reproducible analysis under the bounded review budget.
{
  const mission=start('data-analysis-verification-lab');
  assert.match(mission.inspectEvidence('artifacts').value.hiddenIssue,/denominator/i);
  const baseline=mission.runSimulation();
  assert.equal(baseline.attempt.outcomeCode,'ANALYSIS_NOT_VERIFIED');
  mission.intervene('extraction-mode',{value:'schema-validated'});
  mission.intervene('numeric-check',{value:'recompute'});
  mission.intervene('outlier-policy',{value:'investigate'});
  mission.intervene('confidence-policy',{value:'evidence-linked'});
  const viable=mission.runSimulation();
  assert.equal(viable.attempt.outcomeCode,'ANALYSIS_VERIFIED');
  const metrics=viable.attempt.frame.derived.metrics;
  assert.ok(metrics.analysisErrorRiskPercent<=10);
  assert.ok(metrics.verifiedRowsPercent>=75);
  assert.ok(metrics.coveragePercent>=82);
  assert.ok(metrics.confidenceVariancePercent<=15);
  assert.ok(metrics.reviewMinutes<=40);
  finish(mission);
}

const codeActions=[['review-depth','diff-review'],['test-strategy','targeted'],['scope-policy','spec-locked'],['dependency-check','provenance']];
const researchActions=[['source-mix','primary-plus-secondary'],['triangulation','two-source'],['claim-matrix','claim-evidence'],['freshness-check','event-date']];
const dataActions=[['extraction-mode','schema-validated'],['numeric-check','recompute'],['outlier-policy','investigate'],['confidence-policy','evidence-linked']];
assert.deepEqual(fingerprint('ai-code-review-mission',codeActions),fingerprint('ai-code-review-mission',codeActions));
assert.deepEqual(fingerprint('research-evidence-mission',researchActions),fingerprint('research-evidence-mission',researchActions));
assert.deepEqual(fingerprint('data-analysis-verification-lab',dataActions),fingerprint('data-analysis-verification-lab',dataActions));

console.log('PASS Content Wave 1: code review, research evidence and data analysis each move from a realistic failure baseline to a bounded viable policy with inspect/compare/decide flow and deterministic outcomes.');
