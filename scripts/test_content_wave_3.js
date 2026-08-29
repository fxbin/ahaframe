'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const asset=(name)=>require(path.join(__dirname,'..','src','assets',name));
asset('lab-engine.js');
asset('decision-experience-scenario.js');
asset('content-wave-3-scenarios.js');
asset('mission-engine.js');
asset('content-wave-3-missions.js');

const AhaFrame=globalThis.AhaFrame;

function start(id){
  const mission=AhaFrame.createMission(id,{clock:()=>789});
  mission.start();
  return mission;
}

function run(id,actions){
  const mission=start(id);
  for(const [control,value] of actions)mission.intervene(control,{value});
  return {mission,result:mission.runSimulation()};
}

function complete(mission){
  mission.readyToDecide();
  mission.submitReleaseDecision('SHIP');
  mission.complete();
  assert.equal(mission.getMissionState().phase,'COMPLETE');
}

const cases=[
  {
    id:'multi-agent-coordination-incident',baseline:'COORDINATION_FAILURE_RISK',viable:'ORCHESTRATION_READY',
    evidence:['brief','artifacts'],
    actions:[['delegation','manager-worker'],['state','explicit-contract'],['verification','independent-verifier'],['parallelism','bounded']],
    trap:[['delegation','peer-swarm'],['state','shared-blackboard'],['verification','double-independent'],['parallelism','maximum']],
    trapOutcome:'COORDINATION_FAILURE_RISK',
  },
  {
    id:'production-release-gate-build',baseline:'RELEASE_RISK_TOO_HIGH',viable:'RELEASE_GATE_READY',
    evidence:['brief','artifacts','signals'],
    actions:[['evaluation','gated-regression'],['rollout','canary'],['observability','traces-alerts'],['fallback','versioned-rollback']],
    trap:[['evaluation','gated-regression'],['observability','traces-alerts'],['fallback','versioned-rollback']],
    trapOutcome:'RELEASE_RISK_TOO_HIGH',
  },
  {
    id:'model-adaptation-decision-lab',baseline:'TASK_GAP_NOT_CLOSED',viable:'ADAPTATION_READY',
    evidence:['brief','artifacts','signals'],
    actions:[['baseline','prompt-rag-benchmark'],['dataset','curated-heldout'],['method','lora'],['serving','adapter-serving']],
    trap:[['baseline','strong-prompt-rag'],['dataset','synthetic-curated'],['method','full-finetune'],['serving','multi-adapter-router']],
    trapOutcome:'SERVING_COMPLEXITY_TOO_HIGH',
  },
  {
    id:'solo-business-operating-system-build',baseline:'CUSTOMER_SIGNAL_WEAK',viable:'SOLO_OPERATING_SYSTEM_READY',
    evidence:['brief','artifacts'],
    actions:[['research','evidence-loop'],['workflow','durable-workflow'],['automation','bounded-automation'],['review','risk-gates']],
    trap:[['research','evidence-loop'],['workflow','durable-workflow'],['automation','auto-everything'],['review','risk-gates']],
    trapOutcome:'AUTOMATION_BOUNDARY_UNSAFE',
  },
];

for(const item of cases){
  const mission=start(item.id);
  for(const evidence of item.evidence)assert.notEqual(mission.inspectEvidence(evidence).value,undefined,`${item.id} missing ${evidence}`);
  const baseline=mission.runSimulation();
  assert.equal(baseline.attempt.outcomeCode,item.baseline,`${item.id} baseline must expose the intended failure`);
  for(const [control,value] of item.actions)mission.intervene(control,{value});
  const viable=mission.runSimulation();
  assert.equal(viable.attempt.outcomeCode,item.viable,`${item.id} viable architecture drifted`);
  assert.ok(mission.getMissionState().interventionBudgetSpent<=8,`${item.id} exceeded bounded intervention budget`);
  const comparison=mission.compareAttempts(1,2);
  assert.equal(comparison.outcomes.before,item.baseline);
  assert.equal(comparison.outcomes.after,item.viable);
  complete(mission);

  const trap=run(item.id,item.trap).result;
  assert.equal(trap.attempt.outcomeCode,item.trapOutcome,`${item.id} complex teaching trap stopped demonstrating the intended failure`);

  const first=run(item.id,item.actions).result.attempt;
  const second=run(item.id,item.actions).result.attempt;
  assert.deepEqual(
    {outcome:first.outcomeCode,state:first.frame.state,metrics:first.frame.derived.metrics},
    {outcome:second.outcomeCode,state:second.frame.state,metrics:second.frame.derived.metrics},
    `${item.id} must replay deterministically`,
  );
}

// A stronger non-training baseline must still be measured before training, and
// this scenario intentionally leaves a residual gap that justifies adaptation.
const simpleModel=run('model-adaptation-decision-lab',[
  ['baseline','strong-prompt-rag'],
  ['dataset','curated-heldout'],
]).result;
assert.equal(simpleModel.attempt.outcomeCode,'TASK_GAP_NOT_CLOSED');

// Release evidence cannot average away a production veto: without bounded
// rollout, risk/exposure remain unsafe even when eval, observability and rollback improve.
const releaseTrap=run('production-release-gate-build',[
  ['evaluation','gated-regression'],
  ['observability','traces-alerts'],
  ['fallback','versioned-rollback'],
]).result;
assert.equal(releaseTrap.attempt.outcomeCode,'RELEASE_RISK_TOO_HIGH');
assert.ok(releaseTrap.attempt.frame.derived.metrics.changeExposurePercent>40);

console.log(`PASS Content Wave 3: ${cases.length} Experiences preserve simpler baselines, bounded viable architectures, complex-design traps, explicit release vetoes, compare/decide flow and deterministic replay.`);
