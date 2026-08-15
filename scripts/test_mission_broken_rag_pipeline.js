'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','mission-engine.js'));
require(path.join(__dirname,'..','src','assets','broken-rag-pipeline-scenario.js'));
require(path.join(__dirname,'..','src','assets','broken-rag-pipeline-mission.js'));

const AhaFrame=globalThis.AhaFrame;

function startMission(){
  const mission=AhaFrame.createMission('broken-rag-pipeline',{clock:()=>123});
  mission.start();
  return mission;
}

const mission=startMission();
const trace=mission.inspectEvidence('retrieval-trace').value;
assert.equal(trace[0].id,'refund-policy-v2','broken baseline should rank stale policy first');
assert.equal(mission.inspectEvidence('answer').value.correct,false);

let result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'STALE_AUTHORITY_FAILURE');
assert.equal(result.attempt.frame.derived.metrics.staleEvidenceRiskPercent,82);
assert.equal(result.attempt.frame.derived.evidence.answer.sourceId,'refund-policy-v2');

// Tempting fix: retrieve more. It increases context volume but does not solve authority.
mission.intervene('top-k',{value:8});
result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'STALE_AUTHORITY_FAILURE');
assert.ok(result.attempt.frame.derived.metrics.contextOverflowTokens>0,'more context should overflow the fixed context budget');
assert.equal(result.attempt.frame.derived.evidence.answer.correct,false,'more top-k must not magically fix stale authority');

// Defensible policy: improve retrieval signals, enforce freshness/authority, rerank,
// restore bounded top-k and compress without destroying critical policy text.
mission.intervene('top-k',{value:5});
mission.intervene('retrieval-strategy',{value:'hybrid'});
mission.intervene('rerank-depth',{value:4});
mission.intervene('freshness-policy',{value:'strict'});
mission.intervene('authority-policy',{value:'source-priority'});
mission.intervene('compression-policy',{value:'balanced'});
result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'PRODUCTION_VIABLE');
assert.equal(result.attempt.frame.derived.evidence.answer.sourceId,'refund-policy-v3');
assert.equal(result.attempt.frame.derived.evidence.answer.correct,true);
assert.equal(result.attempt.frame.derived.metrics.authoritativeCoveragePercent,100);
assert.ok(result.attempt.frame.derived.metrics.staleEvidenceRiskPercent<=15);
assert.ok(result.attempt.frame.derived.metrics.groundingScore>=85);
assert.equal(result.attempt.frame.derived.metrics.contextOverflowTokens,0);
assert.ok(result.attempt.frame.derived.metrics.latencyMs<=850);
assert.ok(result.attempt.frame.derived.metrics.costIndex<=70);
assert.equal(result.mission.interventionBudgetSpent,7);
assert.equal(result.mission.remainingBudget,1);

const compare=mission.compareAttempts(1,3);
assert.equal(compare.outcomes.before,'STALE_AUTHORITY_FAILURE');
assert.equal(compare.outcomes.after,'PRODUCTION_VIABLE');
assert.ok(compare.lab.metrics.staleEvidenceRiskPercent.after<compare.lab.metrics.staleEvidenceRiskPercent.before);
assert.ok(compare.lab.metrics.groundingScore.after>compare.lab.metrics.groundingScore.before);

mission.readyToDecide();
const decided=mission.submitReleaseDecision('SHIP');
assert.equal(decided.mission.releaseDecision,'SHIP');
assert.equal(decided.mission.debriefUnlocked,true);
mission.complete();

// Another tempting optimization: aggressive compression makes the system cheap,
// but drops critical policy detail below the grounding target.
const compressed=startMission();
compressed.intervene('retrieval-strategy',{value:'hybrid'});
compressed.intervene('rerank-depth',{value:4});
compressed.intervene('freshness-policy',{value:'strict'});
compressed.intervene('authority-policy',{value:'source-priority'});
compressed.intervene('compression-policy',{value:'aggressive'});
const compressedRun=compressed.runSimulation();
assert.equal(compressedRun.attempt.outcomeCode,'INSUFFICIENT_EVIDENCE');
assert.ok(compressedRun.attempt.frame.derived.metrics.costIndex<70);
assert.ok(compressedRun.attempt.frame.derived.metrics.groundingScore<85);

function viableFingerprint(){
  const candidate=startMission();
  candidate.intervene('retrieval-strategy',{value:'hybrid'});
  candidate.intervene('rerank-depth',{value:4});
  candidate.intervene('freshness-policy',{value:'strict'});
  candidate.intervene('authority-policy',{value:'source-priority'});
  candidate.intervene('compression-policy',{value:'balanced'});
  const run=candidate.runSimulation();
  return {
    outcome:run.attempt.outcomeCode,
    state:run.attempt.frame.state,
    metrics:run.attempt.frame.derived.metrics,
    answer:run.attempt.frame.derived.evidence.answer,
    ranking:run.attempt.frame.derived.evidence.retrievalTrace.map(({id,rank,selected})=>({id,rank,selected})),
  };
}
assert.deepEqual(viableFingerprint(),viableFingerprint(),'Broken RAG policy outcomes must be deterministic');

console.log('PASS Broken RAG Pipeline: stale baseline, more-context trap, viable evidence policy, compression trap, compare, release decision, deterministic replay.');
