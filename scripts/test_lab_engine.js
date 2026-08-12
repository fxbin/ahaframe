'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','lab-scenarios.js'));

const AhaFrame=globalThis.AhaFrame;
const approx=(actual,expected,epsilon=1e-9)=>assert.ok(Math.abs(actual-expected)<=epsilon,`${actual} != ${expected}`);

assert.deepEqual(
  AhaFrame.listLabScenarios().map(({id})=>id),
  ['token-playground','context-window','rag-failure','agent-loop'],
  'expected the four deterministic scenarios to be registered',
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
assert.throws(()=>AhaFrame.createLab('missing-scenario'),/Unknown lab scenario/);

console.log('PASS Lab Engine: registry, Token, Context, RAG failure simulation, Agent, history, checkpoints, compare, replay, reset, validation.');
