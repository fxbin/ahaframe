(function(root){
  'use strict';
  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  const IDENTITY_KEY='ahaframe_validation_identity_v1';
  const SESSION_KEY='ahaframe_validation_session_v1';
  const ATTR_KEY='ahaframe_validation_attribution_v1';
  const COHORT_KEY='ahaframe_validation_cohort_v1';
  const FEEDBACK_KEY='ahaframe_aha_feedback_v1';
  const WAITLIST_KEY='ahaframe_waitlist';
  const STRONG_AHA=new Set(['yes','aha']);
  const PREFIX_LOCALES={'en':'en','zh-cn':'zh-CN'};
  const ROUTES={
    '':{pageType:'landing',layer:'Overview'},
    'lessons/token-playground/':{pageType:'lesson',labId:'token-playground',labVersion:'1.0.0',layer:'Foundation'},
    'lessons/context-window/':{pageType:'lesson',labId:'context-window',labVersion:'1.0.0',layer:'Context'},
    'lessons/agent-loop/':{pageType:'lesson',labId:'agent-loop',labVersion:'1.0.0',layer:'Loop'},
    'labs/instruction-conflict/':{pageType:'lab',labId:'instruction-conflict',labVersion:'1.0.0',layer:'Prompt'},
    'labs/rag-failure/':{pageType:'lab',labId:'rag-failure',labVersion:'1.0.0',layer:'Context'},
    'labs/context-compression/':{pageType:'lab',labId:'context-compression',labVersion:'1.0.0',layer:'Context'},
    'labs/agent-reliability/':{pageType:'lab',labId:'agent-reliability',labVersion:'1.0.0',layer:'Harness'},
    'labs/agent-workflow-graph/':{pageType:'lab',labId:'agent-workflow-graph',labVersion:'1.0.0',layer:'Graph'},
    'labs/evaluation-failure/':{pageType:'lab',labId:'evaluation-failure',labVersion:'1.0.0',layer:'Evaluation'},
    'build/reliable-support-agent/':{pageType:'capstone',labId:'reliable-support-agent',labVersion:'2.0.0',layer:'Integrated'},
    'pricing/':{pageType:'pricing',layer:'Commercial'},
    'early-access/':{pageType:'waitlist',layer:'Commercial'},
  };
  const read=(store,key,fallback)=>{try{return JSON.parse(store.getItem(key)||'')||fallback}catch(_){return fallback}};
  const write=(store,key,value)=>{try{store.setItem(key,JSON.stringify(value))}catch(_){}};
  const now=()=>new Date().toISOString();
  const uuid=()=>root.crypto&&typeof root.crypto.randomUUID==='function'?root.crypto.randomUUID():`anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  const pathname=()=>root.location?.pathname||'/';
  const normalizeCohort=(value)=>{const parsed=String(value||'').trim().toLowerCase();return /^[a-z0-9][a-z0-9._-]{0,79}$/.test(parsed)?parsed:''};
  function route(){
    const path=pathname();
    const match=path.match(/^\/([^/]+)\/(.*)$/);
    const prefix=match?.[1]||'';
    const locale=PREFIX_LOCALES[prefix]||root.document?.documentElement?.lang||'en';
    const relative=PREFIX_LOCALES[prefix]?(match?.[2]||''):path.replace(/^\/+/, '');
    return {...(ROUTES[relative]||{pageType:'other',layer:'Other'}),locale};
  }
  const attribution=()=>{const params=new URLSearchParams(root.location?.search||'');return {utmSource:params.get('utm_source')||'',utmMedium:params.get('utm_medium')||'',utmCampaign:params.get('utm_campaign')||'',referrer:root.document?.referrer||''}};
  const incomingCohort=()=>{const params=new URLSearchParams(root.location?.search||'');return normalizeCohort(params.get('cohort'))};
  const deviceClass=()=>{const width=Number(root.innerWidth||0);return width&&width<760?'mobile':width&&width<1100?'tablet':'desktop'};
  function ensure(){
    const t=now();
    let identity=read(root.localStorage,IDENTITY_KEY,null);
    if(!identity?.anonymousUserId)identity={anonymousUserId:uuid(),firstSeenAt:t,lastSeenAt:t,visitCount:0};
    let session=read(root.sessionStorage,SESSION_KEY,null);
    if(!session?.sessionId){
      session={sessionId:uuid(),startedAt:t};
      identity.visitCount=Number(identity.visitCount||0)+1; identity.lastSeenAt=t;
      write(root.localStorage,IDENTITY_KEY,identity); write(root.sessionStorage,SESSION_KEY,session);
      const incoming=attribution(); const prior=read(root.localStorage,ATTR_KEY,null);
      const value={firstTouch:prior?.firstTouch||incoming,sessionTouch:incoming};
      write(root.sessionStorage,ATTR_KEY,value); if(!prior)write(root.localStorage,ATTR_KEY,{firstTouch:incoming});
      const cohort=incomingCohort()||normalizeCohort(read(root.localStorage,COHORT_KEY,''));
      write(root.sessionStorage,COHORT_KEY,cohort);
      if(cohort)write(root.localStorage,COHORT_KEY,cohort);
    }
    return {identity,session,attribution:read(root.sessionStorage,ATTR_KEY,{firstTouch:attribution(),sessionTouch:attribution()}),cohortId:normalizeCohort(read(root.sessionStorage,COHORT_KEY,read(root.localStorage,COHORT_KEY,'')))};
  }
  function getContext(){
    const base=ensure(); const meta=route(); const touch=base.attribution.sessionTouch||{}; const first=base.attribution.firstTouch||{};
    return {anonymousUserId:base.identity.anonymousUserId,sessionId:base.session.sessionId,firstSeenAt:base.identity.firstSeenAt,visitCount:Number(base.identity.visitCount||1),returnVisit:Number(base.identity.visitCount||1)>1,cohortId:base.cohortId||'',locale:meta.locale,pageType:meta.pageType,layer:meta.layer,labId:meta.labId||'',labVersion:meta.labVersion||'',utmSource:touch.utmSource||'',utmMedium:touch.utmMedium||'',utmCampaign:touch.utmCampaign||'',firstUtmSource:first.utmSource||'',referrer:touch.referrer||'',deviceClass:deviceClass()};
  }
  function buildFeedbackPayload(rating,note=''){
    if(!['no','little','yes','aha'].includes(rating))throw new RangeError('Feedback rating must be no, little, yes, or aha.');
    const c=getContext();
    return {feedbackId:uuid(),anonymousUserId:c.anonymousUserId,sessionId:c.sessionId,cohortId:c.cohortId,locale:c.locale,layer:c.layer,labId:c.labId,labVersion:c.labVersion,path:pathname(),rating,strongAha:STRONG_AHA.has(rating),note:String(note||'').trim().slice(0,1200),submittedAt:now(),deviceClass:c.deviceClass,attribution:{cohortId:c.cohortId,utmSource:c.utmSource,utmMedium:c.utmMedium,utmCampaign:c.utmCampaign,firstUtmSource:c.firstUtmSource,referrer:c.referrer}};
  }
  async function submitFeedback(rating,note=''){
    const payload=buildFeedbackPayload(rating,note); const endpoint=root.AHAFRAME_CONFIG?.feedbackEndpoint;
    if(!endpoint){const prior=read(root.localStorage,FEEDBACK_KEY,[]);prior.push(payload);write(root.localStorage,FEEDBACK_KEY,prior);return {ok:true,remote:false,mode:'demo',payload};}
    const response=await root.fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok)throw new Error('feedback submission failed');
    return {ok:true,remote:true,mode:'remote',payload};
  }
  function buildWaitlistPayload(email,intent='waitlist'){
    const normalized=String(email||'').trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(normalized))throw new RangeError('Enter a valid email address.');
    const c=getContext();
    const normalizedIntent=String(intent||'waitlist').trim().slice(0,120)||'waitlist';
    return {email:normalized,intent:normalizedIntent,source:pathname(),createdAt:now(),anonymousUserId:c.anonymousUserId,sessionId:c.sessionId,cohortId:c.cohortId,locale:c.locale,layer:c.layer,labId:c.labId,labVersion:c.labVersion,utmSource:c.utmSource,utmMedium:c.utmMedium,utmCampaign:c.utmCampaign,firstUtmSource:c.firstUtmSource,referrer:c.referrer,deviceClass:c.deviceClass};
  }
  async function submitWaitlist(email,intent='waitlist'){
    const payload=buildWaitlistPayload(email,intent); const endpoint=root.AHAFRAME_CONFIG?.waitlistEndpoint;
    if(!endpoint){
      const prior=read(root.localStorage,WAITLIST_KEY,[]).filter((item)=>item?.email!==payload.email);
      prior.push(payload); write(root.localStorage,WAITLIST_KEY,prior);
      return {ok:true,remote:false,mode:'demo',payload};
    }
    const response=await root.fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok)throw new Error('waitlist submission failed');
    return {ok:true,remote:true,mode:'remote',payload};
  }
  AhaFrame.getValidationContext=getContext;
  AhaFrame.buildFeedbackPayload=buildFeedbackPayload;
  AhaFrame.submitFeedback=submitFeedback;
  AhaFrame.buildWaitlistPayload=buildWaitlistPayload;
  AhaFrame.submitWaitlist=submitWaitlist;
  AhaFrame.isStrongAha=(rating)=>STRONG_AHA.has(rating);
  AhaFrame.validationContext={getContext,buildFeedbackPayload,submitFeedback,buildWaitlistPayload,submitWaitlist};
})(typeof window!=='undefined'?window:globalThis);
