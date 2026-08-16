'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','mission-engine.js'));
require(path.join(__dirname,'..','src','assets','47000-retry-scenario.js'));
require(path.join(__dirname,'..','src','assets','47000-retry-mission.js'));

const AhaFrame=globalThis.AhaFrame;

function startMission(){
  const mission=AhaFrame.createMission('47000-retry',{clock:()=>123});
  mission.start();
  return mission;
}

const mission=startMission();
const incident=mission.inspectEvidence('incident').value;
assert.equal(incident.baselineExposureDollars,47000);
assert.equal(incident.providerCompletionSec,5.2);

let result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'DUPLICATE_SIDE_EFFECT');
assert.equal(result.attempt.frame.derived.metrics.duplicateActionPercent,9.4);
assert.equal(result.attempt.frame.derived.metrics.grossExposureDollars,47000);
assert.equal(result.attempt.frame.derived.evidence.timeline[0].clientResult,'timeout');
assert.equal(result.attempt.frame.derived.evidence.timeline[0].providerResult,'eventual-success');

// Tempting response: compensate after the fact. Financial exposure drops, but
// the system still executed the irreversible action twice, so the veto remains.
mission.intervene('compensation',{value:'reverse'});
result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'DUPLICATE_SIDE_EFFECT');
assert.ok(result.attempt.frame.derived.metrics.netExposureDollars<5000);
assert.equal(result.attempt.frame.derived.metrics.duplicateActionPercent,9.4);

// Durable reliability fix: operation-scoped idempotency keeps transient recovery
// while deduplicating the repeated side effect.
mission.intervene('idempotency',{value:'operation'});
result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'PRODUCTION_VIABLE');
assert.ok(result.attempt.frame.derived.metrics.successPercent>=92);
assert.ok(result.attempt.frame.derived.metrics.duplicateActionPercent<=0.5);
assert.ok(result.attempt.frame.derived.metrics.latencySeconds<=11.5);
assert.ok(result.attempt.frame.derived.metrics.costIndex<=55);
assert.ok(result.attempt.frame.derived.metrics.humanReviewPercent<=10);
assert.equal(result.attempt.frame.derived.evidence.timeline[1].outcome,'deduplicated');

const comparison=mission.compareAttempts(1,3);
assert.equal(comparison.outcomes.before,'DUPLICATE_SIDE_EFFECT');
assert.equal(comparison.outcomes.after,'PRODUCTION_VIABLE');
assert.ok(comparison.lab.metrics.duplicateActionPercent.after<comparison.lab.metrics.duplicateActionPercent.before);

mission.readyToDecide();
mission.submitReleaseDecision('SHIP');
mission.complete();

// Trap: disabling every retry removes duplicate side effects but sacrifices
// recoverable task success.
const noRetry=startMission();
noRetry.intervene('retry-limit',{value:0});
const noRetryRun=noRetry.runSimulation();
assert.equal(noRetryRun.attempt.outcomeCode,'SAFE_BUT_LOW_RECOVERY');
assert.equal(noRetryRun.attempt.frame.derived.metrics.duplicateActionPercent,0);
assert.ok(noRetryRun.attempt.frame.derived.metrics.successPercent<92);

// Trap: approving everything is safe but operationally unusable.
const approveAll=startMission();
approveAll.intervene('approval',{value:'all'});
const approveAllRun=approveAll.runSimulation();
assert.equal(approveAllRun.attempt.outcomeCode,'SAFE_BUT_TOO_MANUAL');
assert.equal(approveAllRun.attempt.frame.derived.metrics.duplicateActionPercent,0);
assert.equal(approveAllRun.attempt.frame.derived.metrics.humanReviewPercent,100);

// Trap: simply waiting longer removes timeout ambiguity but blows the latency SLO.
const longTimeout=startMission();
longTimeout.intervene('timeout',{value:10});
const longTimeoutRun=longTimeout.runSimulation();
assert.equal(longTimeoutRun.attempt.outcomeCode,'SAFE_BUT_TOO_SLOW');
assert.equal(longTimeoutRun.attempt.frame.derived.metrics.duplicateActionPercent,0);
assert.ok(longTimeoutRun.attempt.frame.derived.metrics.latencySeconds>11.5);

function viableFingerprint(){
  const candidate=startMission();
  candidate.intervene('idempotency',{value:'operation'});
  const run=candidate.runSimulation();
  return {
    outcome:run.attempt.outcomeCode,
    state:run.attempt.frame.state,
    metrics:run.attempt.frame.derived.metrics,
    timeline:run.attempt.frame.derived.evidence.timeline,
  };
}
assert.deepEqual(viableFingerprint(),viableFingerprint(),'Retry Mission outcomes must be deterministic');

console.log('PASS $47,000 Retry: exact baseline exposure, compensation trap, idempotent viable policy, no-retry/manual/long-timeout traps, compare, deterministic replay.');
