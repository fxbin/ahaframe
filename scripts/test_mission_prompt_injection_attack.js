'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','mission-engine.js'));
require(path.join(__dirname,'..','src','assets','prompt-injection-attack-scenario.js'));
require(path.join(__dirname,'..','src','assets','prompt-injection-attack-mission.js'));

const AhaFrame=globalThis.AhaFrame;

function startMission(){
  const mission=AhaFrame.createMission('prompt-injection-attack',{clock:()=>123});
  mission.start();
  return mission;
}

const mission=startMission();
const provenance=mission.inspectEvidence('context-provenance').value;
assert.ok(provenance.some((item)=>item.trust==='untrusted'));
assert.ok(provenance.some((item)=>item.authority==='system'));

let result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'SECURITY_VETO');
assert.equal(result.attempt.frame.derived.metrics.securityRiskPercent,100);
assert.equal(result.attempt.frame.derived.metrics.taskSuccessPercent,100);
assert.equal(result.attempt.frame.derived.evidence.attackMatrix.find((item)=>item.id==='explicit-attack').blocked,false);
assert.equal(result.attempt.frame.derived.evidence.attackMatrix.find((item)=>item.id==='subtle-attack').blocked,false);

// Viable defense-in-depth policy. No single prompt instruction is trusted as the
// security boundary; provenance, capability scope, runtime policy and approval work together.
mission.intervene('trust-policy',{value:'provenance'});
mission.intervene('tool-scope',{value:'scoped'});
mission.intervene('approval',{value:'sensitive'});
mission.intervene('runtime-gate',{value:'risk-aware'});
mission.intervene('data-filter',{value:true});
result=mission.runSimulation();
assert.equal(result.attempt.outcomeCode,'PRODUCTION_VIABLE');
assert.ok(result.attempt.frame.derived.metrics.securityRiskPercent<=10);
assert.ok(result.attempt.frame.derived.metrics.taskSuccessPercent>=80);
assert.ok(result.attempt.frame.derived.metrics.falsePositivePercent<=20);
assert.ok(result.attempt.frame.derived.metrics.humanReviewPercent<=15);
assert.ok(result.attempt.frame.derived.metrics.latencyMs<=1000);
assert.equal(result.mission.interventionBudgetSpent,8);
assert.equal(result.mission.remainingBudget,0);
const matrix=result.attempt.frame.derived.evidence.attackMatrix;
assert.equal(matrix.find((item)=>item.id==='explicit-attack').blocked,true);
assert.equal(matrix.find((item)=>item.id==='subtle-attack').blocked,true);
assert.equal(matrix.find((item)=>item.id==='benign-lookalike').blocked,false,'benign lookalike should remain usable');

const comparison=mission.compareAttempts(1,2);
assert.equal(comparison.outcomes.before,'SECURITY_VETO');
assert.equal(comparison.outcomes.after,'PRODUCTION_VIABLE');
assert.ok(comparison.lab.metrics.securityRiskPercent.after<comparison.lab.metrics.securityRiskPercent.before);
assert.ok(comparison.lab.metrics.taskSuccessPercent.after<comparison.lab.metrics.taskSuccessPercent.before,'security should have visible productivity cost');

mission.readyToDecide();
mission.submitReleaseDecision('SHIP');
mission.complete();

// Partial defense is intentionally insufficient for the subtle attack variant.
const partial=startMission();
partial.intervene('trust-policy',{value:'provenance'});
partial.intervene('tool-scope',{value:'scoped'});
partial.intervene('runtime-gate',{value:'risk-aware'});
const partialRun=partial.runSimulation();
assert.equal(partialRun.attempt.outcomeCode,'SECURITY_VETO');
const subtle=partialRun.attempt.frame.derived.evidence.attackMatrix.find((item)=>item.id==='subtle-attack');
assert.equal(subtle.blocked,false);
assert.ok(subtle.securityRiskPercent>10);

// Deny-everything policy is not a valid win: it suppresses attacks and useful work.
const overblock=startMission();
overblock.intervene('trust-policy',{value:'provenance'});
overblock.intervene('tool-scope',{value:'scoped'});
overblock.intervene('approval',{value:'all'});
overblock.intervene('runtime-gate',{value:'deny-external'});
overblock.intervene('data-filter',{value:true});
const overblockRun=overblock.runSimulation();
assert.equal(overblockRun.attempt.outcomeCode,'SAFE_BUT_OVERBLOCKING');
assert.ok(overblockRun.attempt.frame.derived.metrics.securityRiskPercent<=10);
assert.ok(overblockRun.attempt.frame.derived.metrics.taskSuccessPercent<80);
assert.ok(overblockRun.attempt.frame.derived.metrics.falsePositivePercent>20);
assert.equal(overblockRun.attempt.frame.derived.evidence.attackMatrix.find((item)=>item.id==='benign-lookalike').blocked,true);

function viableFingerprint(){
  const candidate=startMission();
  candidate.intervene('trust-policy',{value:'provenance'});
  candidate.intervene('tool-scope',{value:'scoped'});
  candidate.intervene('approval',{value:'sensitive'});
  candidate.intervene('runtime-gate',{value:'risk-aware'});
  candidate.intervene('data-filter',{value:true});
  const run=candidate.runSimulation();
  return {
    outcome:run.attempt.outcomeCode,
    state:run.attempt.frame.state,
    metrics:run.attempt.frame.derived.metrics,
    decisions:run.attempt.frame.derived.evidence.policyDecisionTrace,
  };
}
assert.deepEqual(viableFingerprint(),viableFingerprint(),'Prompt Injection Mission outcomes must be deterministic');

console.log('PASS Prompt Injection Attack: exposed baseline, subtle-attack partial-defense failure, viable defense-in-depth, deny-all overblocking trap, compare, deterministic replay.');
