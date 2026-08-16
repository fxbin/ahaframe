(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before Broken RAG Pipeline Mission.');

  AhaFrame.registerMission({
    id:'broken-rag-pipeline',
    version:'0.8.0',
    scenarioId:'broken-rag-pipeline-scenario',
    chapterId:'retrieval-you-can-trust',
    interventionBudget:8,
    evidence:[
      {id:'incident',source:'derived',path:'evidence.incident'},
      {id:'retrieval-trace',source:'derived',path:'evidence.retrievalTrace'},
      {id:'documents',source:'derived',path:'evidence.documents'},
      {id:'context-composition',source:'derived',path:'evidence.contextComposition'},
      {id:'answer',source:'derived',path:'evidence.answer'},
    ],
    interventions:[
      {id:'retrieval-strategy',actionType:'SET_RETRIEVAL',cost:1},
      {id:'top-k',actionType:'SET_TOP_K',cost:1},
      {id:'rerank-depth',actionType:'SET_RERANK_DEPTH',cost:1},
      {id:'freshness-policy',actionType:'SET_FRESHNESS',cost:1},
      {id:'authority-policy',actionType:'SET_AUTHORITY',cost:1},
      {id:'compression-policy',actionType:'SET_COMPRESSION',cost:1},
    ],
    constraints:[
      {id:'stale-evidence-veto',metric:'staleEvidenceRiskPercent',op:'<=',value:15,severity:'veto'},
      {id:'authoritative-coverage',metric:'authoritativeCoveragePercent',op:'>=',value:100,severity:'target'},
      {id:'grounding',metric:'groundingScore',op:'>=',value:85,severity:'target'},
      {id:'context-budget',metric:'contextOverflowTokens',op:'<=',value:0,severity:'target'},
      {id:'latency-budget',metric:'latencyMs',op:'<=',value:850,severity:'budget'},
      {id:'cost-budget',metric:'costIndex',op:'<=',value:70,severity:'budget'},
    ],
    releaseDecisions:['SHIP','BLOCK','INCONCLUSIVE'],
    classifyOutcome(frame){
      const m=frame.derived.metrics;
      if(m.staleEvidenceRiskPercent>15)return 'STALE_AUTHORITY_FAILURE';
      if(m.contextOverflowTokens>0)return 'CONTEXT_OVERFLOW';
      if(m.authoritativeCoveragePercent<100||m.groundingScore<85)return 'INSUFFICIENT_EVIDENCE';
      if(m.latencyMs>850)return 'ACCURATE_BUT_TOO_SLOW';
      if(m.costIndex>70)return 'ACCURATE_BUT_TOO_EXPENSIVE';
      return 'PRODUCTION_VIABLE';
    },
  });
})(typeof window!=='undefined'?window:globalThis);
