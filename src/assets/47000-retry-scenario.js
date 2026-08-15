(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before $47,000 Retry scenario.');

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const VOLUME_DOLLARS=500000;

  AhaFrame.registerLabScenario({
    id:'47000-retry-scenario',
    version:'0.8.0',
    title:'The $47,000 Retry',
    initialState:{
      retryLimit:2,
      timeoutSec:4,
      idempotency:'none',
      approval:'none',
      compensation:'none',
      terminalVerifier:false,
    },
    reduce(state,action){
      switch(action.type){
        case 'SET_RETRY_LIMIT': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<0||value>4)throw new RangeError('retryLimit must be an integer between 0 and 4');
          return {...state,retryLimit:value};
        }
        case 'SET_TIMEOUT': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<3||value>12)throw new RangeError('timeoutSec must be between 3 and 12');
          return {...state,timeoutSec:value};
        }
        case 'SET_IDEMPOTENCY': {
          const value=action.payload?.value;
          if(!['none','request','operation'].includes(value))throw new RangeError('idempotency must be none, request, or operation');
          return {...state,idempotency:value};
        }
        case 'SET_APPROVAL': {
          const value=action.payload?.value;
          if(!['none','high-risk','all'].includes(value))throw new RangeError('approval must be none, high-risk, or all');
          return {...state,approval:value};
        }
        case 'SET_COMPENSATION': {
          const value=action.payload?.value;
          if(!['none','reconcile','reverse'].includes(value))throw new RangeError('compensation must be none, reconcile, or reverse');
          return {...state,compensation:value};
        }
        case 'SET_TERMINAL_VERIFIER':
          return {...state,terminalVerifier:Boolean(action.payload?.value)};
        default:
          throw new Error(`Unsupported 47000-retry action: ${action.type}`);
      }
    },
    derive(state){
      const ambiguousTimeout=state.timeoutSec<6;
      let successPercent=82+Math.min(state.retryLimit,2)*7+Math.max(0,state.retryLimit-2)*2;
      if(state.terminalVerifier)successPercent+=1;
      if(state.approval==='high-risk')successPercent-=2;
      if(state.approval==='all')successPercent-=8;
      successPercent=clamp(successPercent,0,99);

      let duplicateActionPercent=ambiguousTimeout&&state.retryLimit>0?4.7*state.retryLimit:0;
      const idempotencyFactor={none:1,request:0.35,operation:0.01}[state.idempotency];
      duplicateActionPercent*=idempotencyFactor;
      if(state.terminalVerifier)duplicateActionPercent*=0.35;
      if(state.approval==='high-risk')duplicateActionPercent*=0.12;
      if(state.approval==='all')duplicateActionPercent=0;
      duplicateActionPercent=Math.round(duplicateActionPercent*1000)/1000;

      const grossExposureDollars=Math.round(VOLUME_DOLLARS*duplicateActionPercent/100);
      const compensationFactor={none:1,reconcile:0.35,reverse:0.08}[state.compensation];
      const netExposureDollars=Math.round(grossExposureDollars*compensationFactor);
      const humanReviewPercent=state.approval==='all'?100:state.approval==='high-risk'?8:0;
      const latencySeconds=Math.round((3.5+state.timeoutSec*0.65+state.retryLimit*1.4+(state.terminalVerifier?1.5:0)+(state.approval==='high-risk'?5:0)+(state.approval==='all'?30:0))*10)/10;
      const costIndex=Math.round((22+state.retryLimit*8+(state.idempotency==='operation'?4:state.idempotency==='request'?2:0)+(state.terminalVerifier?4:0)+(state.approval==='high-risk'?7:state.approval==='all'?18:0)+(state.compensation==='none'?0:4))*10)/10;

      const timeline=[
        {step:'attempt-1',clientResult:ambiguousTimeout?'timeout':'success-visible',providerResult:'eventual-success',sideEffect:'refund-issued'},
      ];
      if(state.retryLimit>0&&ambiguousTimeout){
        timeline.push({
          step:'retry-1',
          trigger:'client-timeout',
          idempotencyScope:state.idempotency,
          outcome:state.idempotency==='operation'?'deduplicated':duplicateActionPercent>0?'duplicate-side-effect':'held-for-review',
        });
      }
      if(state.terminalVerifier)timeline.push({step:'terminal-verifier',outcome:'provider-state-checked-before-next-transition'});
      if(state.compensation!=='none')timeline.push({step:'compensation',strategy:state.compensation,remainingExposureDollars:netExposureDollars});

      let diagnosisCode='HEALTHY';
      if(duplicateActionPercent>0.5)diagnosisCode='DUPLICATE_SIDE_EFFECT';
      else if(humanReviewPercent>10)diagnosisCode='TOO_MANUAL';
      else if(successPercent<92)diagnosisCode='LOW_RECOVERY';
      else if(latencySeconds>11.5)diagnosisCode='TOO_SLOW';
      else if(costIndex>55)diagnosisCode='TOO_EXPENSIVE';

      return {
        evidence:{
          incident:{volumeDollars:VOLUME_DOLLARS,clientTimeoutSec:state.timeoutSec,providerCompletionSec:5.2,baselineExposureDollars:47000},
          timeline,
          policy:{...state},
          sideEffects:{duplicateActionPercent,grossExposureDollars,netExposureDollars},
          audit:{ambiguousTimeout,idempotencyScope:state.idempotency,terminalVerifier:state.terminalVerifier,humanReviewPercent},
        },
        successPercent,
        duplicateActionPercent,
        grossExposureDollars,
        netExposureDollars,
        latencySeconds,
        costIndex,
        humanReviewPercent,
        diagnosisCode,
        metrics:{
          successPercent,
          duplicateActionPercent,
          grossExposureDollars,
          netExposureDollars,
          latencySeconds,
          costIndex,
          humanReviewPercent,
        },
      };
    },
  });
})(typeof window!=='undefined'?window:globalThis);
