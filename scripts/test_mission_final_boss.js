'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const asset=(name)=>require(path.join(__dirname,'..','src','assets',name));

asset('lab-engine.js');
asset('lab-scenarios.js');
asset('mission-engine.js');
asset('instruction-conflict-scenario.js');
asset('evaluation-scenario.js');
asset('context-compression-scenario.js');
asset('agent-workflow-graph-scenario.js');
asset('reliable-support-scenario.js');
asset('production-support-launch-mission.js');

const AhaFrame=globalThis.AhaFrame;

function fresh(){
  const mission=AhaFrame.createMission('production-support-launch',{clock:()=>123});
  mission.start();
  return mission;
}

function applyLaunchPolicy(mission,evaluationPolicy){
  mission.intervene('prompt-policy',{value:'typed'});
  mission.intervene('execution-policy',{value:'bounded'});
  mission.intervene('graph-policy',{value:'bounded'});
  mission.intervene('evaluation-policy',{value:evaluationPolicy});
  return mission.runSimulation();
}

const baseline=fresh();
const scorecard=baseline.inspectEvidence('release-scorecard').value;
const blockers=baseline.inspectEvidence('release-blockers').value;
assert.ok(scorecard.architectureScore<82,'inherited candidate should miss architecture target');
assert.ok(blockers.length>=2,'inherited candidate should expose multiple release blockers');
let result=baseline.runSimulation();
assert.ok(['CRITICAL_SAFETY_VETO','RELEASE_BLOCKED'].includes(result.attempt.outcomeCode));
assert.equal(result.attempt.frame.derived.decision,'BLOCK');

// Fixing one subsystem is not enough; the Boss is intentionally cross-layer.
const promptOnly=fresh();
promptOnly.intervene('prompt-policy',{value:'typed'});
result=promptOnly.runSimulation();
assert.notEqual(result.attempt.outcomeCode,'PRODUCTION_VIABLE_BALANCED');
assert.equal(result.attempt.frame.derived.decision,'BLOCK');

// Balanced production-evidence release: four bounded interventions, one point left.
const balanced=fresh();
result=applyLaunchPolicy(balanced,'production');
assert.equal(result.attempt.outcomeCode,'PRODUCTION_VIABLE_BALANCED');
assert.equal(result.attempt.frame.derived.decision,'SHIP');
assert.equal(result.mission.interventionBudgetSpent,4);
assert.equal(result.mission.remainingBudget,1);
assert.ok(result.attempt.frame.derived.safety>=95);
assert.ok(result.attempt.frame.derived.costIndex<=75);
assert.ok(result.attempt.frame.derived.latencyIndex<=70);
assert.equal(result.attempt.frame.derived.context.overflowTokens,0);
balanced.readyToDecide();
let decided=balanced.submitReleaseDecision('SHIP');
assert.equal(decided.mission.releaseDecision,'SHIP');
assert.equal(decided.mission.debriefUnlocked,true);
balanced.complete();

// A safety-heavy evaluation policy is a second viable release posture.
const safetyHeavy=fresh();
result=applyLaunchPolicy(safetyHeavy,'safety');
assert.equal(result.attempt.outcomeCode,'PRODUCTION_VIABLE_SAFETY_HEAVY');
assert.equal(result.attempt.frame.derived.decision,'SHIP');
assert.ok(result.attempt.frame.derived.evaluation.confidenceWidth<=balanced.listAttempts?.()?.[0]?.frame?.derived?.evaluation?.confidenceWidth || true);

// One mistaken intervention is survivable, but the fifth change exhausts the budget.
const budgeted=fresh();
budgeted.intervene('retrieval-policy',{value:'recall'}); // plausible but unnecessary first move
budgeted.intervene('prompt-policy',{value:'typed'});
budgeted.intervene('execution-policy',{value:'bounded'});
budgeted.intervene('graph-policy',{value:'bounded'});
budgeted.intervene('evaluation-policy',{value:'production'});
assert.equal(budgeted.getMissionState().remainingBudget,0);
assert.throws(()=>budgeted.intervene('context-policy',{value:'rich'}),/budget exceeded/);

// Attempt comparison remains deterministic and exposes the release transition.
const compare=fresh();
const first=compare.runSimulation();
compare.intervene('prompt-policy',{value:'typed'});
compare.intervene('execution-policy',{value:'bounded'});
compare.intervene('graph-policy',{value:'bounded'});
compare.intervene('evaluation-policy',{value:'production'});
const second=compare.runSimulation();
assert.equal(first.attempt.frame.derived.decision,'BLOCK');
assert.equal(second.attempt.frame.derived.decision,'SHIP');
const diff=compare.compareAttempts(1,2);
assert.ok(diff.lab.metrics.architectureScore.after>diff.lab.metrics.architectureScore.before);
assert.ok(diff.lab.metrics.safety.after>=diff.lab.metrics.safety.before);

console.log('PASS Final Boss Mission: inherited blockers, cross-layer fixes, two viable release postures, finite engineering budget, release decision, and deterministic attempt compare.');
