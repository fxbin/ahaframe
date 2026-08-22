'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const mission=fs.readFileSync(path.join(root,'src','assets','production-support-launch-mission.js'),'utf8');
const workspace=fs.readFileSync(path.join(root,'web','components','runtime','mission-runtime-workspace.tsx'),'utf8');
const missionPage=fs.readFileSync(path.join(root,'web','components','mission-page.tsx'),'utf8');
const page=fs.readFileSync(path.join(root,'web','app','(site)','[locale]','build','reliable-support-agent','page.tsx'),'utf8');

assert.ok(mission.includes("id:'production-support-launch'"),'Final Boss must keep the canonical Mission identity');
assert.ok(mission.includes("scenarioId:'reliable-support-agent'"),'Final Boss must keep the canonical integrated scenario');
assert.ok(mission.includes('interventionBudget:5'),'Final Boss must keep its bounded engineering budget');
assert.ok(mission.includes("severity:'veto'"),'Final Boss must retain a critical safety veto');

assert.ok(page.includes('MissionPage'),'Final Boss route must mount the current Next Mission page');
assert.ok(missionPage.includes('MissionRuntimeWorkspace'),'Mission page must mount the current React Mission workspace');
assert.ok(!page.includes('data-reliable-support-agent')&&!missionPage.includes('data-reliable-support-agent'),'Next Final Boss must not mount the retired static Build adapter');
assert.ok(!page.includes('data-build-reference')&&!missionPage.includes('data-build-reference'),'Final Boss must not expose a reference-architecture cheat');

assert.ok(workspace.includes('const [rationale, setRationale]'),'Final Boss workspace must preserve the learner rationale field');
assert.ok(workspace.includes('if (mission.ui.rationale && !rationale.trim())'),'release decisions must require rationale when the mission contract asks for it');
assert.ok(workspace.includes('runtime.submitReleaseDecision(decision)'),'release decisions must go through the canonical Mission Engine');
assert.ok(!workspace.includes('submitReleaseDecision(decision, rationale)'),'free-text rationale must not be persisted into the deterministic Mission runtime');
assert.ok(!workspace.includes('rationale:text')&&!workspace.includes('rationale: text'),'rationale text must not be copied into analytics payloads');

console.log('PASS Final Boss current-runtime semantics: canonical Mission identity, bounded release controls, Next.js Mission workspace, no legacy Build adapter, and rationale privacy boundary.');
