'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

require(path.join(__dirname,'..','src','assets','lab-engine.js'));
require(path.join(__dirname,'..','src','assets','lab-scenarios.js'));
require(path.join(__dirname,'..','src','assets','instruction-conflict-scenario.js'));

const AhaFrame=globalThis.AhaFrame;
const lab=AhaFrame.createLab('instruction-conflict',{track:false});
let frame=lab.getFrame();

assert.equal(frame.state.authorityModel,'flat');
assert.equal(frame.state.systemSpecificity,'vague');
assert.equal(frame.state.retrievedContentMode,'instructional');
assert.equal(frame.state.schemaMode,'loose');
assert.equal(frame.state.policyAmbiguity,'high');
assert.equal(frame.derived.failureType,'authority-conflict');
assert.equal(frame.derived.nextLayer,'Prompt');
assert.ok(frame.derived.instructionAdherence<50,'broken baseline should have weak instruction adherence');
assert.ok(frame.derived.policyViolationRisk>60,'broken baseline should expose material policy risk');
assert.ok(frame.derived.conflictCount>=4,'broken baseline should expose several unresolved prompt conflicts');

lab.checkpoint('baseline');
frame=lab.dispatch('APPLY_PROMPT_PRESET');
assert.equal(frame.state.authorityModel,'hierarchical');
assert.equal(frame.state.systemSpecificity,'explicit');
assert.equal(frame.state.retrievedContentMode,'data-only');
assert.equal(frame.state.schemaMode,'strict');
assert.equal(frame.state.policyAmbiguity,'resolved');
assert.equal(frame.derived.conflictCount,0);
assert.equal(frame.derived.promptClosed,true);
assert.equal(frame.derived.failureType,'harness-boundary');
assert.equal(frame.derived.nextLayer,'Harness → Evaluation');
assert.equal(frame.derived.stateLabel,'PROMPT FIXED · HARNESS REQUIRED');
assert.ok(frame.derived.instructionAdherence>=95,'prompt-layer fix should strongly improve adherence');
assert.ok(frame.derived.policyViolationRisk<=20,'prompt-layer fix should reduce prompt-driven policy risk');
assert.ok(frame.derived.outputValidity>=95,'strict output contract should make the simulated decision shape reliable');
assert.ok(frame.derived.harnessRisk>0,'prompt repair must not pretend the runtime permission boundary disappeared');
assert.equal(frame.derived.releaseEvidence,'Not evaluated','prompt repair must not invent release evidence');

const diff=lab.compare('baseline');
assert.ok(diff.metrics.promptQuality.after>diff.metrics.promptQuality.before);
assert.ok(diff.metrics.instructionAdherence.after>diff.metrics.instructionAdherence.before);
assert.ok(diff.metrics.policyViolationRisk.after<diff.metrics.policyViolationRisk.before);
assert.ok(diff.metrics.conflictCount.after<diff.metrics.conflictCount.before);

const contextBoundary=AhaFrame.createLab('instruction-conflict',{track:false});
contextBoundary.dispatch('SET_AUTHORITY_MODEL',{value:'hierarchical'});
contextBoundary.dispatch('SET_SYSTEM_SPECIFICITY',{value:'explicit'});
frame=contextBoundary.getFrame();
assert.equal(frame.derived.failureType,'context-as-instruction','retrieved evidence should remain a distinct Prompt/Context boundary failure');
assert.equal(frame.derived.nextLayer,'Prompt / Context');

assert.throws(()=>lab.dispatch('SET_AUTHORITY_MODEL',{value:'magic'}),/flat or hierarchical/);
assert.throws(()=>lab.dispatch('SET_SYSTEM_SPECIFICITY',{value:'perfect'}),/vague or explicit/);
assert.throws(()=>lab.dispatch('SET_RETRIEVED_CONTENT_MODE',{value:'execute'}),/instructional or data-only/);
assert.throws(()=>lab.dispatch('SET_SCHEMA_MODE',{value:'xml-ish'}),/loose or strict/);
assert.throws(()=>lab.dispatch('SET_POLICY_AMBIGUITY',{value:'medium'}),/high or resolved/);

console.log('PASS Instruction Conflict Lab: authority, context boundary, prompt-only repair, Harness handoff, Evaluation boundary, checkpoint compare, and validation.');
