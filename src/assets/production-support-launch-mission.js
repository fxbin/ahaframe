(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerMission!=='function')throw new Error('AhaFrame Mission Engine must load before Production Support Launch Mission.');

  AhaFrame.registerMission({
    id:'production-support-launch',
    version:'0.8.0',
    scenarioId:'reliable-support-agent',
    chapterId:'final-boss',
    interventionBudget:5,
    evidence:[
      {id:'release-scorecard',source:'derived',path:'metrics'},
      {id:'release-blockers',source:'derived',path:'blockerDetails'},
      {id:'tradeoff-warnings',source:'derived',path:'warningDetails'},
      {id:'prompt-evidence',source:'derived',path:'prompt.metrics'},
      {id:'context-evidence',source:'derived',path:'context.metrics'},
      {id:'runtime-evidence',source:'derived',path:'agent.metrics'},
      {id:'graph-evidence',source:'derived',path:'graph.metrics'},
      {id:'evaluation-evidence',source:'derived',path:'evaluation.metrics'},
    ],
    interventions:[
      {id:'prompt-policy',actionType:'SET_PROMPT_POLICY',cost:1},
      {id:'retrieval-policy',actionType:'SET_RETRIEVAL_POLICY',cost:1},
      {id:'context-policy',actionType:'SET_CONTEXT_POLICY',cost:1},
      {id:'execution-policy',actionType:'SET_EXECUTION_POLICY',cost:1},
      {id:'graph-policy',actionType:'SET_GRAPH_POLICY',cost:1},
      {id:'evaluation-policy',actionType:'SET_EVALUATION_POLICY',cost:1},
    ],
    constraints:[
      {id:'critical-safety-veto',path:'derived.safety',op:'>=',value:95,severity:'veto'},
      {id:'release-gate',path:'derived.decision',op:'==',value:'SHIP',severity:'target'},
      {id:'architecture-readiness',path:'derived.architectureScore',op:'>=',value:82,severity:'target'},
      {id:'context-budget',path:'derived.context.overflowTokens',op:'==',value:0,severity:'target'},
      {id:'latency-budget',path:'derived.latencyIndex',op:'<=',value:70,severity:'budget'},
      {id:'cost-budget',path:'derived.costIndex',op:'<=',value:75,severity:'budget'},
      {id:'approval-budget',path:'derived.graph.humanReviewsPer100',op:'<=',value:45,severity:'budget'},
    ],
    classifyOutcome(frame,_mission,constraints){
      const byId=Object.fromEntries(constraints.map((item)=>[item.id,item]));
      if(!byId['critical-safety-veto'].pass)return 'CRITICAL_SAFETY_VETO';
      if(frame.derived.decision==='BLOCK')return 'RELEASE_BLOCKED';
      if(frame.derived.decision==='INCONCLUSIVE')return 'EVIDENCE_INCONCLUSIVE';
      const budgetMiss=constraints.some((item)=>item.severity==='budget'&&!item.pass);
      if(budgetMiss)return 'VIABLE_BUT_OUTSIDE_OPERATING_BUDGET';
      if(!byId['release-gate'].pass||!byId['architecture-readiness'].pass||!byId['context-budget'].pass)return 'CONSTRAINT_MISS';
      return frame.state.evaluationPolicy==='safety'?'PRODUCTION_VIABLE_SAFETY_HEAVY':'PRODUCTION_VIABLE_BALANCED';
    },
  });
})(typeof window!=='undefined'?window:globalThis);
