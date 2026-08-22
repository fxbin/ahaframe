'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=(...parts)=>fs.readFileSync(path.join(root,...parts),'utf8');

const context=read('web','lib','validation-context.ts');
const client=read('web','lib','validation-client.ts');
const route=read('web','app','api','validation','route.ts');
const feedback=read('web','components','validation-feedback.tsx');
const waitlist=read('web','components','waitlist-form.tsx');

for(const key of [
  'ahaframe_validation_identity_v1',
  'ahaframe_validation_session_v1',
  'ahaframe_validation_attribution_v1',
  'ahaframe_validation_cohort_v1',
]) assert.ok(context.includes(key),`missing stable validation storage key ${key}`);

for(const field of [
  'anonymousUserId','sessionId','visitCount','returnVisit','cohortId','locale','pageType','layer',
  'labId','labVersion','utmSource','utmMedium','utmCampaign','firstUtmSource','referrer','deviceClass',
]) assert.ok(context.includes(field),`validation context lost ${field}`);

assert.ok(context.includes('normalizeCohort'),'cohort attribution must remain normalized');
assert.ok(context.includes('incomingCohort || normalizeCohort(read(localStorage, COHORT_KEY')),'explicit cohort must override persisted attribution while persisted cohort survives later sessions');
assert.ok(context.includes('visits > 1'),'return-visit semantics must remain stable');
assert.ok(context.includes('prefix === "zh-cn" ? "zh-CN" : "en"'),'locale context must remain bilingual');

assert.ok(client.includes('trackValidationEvent'),'Next client must expose first-party validation events');
assert.ok(client.includes('submitAhaFeedback'),'Next client must expose Aha feedback');
assert.ok(client.includes('submitProductFeedback'),'Next client must expose general product feedback');
assert.ok(client.includes('fetch("/api/validation"'),'browser validation writes must use the same-origin Next route');
assert.ok(client.includes('navigator.sendBeacon'),'ordinary events should retain unload-safe delivery');
assert.ok(client.includes('PRIVATE_EVENT_PROP'),'ordinary event props must be privacy-filtered');
for(const key of ['email','message','note','rationale','contact'])assert.ok(client.includes(key),`privacy filter lost ${key}`);
assert.ok(client.includes('const STRONG_AHA = new Set<AhaRating>(["yes", "aha"])'),'Strong Aha semantics must remain yes/aha');
assert.ok(client.includes('note.trim().slice(0, 1200)'),'Aha qualitative text must remain bounded');
assert.ok(client.includes('message.trim().slice(0, 4000)'),'product feedback text must remain bounded');
assert.ok(client.includes('email.trim().toLowerCase().slice(0, 320)'),'product feedback email must remain normalized and bounded');

assert.ok(route.includes('AHAFRAME_VALIDATION_ENDPOINT || process.env.AHAFRAME_WAITLIST_ENDPOINT'),'Next validation proxy must support the current production endpoint during migration');
assert.ok(route.includes('PRIVATE_EVENT_PROP'),'server must independently filter private ordinary-event props');
assert.ok(route.includes('payload too large'),'validation proxy must enforce a request-size envelope');
assert.ok(route.includes('eventPayload(input)')&&route.includes('ahaPayload(input)')&&route.includes('productFeedbackPayload(input)'),'proxy must preserve the three non-waitlist validation payload kinds');

assert.ok(feedback.includes('export function AhaFeedback'),'Aha feedback must now live in React');
assert.ok(feedback.includes('export function ProductFeedback'),'product feedback must now live in React');
assert.ok(feedback.includes('simulation_run')&&feedback.includes('mission_completed'),'Aha check must reveal after meaningful Mission evidence exists');
assert.ok(feedback.includes('submitAhaFeedback')&&feedback.includes('submitProductFeedback'),'React surfaces must use the Next validation client');

assert.ok(waitlist.includes('fetch("/api/waitlist"'),'waitlist must remain on the same-origin Next API boundary');
assert.ok(!client.includes('window.AhaFrame'),'Next validation telemetry must not depend on the retired global static app runtime');

console.log('PASS Validation Next runtime contract: bilingual anonymous context, cohort/return attribution, privacy-filtered events, dedicated Aha/product feedback payloads, same-origin server proxy, and waitlist boundary.');
