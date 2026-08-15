'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

class MemoryStorage{
  constructor(){this.data=new Map();}
  getItem(key){return this.data.has(key)?this.data.get(key):null;}
  setItem(key,value){this.data.set(key,String(value));}
  removeItem(key){this.data.delete(key);}
  clear(){this.data.clear();}
}

global.window=global;
global.localStorage=new MemoryStorage();
global.sessionStorage=new MemoryStorage();
global.location={pathname:'/en/labs/instruction-conflict/',search:'?utm_source=reddit&utm_medium=post&utm_campaign=alpha&cohort=alpha-2026-08'};
global.document={referrer:'https://example.dev/thread',documentElement:{lang:'en'},addEventListener(){},querySelectorAll(){return []}};
Object.defineProperty(global,'navigator',{value:{sendBeacon(){return false;}},configurable:true});
global.CustomEvent=class CustomEvent{constructor(name,options){this.type=name;this.detail=options?.detail;}};
global.dispatchEvent=()=>true;
global.AHAFRAME_CONFIG={analyticsEndpoint:'',feedbackEndpoint:'',waitlistEndpoint:''};

require(path.join(__dirname,'..','src','assets','validation-context.js'));
require(path.join(__dirname,'..','src','assets','app.js'));

const AhaFrame=global.AhaFrame;
const first=AhaFrame.getValidationContext();
assert.equal(first.locale,'en');
assert.equal(first.layer,'Prompt');
assert.equal(first.labId,'instruction-conflict');
assert.equal(first.labVersion,'1.0.0');
assert.equal(first.cohortId,'alpha-2026-08');
assert.equal(first.utmSource,'reddit');
assert.equal(first.utmMedium,'post');
assert.equal(first.utmCampaign,'alpha');
assert.equal(first.referrer,'https://example.dev/thread');
assert.equal(first.visitCount,1);
assert.equal(first.returnVisit,false);
assert.ok(first.anonymousUserId);
assert.ok(first.sessionId);

const second=AhaFrame.getValidationContext();
assert.equal(second.anonymousUserId,first.anonymousUserId,'anonymous identity must remain stable');
assert.equal(second.sessionId,first.sessionId,'session ID must remain stable within one session');
assert.equal(second.cohortId,first.cohortId,'cohort must remain stable within one session');

const tracked=AhaFrame.track('validation_test',{value:1});
assert.equal(tracked.schemaVersion,1);
assert.equal(tracked.name,'validation_test');
assert.equal(tracked.anonymousUserId,first.anonymousUserId);
assert.equal(tracked.sessionId,first.sessionId);
assert.equal(tracked.cohortId,'alpha-2026-08');
assert.equal(tracked.locale,'en');
assert.equal(tracked.layer,'Prompt');
assert.equal(tracked.labId,'instruction-conflict');
assert.ok(tracked.eventId);
assert.equal(tracked.props.value,1);

assert.equal(AhaFrame.isStrongAha('yes'),true);
assert.equal(AhaFrame.isStrongAha('aha'),true);
assert.equal(AhaFrame.isStrongAha('little'),false);
const payload=AhaFrame.buildFeedbackPayload('aha',' I understand the boundary now. ');
assert.equal(payload.strongAha,true);
assert.equal(payload.note,'I understand the boundary now.');
assert.equal(payload.cohortId,'alpha-2026-08');
assert.equal(payload.attribution.cohortId,'alpha-2026-08');
assert.equal(payload.locale,'en');
assert.equal(payload.layer,'Prompt');
assert.equal(payload.labId,'instruction-conflict');
assert.ok(payload.feedbackId);

location.pathname='/zh-cn/labs/instruction-conflict/';
document.documentElement.lang='zh-CN';
const zh=AhaFrame.getValidationContext();
assert.equal(zh.locale,'zh-CN');
assert.equal(zh.layer,'Prompt');
assert.equal(zh.labId,'instruction-conflict');
assert.equal(zh.labVersion,'1.0.0');
assert.equal(zh.cohortId,'alpha-2026-08');
assert.equal(zh.anonymousUserId,first.anonymousUserId);
assert.equal(zh.sessionId,first.sessionId);
const zhTracked=AhaFrame.track('validation_locale_test',{value:2});
assert.equal(zhTracked.locale,'zh-CN');
assert.equal(zhTracked.cohortId,'alpha-2026-08');
assert.equal(zhTracked.name,'validation_locale_test');
const zhFeedback=AhaFrame.buildFeedbackPayload('yes','现在理解了边界。');
assert.equal(zhFeedback.locale,'zh-CN');
assert.equal(zhFeedback.cohortId,'alpha-2026-08');
assert.equal(zhFeedback.path,'/zh-cn/labs/instruction-conflict/');

(async()=>{
  const demo=await AhaFrame.submitFeedback('yes','Prompt 不是权限系统。');
  assert.equal(demo.remote,false);
  assert.equal(demo.mode,'demo');
  assert.equal(demo.payload.locale,'zh-CN');
  assert.equal(demo.payload.cohortId,'alpha-2026-08');
  const localFeedback=JSON.parse(localStorage.getItem('ahaframe_aha_feedback_v1'));
  assert.equal(localFeedback.length,1);
  assert.equal(localFeedback[0].strongAha,true);
  assert.equal(localFeedback[0].locale,'zh-CN');
  assert.equal(localFeedback[0].cohortId,'alpha-2026-08');

  let remoteBody=null;
  global.AHAFRAME_CONFIG.feedbackEndpoint='https://feedback.invalid/collect';
  global.fetch=async(_url,options)=>{remoteBody=JSON.parse(options.body);return {ok:true};};
  const remote=await AhaFrame.submitFeedback('little','Still unclear.');
  assert.equal(remote.remote,true);
  assert.equal(remoteBody.rating,'little');
  assert.equal(remoteBody.strongAha,false);
  assert.equal(remoteBody.locale,'zh-CN');
  assert.equal(remoteBody.cohortId,'alpha-2026-08');
  assert.equal(remoteBody.anonymousUserId,first.anonymousUserId);

  sessionStorage.clear();
  location.search='';
  document.referrer='';
  const returnVisit=AhaFrame.getValidationContext();
  assert.equal(returnVisit.anonymousUserId,first.anonymousUserId);
  assert.notEqual(returnVisit.sessionId,first.sessionId);
  assert.equal(returnVisit.locale,'zh-CN');
  assert.equal(returnVisit.cohortId,'alpha-2026-08','cohort attribution must survive later sessions without a new cohort');
  assert.equal(returnVisit.visitCount,2);
  assert.equal(returnVisit.returnVisit,true);
  assert.equal(returnVisit.firstUtmSource,'reddit','first-touch attribution must survive later sessions');

  sessionStorage.clear();
  location.search='?cohort=alpha-2026-09';
  const newCohortVisit=AhaFrame.getValidationContext();
  assert.equal(newCohortVisit.anonymousUserId,first.anonymousUserId);
  assert.equal(newCohortVisit.cohortId,'alpha-2026-09','an explicit valid cohort on a new session may replace the current cohort attribution');
  assert.equal(newCohortVisit.visitCount,3);

  location.pathname='/en/early-access/';
  location.search='?intent=foundations-49';
  document.documentElement.lang='en';
  global.AHAFRAME_CONFIG.waitlistEndpoint='';
  const waitlistPayload=AhaFrame.buildWaitlistPayload(' Test@Example.com ','foundations-49');
  assert.equal(waitlistPayload.email,'test@example.com');
  assert.equal(waitlistPayload.intent,'foundations-49');
  assert.equal(waitlistPayload.source,'/en/early-access/');
  assert.equal(waitlistPayload.locale,'en');
  assert.equal(waitlistPayload.layer,'Commercial');
  assert.equal(waitlistPayload.cohortId,'alpha-2026-09');
  const demoWaitlist=await AhaFrame.submitWaitlist(' Test@Example.com ','foundations-49');
  assert.equal(demoWaitlist.remote,false);
  assert.equal(demoWaitlist.mode,'demo');
  await AhaFrame.submitWaitlist('test@example.com','production-labs-12');
  const localWaitlist=JSON.parse(localStorage.getItem('ahaframe_waitlist'));
  assert.equal(localWaitlist.length,1,'local fallback must deduplicate repeated email submissions');
  assert.equal(localWaitlist[0].intent,'production-labs-12');

  let waitlistRemoteBody=null;
  global.AHAFRAME_CONFIG.waitlistEndpoint='https://waitlist.invalid/collect';
  global.fetch=async(_url,options)=>{waitlistRemoteBody=JSON.parse(options.body);return {ok:true};};
  const remoteWaitlist=await AhaFrame.submitWaitlist('remote@example.com','early-access');
  assert.equal(remoteWaitlist.remote,true);
  assert.equal(waitlistRemoteBody.email,'remote@example.com');
  assert.equal(waitlistRemoteBody.intent,'early-access');
  assert.equal(waitlistRemoteBody.locale,'en');
  assert.equal(waitlistRemoteBody.cohortId,'alpha-2026-09');
  assert.equal(waitlistRemoteBody.anonymousUserId,first.anonymousUserId);
  global.fetch=async()=>({ok:false});
  await assert.rejects(()=>AhaFrame.submitWaitlist('failure@example.com','early-access'),/waitlist submission failed/);
  assert.throws(()=>AhaFrame.buildWaitlistPayload('not-an-email'),/valid email address/);

  assert.throws(()=>AhaFrame.buildFeedbackPayload('great'),/no, little, yes, or aha/);
  console.log('PASS Validation Runtime: bilingual locale context, anonymous identity, cohort attribution, sessions, UTM attribution, enriched events, Strong Aha payloads, demo/remote feedback, production-ready waitlist payloads, and return visits.');
})().catch((error)=>{console.error(error);process.exit(1);});
