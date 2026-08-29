'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const asset=(name)=>require(path.join(__dirname,'..','src','assets',name));
asset('lab-engine.js');
asset('decision-experience-scenario.js');
asset('content-wave-2-scenarios.js');
asset('mission-engine.js');
asset('content-wave-2-missions.js');

const AhaFrame=globalThis.AhaFrame;

function start(id){
  const mission=AhaFrame.createMission(id,{clock:()=>456});
  mission.start();
  return mission;
}

function run(id,actions){
  const mission=start(id);
  for(const [control,value] of actions)mission.intervene(control,{value});
  return {mission,result:mission.runSimulation()};
}

function assertComplete(mission){
  mission.readyToDecide();
  mission.submitReleaseDecision('SHIP');
  mission.complete();
  assert.equal(mission.getMissionState().phase,'COMPLETE');
}

const cases=[
  {
    id:'structured-output-contract-lab',baseline:'MALFORMED_OUTPUT',viable:'CONTRACT_READY',
    evidence:['brief','artifacts'],
    actions:[['contract','versioned-schema'],['validation','schema-semantic'],['repair','bounded-repair'],['streaming','incremental']],
    trap:[['contract','versioned-schema'],['validation','schema']],trapOutcome:'SEMANTIC_CONTRACT_GAP',
  },
  {
    id:'mcp-capability-boundary-mission',baseline:'CAPABILITY_OVEREXPOSURE',viable:'CAPABILITY_BOUNDARY_READY',
    evidence:['brief','artifacts'],
    actions:[['discovery','server-discover'],['authorization','least-privilege'],['sideEffects','dry-run-approval'],['longWork','tasks-extension']],
    trap:[['discovery','gateway-allowlist'],['authorization','least-privilege'],['sideEffects','dry-run-approval'],['longWork','tasks-extension']],trapOutcome:'CONTROL_OVERLOAD',
  },
  {
    id:'long-running-agent-recovery-mission',baseline:'STATE_NOT_DURABLE',viable:'RECOVERY_READY',
    evidence:['brief','artifacts'],
    actions:[['persistence','durable-events'],['idempotency','step'],['resume','verified-step'],['cancellation','bounded']],
    trap:[['persistence','checkpoint'],['idempotency','operation'],['resume','checkpoint']],trapOutcome:'STATE_NOT_DURABLE',
  },
  {
    id:'write-book-with-ai-build',baseline:'BOOK_CLAIMS_UNVERIFIED',viable:'MANUSCRIPT_SYSTEM_READY',
    evidence:['brief','signals'],
    actions:[['research','authority-library'],['outline','argument-map'],['context','chapter-briefs'],['verification','claim-check']],
    trap:[['research','authority-library'],['verification','claim-check']],trapOutcome:'LONG_FORM_DRIFT',
  },
  {
    id:'knowledge-base-build',baseline:'KNOWLEDGE_TOO_STALE',viable:'KNOWLEDGE_SYSTEM_READY',
    evidence:['brief','artifacts'],
    actions:[['ingestion','authority-aware'],['retrieval','hybrid-rerank'],['freshness','incremental-sync'],['evaluation','failure-set']],
    trap:[['retrieval','hybrid-rerank'],['evaluation','failure-set']],trapOutcome:'KNOWLEDGE_TOO_STALE',
  },
  {
    id:'customer-support-build',baseline:'SUPPORT_ACTION_UNSAFE',viable:'SUPPORT_SYSTEM_READY',
    evidence:['brief','signals'],
    actions:[['grounding','authority-rag'],['tools','scoped-tools'],['autonomy','approval-by-risk'],['escalation','confidence-policy']],
    trap:[['grounding','authority-rag']],trapOutcome:'SUPPORT_ACTION_UNSAFE',
  },
  {
    id:'course-knowledge-product-build',baseline:'LEARNING_OBJECTIVES_WEAK',viable:'KNOWLEDGE_PRODUCT_READY',
    evidence:['brief','artifacts'],
    actions:[['objectives','measurable'],['curriculum','concept-graph'],['editorial','rubric'],['provenance','qa-provenance']],
    trap:[['objectives','measurable'],['curriculum','concept-graph']],trapOutcome:'EDITORIAL_DRIFT',
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
  assertComplete(mission);

  const trap=run(item.id,item.trap).result;
  assert.equal(trap.attempt.outcomeCode,item.trapOutcome,`${item.id} teaching trap stopped demonstrating the intended partial fix`);

  const first=run(item.id,item.actions).result.attempt;
  const second=run(item.id,item.actions).result.attempt;
  assert.deepEqual(
    {outcome:first.outcomeCode,state:first.frame.state,metrics:first.frame.derived.metrics},
    {outcome:second.outcomeCode,state:second.frame.state,metrics:second.frame.derived.metrics},
    `${item.id} must replay deterministically`,
  );
}

const mcp=AhaFrame.getLabScenario('mcp-capability-boundary-scenario');
assert.equal(mcp?.version,'1.0.0');
const mcpMission=start('mcp-capability-boundary-mission');
const currentProtocol=mcpMission.inspectEvidence('brief').value;
assert.equal(currentProtocol.currentSpecVersion,'2026-07-28');
assert.equal(currentProtocol.protocolMode,'stateless request/response');
assert.match(currentProtocol.deprecatedMentalModel,/initialize\/session/);

console.log(`PASS Content Wave 2: ${cases.length} Experiences each preserve a deterministic failure baseline, bounded viable architecture, partial-fix trap, inspect/compare/decide flow, and current MCP protocol evidence.`);
