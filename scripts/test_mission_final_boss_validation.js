'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const validation=fs.readFileSync(path.join(root,'src','assets','validation-ui.js'),'utf8');
const adapter=fs.readFileSync(path.join(root,'src','assets','production-support-launch.js'),'utf8');
const pageBuilder=fs.readFileSync(path.join(root,'scripts','ahaframe','integrated_build.py'),'utf8');

assert.ok(adapter.includes("track?.('reliable_support_agent_architecture_changed'"),'architecture changes must preserve stable capstone interaction semantics');
assert.ok(adapter.includes("missionId:'production-support-launch'"),'Final Boss events must carry additive Mission identity');
assert.ok(adapter.includes("track?.('mission_completed'"),'Final Boss must finish through Mission completion');
assert.ok(!adapter.includes("track?.('capstone_completed'"),'Final Boss adapter must not bypass canonical capstone completion dedupe');
assert.ok(adapter.includes('rationaleLengthBucket'),'analytics may record rationale presence/length bucket');
assert.ok(!adapter.includes('rationale:text')&&!adapter.includes('rationale: text'),'analytics must not persist rationale text');

assert.ok(validation.includes("name==='mission_completed'&&context().pageType==='capstone'"),'Validation runtime must translate completed capstone Missions');
assert.ok(validation.includes("emitOnce('capstone_completed',{sourceEvent:name})"),'capstone completion must remain canonical and deduplicated');
assert.ok(validation.includes("meta.labId==='reliable-support-agent'?'[data-reliable-support-agent]'"),'legacy fallback may remain for old Build shape');
assert.ok(!pageBuilder.includes('data-reliable-support-agent'),'Final Boss page must not mount legacy fallback DOM');
assert.ok(pageBuilder.includes('data-production-support-launch'),'Final Boss page must use Mission-specific mount');
assert.ok(!pageBuilder.includes('data-build-reference'),'Final Boss must not expose the reference-architecture cheat');

console.log('PASS Final Boss Validation semantics: stable architecture interaction, additive Mission identity, explicit Mission completion, canonical capstone dedupe, and rationale privacy boundary.');
