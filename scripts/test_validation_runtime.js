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
global.location={pathname:'/en/labs/instruction-conflict/',search:'?utm_source=reddit&utm_medium=post&utm_campaign=alpha'};
global.document={referrer:'https://example.dev/thread',addEventListener(){},querySelectorAll(){return []}};
Object.defineProperty(global,'navigator',{value:{sendBeacon(){return false;}},configurable:true});
global.CustomEvent=class CustomEvent{constructor(name,options){this.type=name;this.detail=options?.detail;}};
global.dispatchEvent=()=>true;
global.AHAFRAME_CONFIG={analyticsEndpoint:'',feedbackEndpoint:''};

require(path.join(__dirname,'..','src','assets','validation-context.js'));
require(path.join(__dirname,'..','src','assets','app.js'));

const AhaFrame=global.AhaFrame;
const first=AhaFrame.getValidationContext();
assert.equal(first.layer,'Prompt');
assert.equal(first.labId,'instruction-conflict');
assert.equal(first.labVersion,'1.0.0');
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

const tracked=AhaFrame.track('validation_test',{value:1});
assert.equal(tracked.schemaVersion,1);
assert.equal(tracked.name,'validation_test');
assert.equal(tracked.anonymousUserId,first.anonymousUserId);
assert.equal(tracked.sessionId,first.sessionId);
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
assert.equal(payload.layer,'Prompt');
assert.equal(payload.labId,'instruction-conflict');
assert.ok(payload.feedbackId);

(async()=>{
  const demo=await AhaFrame.submitFeedback('yes','Prompt is not a permission system.');
  assert.equal(demo.remote,false);
  assert.equal(demo.mode,'demo');
  const localFeedback=JSON.parse(localStorage.getItem('ahaframe_aha_feedback_v1'));
  assert.equal(localFeedback.length,1);
  assert.equal(localFeedback[0].strongAha,true);

  let remoteBody=null;
  global.AHAFRAME_CONFIG.feedbackEndpoint='https://feedback.invalid/collect';
  global.fetch=async(_url,options)=>{remoteBody=JSON.parse(options.body);return {ok:true};};
  const remote=await AhaFrame.submitFeedback('little','Still unclear.');
  assert.equal(remote.remote,true);
  assert.equal(remoteBody.rating,'little');
  assert.equal(remoteBody.strongAha,false);
  assert.equal(remoteBody.anonymousUserId,first.anonymousUserId);

  sessionStorage.clear();
  location.search='';
  document.referrer='';
  const returnVisit=AhaFrame.getValidationContext();
  assert.equal(returnVisit.anonymousUserId,first.anonymousUserId);
  assert.notEqual(returnVisit.sessionId,first.sessionId);
  assert.equal(returnVisit.visitCount,2);
  assert.equal(returnVisit.returnVisit,true);
  assert.equal(returnVisit.firstUtmSource,'reddit','first-touch attribution must survive later sessions');

  assert.throws(()=>AhaFrame.buildFeedbackPayload('great'),/no, little, yes, or aha/);
  console.log('PASS Validation Runtime: anonymous identity, sessions, attribution, enriched events, Strong Aha payloads, demo/remote feedback, and return visits.');
})().catch((error)=>{console.error(error);process.exit(1);});
