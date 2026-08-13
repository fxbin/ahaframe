'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','lab-scenarios.js'));
require(path.join(__dirname,'..','src','assets','evaluation-scenario.js'));

const AhaFrame=globalThis.AhaFrame;
const approx=(actual,expected,epsilon=1e-9)=>assert.ok(Math.abs(actual-expected)<=epsilon,`${actual} != ${expected}`);

assert.deepEqual(
  AhaFrame.listLabScenarios().map(({id})=>id),
  ['token-playground','context-window','rag-failure','agent-reliability','agent-loop','evaluation-failure'],
  'expected the six deterministic scenarios to be registered',
);

const token=AhaFrame.createLab('token-playground',{track:false});
let frame=token.getFrame();
approx(frame.derived.candidates[0].probability,0.91);
approx(frame.derived.candidates[1].probability,0.03);
approx(frame.derived.candidates[2].probability,0.02);
assert.equal(frame.derived.selected.token,'Paris');

token.checkpoint('default');
frame=token.dispatch('SET_TEMPERATURE',{value:1.2});
assert.equal(frame.derived.selected.token,'Lyon','high-temperature teaching state should preserve the existing deterministic sample');
frame=token.dispatch('SET_SAMPLING',{value:'greedy'});
assert.equal(frame.derived.selected.token,'Paris','greedy decoding must select the top candidate');
assert.equal(token.getHistory().length,2);
const tokenDiff=token.compare('default');
assert.equal(tokenDiff.state.temperature.after,1.2);
assert.equal(tokenDiff.state.sampling.after,'greedy');

token.replay([
  {type:'SET_TEMPERATURE',payload:{value:0.4}},
  {type:'SET_SAMPLING',payload:{value:'sample'}},
]);
assert.equal(token.getFrame().state.temperature,0.4);
assert.equal(token.getHistory().length,2,'replay should rebuild bounded history from a clean initial state');

const context=AhaFrame.createLab('context-window',{track:false});
frame=context.getFrame();
assert.equal(frame.state.strategy,'summarize');
assert.equal(frame.derived.activeTokens,112430);
assert.equal(frame.derived.releasedTokens,78820);
assert.equal(frame.derived.headroom,87570);
frame=context.dispatch('SELECT_STRATEGY',{strategy:'rag'});
assert.equal(frame.derived.activeTokens,96800);
assert.equal(frame.derived.releasedTokens,94450);
assert.equal(frame.derived.headroom,103200);

const rag=AhaFrame.createLab('rag-failure',{track:false});
frame=rag.getFrame();
assert.equal(frame.state.chunkSize,1200);
assert.equal(frame.state.topK,12);
assert.equal(frame.derived.contextTokens,14100);
assert.equal(frame.derived.overflowTokens,6100);
assert.equal(frame.derived.failureType,'context-overflow');
assert.ok(frame.derived.qualityScore<30,'intentionally bad baseline should fail clearly');
rag.checkpoint('baseline');
frame=rag.dispatch('APPLY_BALANCED_PRESET');
assert.equal(frame.state.retrieval,'hybrid');
assert.equal(frame.state.reranker,true);
assert.equal(frame.derived.contextTokens,2875);
assert.equal(frame.derived.overflowTokens,0);
assert.equal(frame.derived.failureType,'healthy');
assert.ok(frame.derived.recall>0.89);
assert.ok(frame.derived.precision>=0.97);
assert.ok(frame.derived.qualityScore>93);
const ragDiff=rag.compare('baseline');
assert.ok(ragDiff.metrics.qualityScore.after>ragDiff.metrics.qualityScore.before);
assert.ok(ragDiff.metrics.contextTokens.after<ragDiff.metrics.contextTokens.before);

const reliability=AhaFrame.createLab('agent-reliability',{track:false});
frame=reliability.getFrame();
assert.equal(frame.state.maxSteps,14);
assert.equal(frame.state.retryLimit,4);
assert.equal(frame.state.termination,'weak');
approx(frame.derived.successRate,0.78);
approx(frame.derived.runawayRisk,0.544);
approx(frame.derived.unsafeActionRisk,0.35);
approx(frame.derived.costIndex,79.96);
assert.equal(frame.derived.failureType,'runaway-loop');
assert.ok(frame.derived.reliabilityScore<70,'unreliable baseline should expose a weak control policy');
reliability.checkpoint('baseline');
frame=reliability.dispatch('APPLY_RELIABILITY_PRESET');
assert.equal(frame.state.maxSteps,8);
assert.equal(frame.state.retryLimit,2);
assert.equal(frame.state.timeoutSec,6);
assert.equal(frame.state.validation,true);
assert.equal(frame.state.humanApproval,true);
assert.equal(frame.state.termination,'goal-aware');
approx(frame.derived.successRate,0.908);
approx(frame.derived.runawayRisk,0.01);
approx(frame.derived.unsafeActionRisk,0.01);
approx(frame.derived.latencySeconds,16.722);
approx(frame.derived.costIndex,62.6);
assert.equal(frame.derived.humanReviewsPer100,43);
assert.equal(frame.derived.failureType,'healthy');
assert.ok(frame.derived.reliabilityScore>94);
const reliabilityDiff=reliability.compare('baseline');
assert.ok(reliabilityDiff.metrics.reliabilityScore.after>reliabilityDiff.metrics.reliabilityScore.before);
assert.ok(reliabilityDiff.metrics.runawayPercent.after<reliabilityDiff.metrics.runawayPercent.before);
assert.ok(reliabilityDiff.metrics.unsafeActionPercent.after<reliabilityDiff.metrics.unsafeActionPercent.before);
assert.ok(reliabilityDiff.metrics.costIndex.after<reliabilityDiff.metrics.costIndex.before);

const evaluation=AhaFrame.createLab('evaluation-failure',{track:false});
frame=evaluation.getFrame();
assert.equal(frame.state.datasetPreset,'demo-biased');
assert.equal(frame.state.sampleSize,50);
assert.ok(frame.derived.aggregateV2>frame.derived.aggregateV1,'naive aggregate should make v2 look better');
assert.equal(frame.derived.criticalRegressions.length,1,'candidate must contain a critical safety regression');
assert.equal(frame.derived.sliceScores.find((slice)=>slice.critical).delta,-28);
assert.equal(frame.derived.decision,'SHIP','naive evaluation should ship because no safety or cost gate is enabled');
assert.equal(frame.derived.failureType,'demo-biased-dataset');
evaluation.checkpoint('naive-eval');
const naiveConfidence=frame.derived.confidenceWidth;
frame=evaluation.dispatch('APPLY_PRODUCTION_PRESET');
assert.equal(frame.state.datasetPreset,'production-like');
assert.equal(frame.state.passThreshold,82);
assert.equal(frame.state.safetyVeto,true);
assert.equal(frame.state.sampleSize,200);
assert.equal(frame.state.judgeMode,'mixed');
assert.equal(frame.state.costGate,true);
assert.equal(frame.derived.decision,'BLOCK','production evaluation should catch the safety regression');
assert.equal(frame.derived.failureType,'aggregate-score-trap');
assert.ok(frame.derived.confidenceWidth<naiveConfidence,'larger evaluation set should reduce modeled evidence width');
const evaluationDiff=evaluation.compare('naive-eval');
assert.equal(evaluationDiff.state.safetyVeto.after,true);
assert.ok(evaluationDiff.metrics.confidenceWidth.after<evaluationDiff.metrics.confidenceWidth.before);

const underpowered=AhaFrame.createLab('evaluation-failure',{track:false});
underpowered.dispatch('SET_DATASET_PRESET',{value:'production-like'});
frame=underpowered.getFrame();
assert.equal(frame.derived.decision,'INCONCLUSIVE','smaller production-like delta should be inconclusive at 50 cases');
assert.equal(frame.derived.failureType,'underpowered-eval');
underpowered.dispatch('SET_SAMPLE_SIZE',{value:500});
assert.equal(underpowered.getFrame().derived.decision,'SHIP','more evidence can resolve an otherwise underpowered comparison when no gate is violated');

const safetyGate=AhaFrame.createLab('evaluation-failure',{track:false});
safetyGate.dispatch('SET_SAMPLE_SIZE',{value:500});
assert.equal(safetyGate.getFrame().derived.decision,'SHIP');
safetyGate.dispatch('SET_SAFETY_VETO',{value:true});
assert.equal(safetyGate.getFrame().derived.decision,'BLOCK','safety veto must override aggregate improvement');

const costGateEval=AhaFrame.createLab('evaluation-failure',{track:false});
costGateEval.dispatch('SET_SAMPLE_SIZE',{value:200});
assert.equal(costGateEval.getFrame().derived.decision,'SHIP');
costGateEval.dispatch('SET_COST_GATE',{value:true});
assert.equal(costGateEval.getFrame().derived.decision,'BLOCK','cost gate must be able to block an otherwise acceptable candidate');
assert.equal(costGateEval.getFrame().derived.failureType,'economic-regression');

const agent=AhaFrame.createLab('agent-loop',{track:false});
frame=agent.dispatch('NEXT');
assert.equal(frame.state.step,1);
frame=agent.dispatch('INJECT_TOOL_ERROR');
assert.equal(frame.state.failure,'weather-timeout');
assert.match(frame.derived.status,/Weather API timeout/);
frame=agent.dispatch('RECOVER_TOOL_ERROR');
assert.equal(frame.state.step,2);
assert.equal(frame.state.failure,null);
agent.reset();
assert.equal(agent.getFrame().state.step,0);
assert.equal(agent.getHistory().length,0);

assert.throws(()=>token.dispatch('SET_TEMPERATURE',{value:3}),/between 0 and 2/);
assert.throws(()=>context.dispatch('SELECT_STRATEGY',{strategy:'magic'}),/Unknown context strategy/);
assert.throws(()=>rag.dispatch('SET_TOP_K',{value:1}),/between 2 and 15/);
assert.throws(()=>rag.dispatch('SET_OVERLAP',{value:1300}),/smaller than chunk size/);
assert.throws(()=>reliability.dispatch('SET_MAX_STEPS',{value:3}),/between 4 and 20/);
assert.throws(()=>reliability.dispatch('SET_RETRY_LIMIT',{value:6}),/between 0 and 5/);
assert.throws(()=>reliability.dispatch('SET_TERMINATION',{value:'forever'}),/weak, bounded, or goal-aware/);
assert.throws(()=>evaluation.dispatch('SET_PASS_THRESHOLD',{value:69}),/between 70 and 95/);
assert.throws(()=>evaluation.dispatch('SET_SAMPLE_SIZE',{value:75}),/one of 50, 100, 200, or 500/);
assert.throws(()=>evaluation.dispatch('SET_DATASET_PRESET',{value:'marketing-only'}),/demo-biased, production-like, or safety-heavy/);
assert.throws(()=>evaluation.dispatch('SET_JUDGE_MODE',{value:'magic'}),/deterministic, rubric, or mixed/);
assert.throws(()=>AhaFrame.createLab('missing-scenario'),/Unknown lab scenario/);

console.log('PASS Lab Engine: registry, Token, Context, RAG failure simulation, Agent Reliability, Evaluation Failure decisions, Agent Loop, history, checkpoints, compare, replay, reset, validation.');
