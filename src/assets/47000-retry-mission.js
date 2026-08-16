(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before $47,000 Retry Mission.');

  AhaFrame.registerMission({
    id:'47000-retry',
    version:'0.8.0',
    scenarioId:'47000-retry-scenario',
    chapterId:'make-the-agent-reliable',
    interventionBudget:6,
    evidence:[
      {id:'incident',source:'derived',path:'evidence.incident'},
      {id:'tool-timeline',source:'derived',path:'evidence.timeline'},
      {id:'policy',source:'derived',path:'evidence.policy'},
      {id:'side-effects',source:'derived',path:'evidence.sideEffects'},
      {id:'audit',source:'derived',path:'evidence.audit'},
    ],
    interventions:[
      {id:'retry-limit',actionType:'SET_RETRY_LIMIT',cost:1},
      {id:'timeout',actionType:'SET_TIMEOUT',cost:1},
      {id:'idempotency',actionType:'SET_IDEMPOTENCY',cost:2},
      {id:'approval',actionType:'SET_APPROVAL',cost:2},
      {id:'compensation',actionType:'SET_COMPENSATION',cost:1},
      {id:'terminal-verifier',actionType:'SET_TERMINAL_VERIFIER',cost:1},
    ],
    constraints:[
      {id:'duplicate-side-effect-veto',metric:'duplicateActionPercent',op:'<=',value:0.5,severity:'veto'},
      {id:'success-target',metric:'successPercent',op:'>=',value:92,severity:'target'},
      {id:'latency-budget',metric:'latencySeconds',op:'<=',value:11.5,severity:'budget'},
      {id:'cost-budget',metric:'costIndex',op:'<=',value:55,severity:'budget'},
      {id:'human-review-budget',metric:'humanReviewPercent',op:'<=',value:10,severity:'budget'},
    ],
    releaseDecisions:['SHIP','BLOCK','INCONCLUSIVE'],
    classifyOutcome(frame){
      const m=frame.derived.metrics;
      if(m.duplicateActionPercent>0.5)return 'DUPLICATE_SIDE_EFFECT';
      if(m.humanReviewPercent>10)return 'SAFE_BUT_TOO_MANUAL';
      if(m.successPercent<92)return 'SAFE_BUT_LOW_RECOVERY';
      if(m.latencySeconds>11.5)return 'SAFE_BUT_TOO_SLOW';
      if(m.costIndex>55)return 'SAFE_BUT_TOO_EXPENSIVE';
      return 'PRODUCTION_VIABLE';
    },
  });
})(typeof window!=='undefined'?window:globalThis);
