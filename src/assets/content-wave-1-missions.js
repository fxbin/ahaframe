(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before Content Wave 1 missions.');

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
      ...definition,
    });
  }

  register({
    id:'ai-code-review-mission',
    scenarioId:'ai-code-review-scenario',
    chapterId:'vibe-coding',
    interventions:[
      {id:'review-depth',actionType:'SET_REVIEW_DEPTH',cost:2},
      {id:'test-strategy',actionType:'SET_TEST_STRATEGY',cost:2},
      {id:'scope-policy',actionType:'SET_SCOPE_POLICY',cost:2},
      {id:'dependency-check',actionType:'SET_DEPENDENCY_CHECK',cost:1},
    ],
    constraints:[
      {id:'architecture-veto',metric:'architectureDriftPercent',op:'<=',value:10,severity:'veto'},
      {id:'regression-target',metric:'regressionRiskPercent',op:'<=',value:12,severity:'target'},
      {id:'test-evidence-target',metric:'testEvidenceScore',op:'>=',value:78,severity:'target'},
      {id:'review-time-budget',metric:'reviewMinutes',op:'<=',value:28,severity:'budget'},
      {id:'merge-confidence-target',metric:'mergeConfidenceScore',op:'>=',value:75,severity:'target'},
    ],
    classifyOutcome(frame){return frame.derived.diagnosisCode;},
  });

  register({
    id:'research-evidence-mission',
    scenarioId:'research-evidence-scenario',
    chapterId:'research-with-ai',
    interventions:[
      {id:'source-mix',actionType:'SET_SOURCE_MIX',cost:2},
      {id:'triangulation',actionType:'SET_TRIANGULATION',cost:2},
      {id:'claim-matrix',actionType:'SET_CLAIM_MATRIX',cost:2},
      {id:'freshness-check',actionType:'SET_FRESHNESS_CHECK',cost:1},
    ],
    constraints:[
      {id:'unsupported-claim-veto',metric:'unsupportedClaimRiskPercent',op:'<=',value:12,severity:'veto'},
      {id:'freshness-veto',metric:'staleEvidenceRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'source-diversity-target',metric:'sourceDiversityScore',op:'>=',value:65,severity:'target'},
      {id:'verifiability-target',metric:'verifiabilityScore',op:'>=',value:78,severity:'target'},
      {id:'time-budget',metric:'researchMinutes',op:'<=',value:50,severity:'budget'},
    ],
    classifyOutcome(frame){return frame.derived.diagnosisCode;},
  });

  register({
    id:'data-analysis-verification-lab',
    scenarioId:'data-analysis-verification-scenario',
    chapterId:'data-analysis-with-ai',
    interventions:[
      {id:'extraction-mode',actionType:'SET_EXTRACTION_MODE',cost:2},
      {id:'numeric-check',actionType:'SET_NUMERIC_CHECK',cost:2},
      {id:'outlier-policy',actionType:'SET_OUTLIER_POLICY',cost:1},
      {id:'confidence-policy',actionType:'SET_CONFIDENCE_POLICY',cost:1},
    ],
    constraints:[
      {id:'analysis-error-veto',metric:'analysisErrorRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'verified-rows-target',metric:'verifiedRowsPercent',op:'>=',value:75,severity:'target'},
      {id:'coverage-target',metric:'coveragePercent',op:'>=',value:82,severity:'target'},
      {id:'uncertainty-target',metric:'confidenceVariancePercent',op:'<=',value:15,severity:'target'},
      {id:'review-time-budget',metric:'reviewMinutes',op:'<=',value:40,severity:'budget'},
    ],
    classifyOutcome(frame){return frame.derived.diagnosisCode;},
  });
})(typeof window!=='undefined'?window:globalThis);
