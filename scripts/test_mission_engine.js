'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','mission-engine.js'));
const registerFixture=require(path.join(__dirname,'fixtures','mission_engine_fixture.js'));

const AhaFrame=globalThis.AhaFrame;

// Mission metadata may load before its scenario asset. Registration must stay
// order-independent; scenario presence becomes a runtime precondition only.
AhaFrame.registerMission({
  id:'delayed-scenario-mission',
  version:'0.8.0',
  scenarioId:'delayed-scenario',
});
assert.throws(
  ()=>AhaFrame.createMission('delayed-scenario-mission'),
  /Lab scenario is not registered: delayed-scenario/,
  'creating a Mission must fail clearly until its scenario is available',
);
AhaFrame.registerLabScenario({
  id:'delayed-scenario',
  version:'0.8.0',
  initialState:{ready:true},
  reduce(state,action){
    if(action.type!=='NOOP')throw new Error(`Unsupported delayed-scenario action: ${action.type}`);
    return {...state};
  },
  derive(state){return {metrics:{ready:state.ready?1:0}};},
});
assert.equal(AhaFrame.createMission('delayed-scenario-mission').getLabFrame().state.ready,true);

registerFixture(AhaFrame);

assert.deepEqual(AhaFrame.listMissions().map((item)=>item.id),['delayed-scenario-mission','mission-engine-demo']);
assert.deepEqual(AhaFrame.MISSION_PHASES,['BRIEF','INVESTIGATE','INTERVENE','SIMULATE','REVIEW','DECIDE','DEBRIEF','COMPLETE']);

let tick=1000;
const mission=AhaFrame.createMission('mission-engine-demo',{clock:()=>++tick});
let snapshot=mission.getSnapshot();
assert.equal(snapshot.mission.phase,'BRIEF');
assert.equal(snapshot.mission.attemptCount,0);
assert.equal(snapshot.mission.remainingBudget,5);
assert.throws(()=>mission.inspectEvidence('tool-timeline'),/not allowed during Mission phase BRIEF/);

snapshot=mission.start();
assert.equal(snapshot.mission.phase,'INVESTIGATE');
assert.equal(snapshot.mission.startedAt,1001);

const evidence=mission.inspectEvidence('tool-timeline');
assert.equal(evidence.id,'tool-timeline');
assert.equal(evidence.value[0].clientResult,'timeout');
assert.equal(evidence.value[0].providerResult,'eventual-success');
assert.deepEqual(mission.getMissionState().inspectedEvidenceIds,['tool-timeline']);
assert.throws(()=>mission.inspectEvidence('diagnosis-is-the-answer'),/Unknown Mission evidence/);

let run=mission.runSimulation();
assert.equal(run.attempt.attemptNumber,1);
assert.equal(run.attempt.outcomeCode,'SAFETY_VETO','broken baseline must fail the duplicate-action veto');
assert.equal(run.attempt.constraintResults.find((item)=>item.id==='duplicates').pass,false);
assert.equal(run.mission.phase,'REVIEW');

mission.intervene('retry-limit',{value:2});
mission.intervene('idempotency',{value:true});
assert.equal(mission.getMissionState().interventionBudgetSpent,3);
assert.equal(mission.getMissionState().remainingBudget,2);
run=mission.runSimulation();
assert.equal(run.attempt.attemptNumber,2);
assert.equal(run.attempt.outcomeCode,'PRODUCTION_VIABLE');
assert.equal(run.attempt.frame.derived.metrics.successPercent,90);
assert.ok(run.attempt.frame.derived.metrics.duplicatePercent<=1);
assert.ok(run.attempt.frame.derived.metrics.latencySeconds<=12);

const comparison=mission.compareAttempts(1,2);
assert.equal(comparison.outcomes.before,'SAFETY_VETO');
assert.equal(comparison.outcomes.after,'PRODUCTION_VIABLE');
assert.ok(comparison.lab.metrics.duplicatePercent.after<comparison.lab.metrics.duplicatePercent.before);
assert.ok(comparison.lab.metrics.costIndex.after<comparison.lab.metrics.costIndex.before);

mission.restoreAttempt(1);
assert.equal(mission.getMissionState().phase,'INTERVENE');
assert.equal(mission.getMissionState().interventionBudgetSpent,0);
assert.equal(mission.getLabFrame().state.retryLimit,4);
assert.equal(mission.getLabFrame().state.idempotency,false);

mission.restoreAttempt(2);
assert.equal(mission.getLabFrame().state.retryLimit,2);
assert.equal(mission.getLabFrame().state.idempotency,true);
assert.equal(mission.getMissionState().interventionBudgetSpent,3);
run=mission.runSimulation();
assert.equal(run.attempt.attemptNumber,3);
assert.equal(run.attempt.outcomeCode,'PRODUCTION_VIABLE','restored policy must replay deterministically');

snapshot=mission.readyToDecide();
assert.equal(snapshot.mission.phase,'DECIDE');
assert.throws(()=>mission.submitReleaseDecision('YOLO'),/Unsupported Mission release decision/);
snapshot=mission.submitReleaseDecision('SHIP');
assert.equal(snapshot.mission.phase,'DEBRIEF');
assert.equal(snapshot.mission.releaseDecision,'SHIP');
assert.equal(snapshot.mission.debriefUnlocked,true);
snapshot=mission.complete();
assert.equal(snapshot.mission.phase,'COMPLETE');
assert.equal(snapshot.mission.completed,true);

snapshot=mission.reset();
assert.equal(snapshot.mission.phase,'BRIEF');
assert.equal(snapshot.mission.attemptCount,0);
assert.equal(snapshot.mission.interventionBudgetSpent,0);
assert.equal(snapshot.frame.state.retryLimit,4);

const overBudget=AhaFrame.createMission('mission-engine-demo');
overBudget.start();
overBudget.intervene('human-approval',{value:true});
overBudget.intervene('idempotency',{value:true});
assert.equal(overBudget.getMissionState().interventionBudgetSpent,5);
assert.throws(()=>overBudget.intervene('retry-limit',{value:2}),/intervention budget exceeded/);

function runDeterministicPolicy(){
  const candidate=AhaFrame.createMission('mission-engine-demo',{clock:()=>123});
  candidate.start();
  candidate.intervene('retry-limit',{value:2});
  candidate.intervene('idempotency',{value:true});
  const result=candidate.runSimulation();
  return {
    state:result.attempt.frame.state,
    metrics:result.attempt.frame.derived.metrics,
    outcomeCode:result.attempt.outcomeCode,
    constraints:result.attempt.constraintResults.map(({id,pass,actual})=>({id,pass,actual})),
  };
}
assert.deepEqual(runDeterministicPolicy(),runDeterministicPolicy(),'same policy must produce the same Mission evidence and outcome');

assert.throws(()=>AhaFrame.createMission('missing-mission'),/Unknown Mission/);
assert.throws(()=>AhaFrame.registerMission({id:'bad-mission'}),/scenarioId/);

console.log('PASS Mission Engine: independent Mission/scenario load order, phase machine, evidence inspection, intervention budget, deterministic simulation attempts, constraints, outcome classification, compare/restore, release decision, debrief, reset.');
