(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before Content Wave 2 missions.');

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
    id:'structured-output-contract-lab',scenarioId:'structured-output-contract-scenario',chapterId:'llm-application-engineering',
    interventions:[
      {id:'contract',actionType:'SET_CONTRACT',cost:2},
      {id:'validation',actionType:'SET_VALIDATION',cost:2},
      {id:'repair',actionType:'SET_REPAIR',cost:2},
      {id:'streaming',actionType:'SET_STREAMING_CONTRACT',cost:1},
    ],
    constraints:[
      {id:'malformed-output-veto',metric:'malformedOutputRiskPercent',op:'<=',value:8,severity:'veto'},
      {id:'semantic-contract-veto',metric:'semanticContractRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'coverage-target',metric:'contractCoverageScore',op:'>=',value:80,severity:'target'},
      {id:'retry-budget',metric:'retryAmplification',op:'<=',value:2,severity:'budget'},
      {id:'latency-budget',metric:'latencyMs',op:'<=',value:1300,severity:'budget'},
    ],
  });

  register({
    id:'mcp-capability-boundary-mission',scenarioId:'mcp-capability-boundary-scenario',chapterId:'agent-engineering',
    interventions:[
      {id:'discovery',actionType:'SET_MCP_DISCOVERY',cost:1},
      {id:'authorization',actionType:'SET_MCP_AUTH',cost:2},
      {id:'sideEffects',actionType:'SET_MCP_SIDE_EFFECTS',cost:2},
      {id:'longWork',actionType:'SET_MCP_LONG_WORK',cost:1},
    ],
    constraints:[
      {id:'authorization-veto',metric:'unauthorizedCapabilityRiskPercent',op:'<=',value:8,severity:'veto'},
      {id:'blast-radius-veto',metric:'blastRadiusScore',op:'<=',value:18,severity:'veto'},
      {id:'audit-target',metric:'auditCoverageScore',op:'>=',value:80,severity:'target'},
      {id:'drift-target',metric:'capabilityDriftPercent',op:'<=',value:12,severity:'target'},
      {id:'operator-friction-budget',metric:'operatorFrictionScore',op:'<=',value:38,severity:'budget'},
    ],
  });

  register({
    id:'long-running-agent-recovery-mission',scenarioId:'long-running-agent-recovery-scenario',chapterId:'agent-engineering',
    interventions:[
      {id:'persistence',actionType:'SET_PERSISTENCE',cost:2},
      {id:'idempotency',actionType:'SET_LONG_IDEMPOTENCY',cost:2},
      {id:'resume',actionType:'SET_RESUME',cost:2},
      {id:'cancellation',actionType:'SET_CANCELLATION',cost:1},
    ],
    constraints:[
      {id:'state-loss-veto',metric:'stateLossRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'duplicate-work-veto',metric:'duplicateWorkRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'recovery-target',metric:'recoveryScore',op:'>=',value:85,severity:'target'},
      {id:'cancel-latency-target',metric:'cancelLatencySeconds',op:'<=',value:60,severity:'target'},
      {id:'cost-budget',metric:'costIndex',op:'<=',value:120,severity:'budget'},
    ],
  });

  register({
    id:'write-book-with-ai-build',scenarioId:'write-book-with-ai-scenario',chapterId:'write-a-book-with-ai',
    interventions:[
      {id:'research',actionType:'SET_BOOK_RESEARCH',cost:2},
      {id:'outline',actionType:'SET_BOOK_OUTLINE',cost:1},
      {id:'context',actionType:'SET_BOOK_CONTEXT',cost:2},
      {id:'verification',actionType:'SET_BOOK_VERIFICATION',cost:2},
    ],
    constraints:[
      {id:'claim-veto',metric:'unsupportedClaimRiskPercent',op:'<=',value:8,severity:'veto'},
      {id:'consistency-veto',metric:'consistencyDriftPercent',op:'<=',value:10,severity:'veto'},
      {id:'source-trace-target',metric:'sourceTraceabilityScore',op:'>=',value:80,severity:'target'},
      {id:'editorial-target',metric:'editorialConsistencyScore',op:'>=',value:75,severity:'target'},
      {id:'revision-budget',metric:'revisionHours',op:'<=',value:35,severity:'budget'},
    ],
  });

  register({
    id:'knowledge-base-build',scenarioId:'knowledge-base-build-scenario',chapterId:'build-ai-knowledge-base',
    interventions:[
      {id:'ingestion',actionType:'SET_KB_INGESTION',cost:2},
      {id:'retrieval',actionType:'SET_KB_RETRIEVAL',cost:2},
      {id:'freshness',actionType:'SET_KB_FRESHNESS',cost:1},
      {id:'evaluation',actionType:'SET_KB_EVALUATION',cost:2},
    ],
    constraints:[
      {id:'staleness-veto',metric:'staleAnswerRiskPercent',op:'<=',value:10,severity:'veto'},
      {id:'retrieval-target',metric:'retrievalQualityScore',op:'>=',value:80,severity:'target'},
      {id:'authority-target',metric:'authorityAlignmentScore',op:'>=',value:75,severity:'target'},
      {id:'update-budget',metric:'updateLatencyHours',op:'<=',value:60,severity:'budget'},
      {id:'evaluation-target',metric:'evaluationCoverageScore',op:'>=',value:70,severity:'target'},
    ],
  });

  register({
    id:'customer-support-build',scenarioId:'customer-support-build-scenario',chapterId:'ai-customer-support',
    interventions:[
      {id:'grounding',actionType:'SET_SUPPORT_GROUNDING',cost:2},
      {id:'tools',actionType:'SET_SUPPORT_TOOLS',cost:2},
      {id:'autonomy',actionType:'SET_SUPPORT_AUTONOMY',cost:2},
      {id:'escalation',actionType:'SET_SUPPORT_ESCALATION',cost:1},
    ],
    constraints:[
      {id:'unsafe-action-veto',metric:'incorrectActionRiskPercent',op:'<=',value:8,severity:'veto'},
      {id:'resolution-target',metric:'resolutionScore',op:'>=',value:75,severity:'target'},
      {id:'human-load-budget',metric:'escalationLoadScore',op:'<=',value:45,severity:'budget'},
      {id:'audit-target',metric:'auditCoverageScore',op:'>=',value:80,severity:'target'},
      {id:'cost-budget',metric:'costIndex',op:'<=',value:70,severity:'budget'},
    ],
  });

  register({
    id:'course-knowledge-product-build',scenarioId:'course-knowledge-product-scenario',chapterId:'course-knowledge-product',
    interventions:[
      {id:'objectives',actionType:'SET_COURSE_OBJECTIVES',cost:1},
      {id:'curriculum',actionType:'SET_CURRICULUM_MODEL',cost:2},
      {id:'editorial',actionType:'SET_EDITORIAL_REVIEW',cost:2},
      {id:'provenance',actionType:'SET_CONTENT_PROVENANCE',cost:2},
    ],
    constraints:[
      {id:'objective-target',metric:'objectiveCoverageScore',op:'>=',value:75,severity:'target'},
      {id:'curriculum-target',metric:'curriculumCoherenceScore',op:'>=',value:75,severity:'target'},
      {id:'editorial-veto',metric:'editorialDriftPercent',op:'<=',value:10,severity:'veto'},
      {id:'media-veto',metric:'mediaDefectPercent',op:'<=',value:10,severity:'veto'},
      {id:'provenance-target',metric:'provenanceCoverageScore',op:'>=',value:80,severity:'target'},
      {id:'production-budget',metric:'productionHours',op:'<=',value:45,severity:'budget'},
    ],
  });
})(typeof window!=='undefined'?window:globalThis);
