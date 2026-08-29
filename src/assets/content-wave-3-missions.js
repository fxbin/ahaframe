(function(root){
  'use strict';
  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before Content Wave 3 missions.');

  function register(definition){
    AhaFrame.registerMission({
      version:'1.0.0',
      interventionBudget:8,
      evidence:[
        {id:'brief',source:'derived',path:'evidence.brief'},
        {id:'artifacts',source:'derived',path:'evidence.artifacts'},
        {id:'signals',source:'derived',path:'evidence.signals'},
        {id:'policy',source:'derived',path:'evidence.policy'},
        {id:'audit',source:'derived',path:'evidence.audit'},
      ],
      releaseDecisions:['SHIP','BLOCK','INCONCLUSIVE'],
      classifyOutcome(frame){return frame.derived.diagnosisCode;},
      ...definition,
    });
  }

  register({
    id:'multi-agent-coordination-incident',scenarioId:'multi-agent-coordination-scenario',chapterId:'multi-agent-orchestration',
    interventions:[
      {id:'delegation',actionType:'SET_MULTI_AGENT_DELEGATION',cost:2},
      {id:'state',actionType:'SET_MULTI_AGENT_STATE',cost:2},
      {id:'verification',actionType:'SET_MULTI_AGENT_VERIFICATION',cost:2},
      {id:'parallelism',actionType:'SET_MULTI_AGENT_PARALLELISM',cost:1},
    ],
    constraints:[
      {id:'coordination-veto',metric:'coordinationRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'coverage-target',metric:'taskCoverageScore',op:'>=',value:85,severity:'target'},
      {id:'independent-verification-target',metric:'independentVerificationScore',op:'>=',value:80,severity:'target'},
      {id:'overhead-budget',metric:'coordinationOverheadIndex',op:'<=',value:150,severity:'budget'},
      {id:'latency-budget',metric:'latencyMs',op:'<=',value:1300,severity:'budget'},
    ],
  });

  register({
    id:'production-release-gate-build',scenarioId:'production-release-gate-scenario',chapterId:'production-ai-reliability',
    interventions:[
      {id:'evaluation',actionType:'SET_RELEASE_EVALUATION',cost:2},
      {id:'rollout',actionType:'SET_RELEASE_ROLLOUT',cost:2},
      {id:'observability',actionType:'SET_RELEASE_OBSERVABILITY',cost:2},
      {id:'fallback',actionType:'SET_RELEASE_FALLBACK',cost:1},
    ],
    constraints:[
      {id:'release-risk-veto',metric:'releaseFailureRiskPercent',op:'<=',value:8,severity:'veto'},
      {id:'evaluation-evidence-veto',metric:'evaluationEvidenceScore',op:'>=',value:80,severity:'veto'},
      {id:'observability-veto',metric:'observabilityCoverageScore',op:'>=',value:80,severity:'veto'},
      {id:'rollback-veto',metric:'rollbackReadinessScore',op:'>=',value:80,severity:'veto'},
      {id:'exposure-veto',metric:'changeExposurePercent',op:'<=',value:40,severity:'veto'},
      {id:'release-cost-budget',metric:'releaseCostIndex',op:'<=',value:90,severity:'budget'},
    ],
  });

  register({
    id:'model-adaptation-decision-lab',scenarioId:'model-adaptation-decision-scenario',chapterId:'model-engineering',
    interventions:[
      {id:'baseline',actionType:'SET_ADAPTATION_BASELINE',cost:1},
      {id:'dataset',actionType:'SET_ADAPTATION_DATASET',cost:2},
      {id:'method',actionType:'SET_ADAPTATION_METHOD',cost:2},
      {id:'serving',actionType:'SET_ADAPTATION_SERVING',cost:1},
    ],
    constraints:[
      {id:'task-gap-veto',metric:'residualTaskGapPercent',op:'<=',value:8,severity:'veto'},
      {id:'evidence-target',metric:'adaptationEvidenceScore',op:'>=',value:80,severity:'target'},
      {id:'dataset-veto',metric:'dataQualityScore',op:'>=',value:75,severity:'veto'},
      {id:'serving-complexity-budget',metric:'servingComplexityScore',op:'<=',value:55,severity:'budget'},
      {id:'unit-cost-budget',metric:'unitCostIndex',op:'<=',value:90,severity:'budget'},
    ],
  });

  register({
    id:'solo-business-operating-system-build',scenarioId:'solo-business-operating-system-scenario',chapterId:'solo-business-ai',
    interventions:[
      {id:'research',actionType:'SET_SOLO_RESEARCH',cost:1},
      {id:'workflow',actionType:'SET_SOLO_WORKFLOW',cost:2},
      {id:'automation',actionType:'SET_SOLO_AUTOMATION',cost:2},
      {id:'review',actionType:'SET_SOLO_REVIEW',cost:1},
    ],
    constraints:[
      {id:'customer-evidence-target',metric:'customerEvidenceScore',op:'>=',value:75,severity:'target'},
      {id:'automation-risk-veto',metric:'automationFailureRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'support-load-budget',metric:'supportLoadScore',op:'<=',value:45,severity:'budget'},
      {id:'maintenance-budget',metric:'maintenanceHoursPerWeek',op:'<=',value:32,severity:'budget'},
      {id:'founder-leverage-target',metric:'founderLeverageScore',op:'>=',value:70,severity:'target'},
    ],
  });
})(typeof window!=='undefined'?window:globalThis);
