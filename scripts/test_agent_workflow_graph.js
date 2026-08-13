'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','lab-scenarios.js'));
require(path.join(__dirname,'..','src','assets','agent-workflow-graph-scenario.js'));

const AhaFrame=globalThis.AhaFrame;
const lab=AhaFrame.createLab('agent-workflow-graph',{track:false});
let frame=lab.getFrame();

assert.equal(frame.state.topology,'coordinator');
assert.equal(frame.state.agentCount,5);
assert.equal(frame.state.parallelism,4);
assert.equal(frame.state.stateMode,'shared');
assert.equal(frame.state.retryScope,'graph');
assert.equal(frame.state.joinStrategy,'first');
assert.equal(frame.derived.failureType,'shared-state-contamination');
assert.ok(frame.derived.failurePropagationRisk>0.5,'baseline should expose broad failure propagation');
assert.ok(frame.derived.duplicateWorkRisk>0.3,'baseline should expose duplicate-work risk');
assert.ok(frame.derived.coordinationOverhead>60,'baseline should make coordination overhead visible');

lab.checkpoint('baseline');
frame=lab.dispatch('APPLY_BALANCED_GRAPH');
assert.equal(frame.state.topology,'branched');
assert.equal(frame.state.agentCount,3);
assert.equal(frame.state.parallelism,2);
assert.equal(frame.state.stateMode,'isolated');
assert.equal(frame.state.retryScope,'node');
assert.equal(frame.state.joinStrategy,'verified');
assert.equal(frame.state.humanGate,'before-refund');
assert.equal(frame.derived.failureType,'healthy');
assert.ok(frame.derived.reliability>0.9,'bounded graph should improve reliability');
assert.ok(frame.derived.failurePropagationRisk<0.1,'bounded graph should contain failures');
assert.ok(frame.derived.unsafeActionRisk<0.1,'review gate and verified merge should reduce consequential-action risk');
assert.ok(frame.derived.architectureScore>frame.metrics?.architectureScore||frame.derived.architectureScore>75);

const diff=lab.compare('baseline');
assert.ok(diff.metrics.architectureScore.after>diff.metrics.architectureScore.before);
assert.ok(diff.metrics.reliabilityPercent.after>diff.metrics.reliabilityPercent.before);
assert.ok(diff.metrics.failurePropagationPercent.after<diff.metrics.failurePropagationPercent.before);
assert.ok(diff.metrics.costIndex.after<diff.metrics.costIndex.before,'bounded graph should cost less than the over-engineered baseline');

const retryBlast=AhaFrame.createLab('agent-workflow-graph',{track:false});
retryBlast.dispatch('SET_STATE_MODE',{value:'isolated'});
frame=retryBlast.getFrame();
assert.equal(frame.derived.failureType,'retry-blast-radius','whole-graph retry should remain a graph-level failure after state isolation');

const prematureJoin=AhaFrame.createLab('agent-workflow-graph',{track:false});
prematureJoin.dispatch('SET_STATE_MODE',{value:'isolated'});
prematureJoin.dispatch('SET_RETRY_SCOPE',{value:'node'});
frame=prematureJoin.getFrame();
assert.equal(frame.derived.failureType,'premature-join','first-result joins should expose a reliability trade-off in parallel graphs');

const simple=AhaFrame.createLab('agent-workflow-graph',{track:false});
simple.dispatch('SET_TOPOLOGY',{value:'single-agent'});
simple.dispatch('SET_AGENT_COUNT',{value:1});
simple.dispatch('SET_PARALLELISM',{value:1});
simple.dispatch('SET_STATE_MODE',{value:'isolated'});
simple.dispatch('SET_RETRY_SCOPE',{value:'node'});
simple.dispatch('SET_JOIN_STRATEGY',{value:'verified'});
frame=simple.getFrame();
assert.ok(frame.derived.coordinationOverhead<30,'simple topology should have low coordination overhead');
assert.equal(frame.derived.effectiveParallelism,1);

assert.throws(()=>lab.dispatch('SET_TOPOLOGY',{value:'magic'}),/single-agent, sequential, branched, parallel, or coordinator/);
assert.throws(()=>lab.dispatch('SET_AGENT_COUNT',{value:7}),/between 1 and 6/);
assert.throws(()=>lab.dispatch('SET_PARALLELISM',{value:5}),/between 1 and 4/);
assert.throws(()=>lab.dispatch('SET_STATE_MODE',{value:'global'}),/shared or isolated/);
assert.throws(()=>lab.dispatch('SET_RETRY_SCOPE',{value:'forever'}),/graph or node/);
assert.throws(()=>lab.dispatch('SET_JOIN_STRATEGY',{value:'random'}),/first, all, or verified/);

console.log('PASS Agent Workflow Graph Lab: topology, state isolation, retry scope, joins, bounded graph preset, compare, and validation.');
