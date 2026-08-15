(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before Prompt Injection Attack Mission.');

  AhaFrame.registerMission({
    id:'prompt-injection-attack',
    version:'0.8.0',
    scenarioId:'prompt-injection-attack-scenario',
    chapterId:'survive-a-security-incident',
    interventionBudget:8,
    evidence:[
      {id:'context-provenance',source:'derived',path:'evidence.contextProvenance'},
      {id:'attack-matrix',source:'derived',path:'evidence.attackMatrix'},
      {id:'permission-scopes',source:'derived',path:'evidence.permissionScopes'},
      {id:'planned-tool-calls',source:'derived',path:'evidence.plannedToolCalls'},
      {id:'policy-trace',source:'derived',path:'evidence.policyDecisionTrace'},
      {id:'policy',source:'derived',path:'evidence.policy'},
    ],
    interventions:[
      {id:'trust-policy',actionType:'SET_TRUST_POLICY',cost:2},
      {id:'tool-scope',actionType:'SET_TOOL_SCOPE',cost:1},
      {id:'approval',actionType:'SET_APPROVAL',cost:2},
      {id:'runtime-gate',actionType:'SET_RUNTIME_GATE',cost:2},
      {id:'data-filter',actionType:'SET_DATA_FILTER',cost:1},
      {id:'result-validator',actionType:'SET_RESULT_VALIDATOR',cost:1},
    ],
    constraints:[
      {id:'security-risk-veto',metric:'securityRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'task-success-target',metric:'taskSuccessPercent',op:'>=',value:80,severity:'target'},
      {id:'false-positive-budget',metric:'falsePositivePercent',op:'<=',value:20,severity:'budget'},
      {id:'human-review-budget',metric:'humanReviewPercent',op:'<=',value:15,severity:'budget'},
      {id:'latency-budget',metric:'latencyMs',op:'<=',value:1000,severity:'budget'},
    ],
    releaseDecisions:['SHIP','BLOCK','INCONCLUSIVE'],
    classifyOutcome(frame){
      const m=frame.derived.metrics;
      if(m.securityRiskPercent>10)return 'SECURITY_VETO';
      if(m.taskSuccessPercent<80||m.falsePositivePercent>20)return 'SAFE_BUT_OVERBLOCKING';
      if(m.humanReviewPercent>15)return 'SAFE_BUT_TOO_MANUAL';
      if(m.latencyMs>1000)return 'SAFE_BUT_TOO_SLOW';
      return 'PRODUCTION_VIABLE';
    },
  });
})(typeof window!=='undefined'?window:globalThis);
