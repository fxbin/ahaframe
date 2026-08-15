(function(root){
  'use strict';
  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before the integrated Build scenario.');
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

  const PROMPT={
    loose:{label:'Loose instruction contract',state:{authorityModel:'flat',systemSpecificity:'vague',retrievedContentMode:'instructional',schemaMode:'loose',policyAmbiguity:'high'}},
    scoped:{label:'Scoped authority',state:{authorityModel:'hierarchical',systemSpecificity:'explicit',retrievedContentMode:'data-only',schemaMode:'loose',policyAmbiguity:'resolved'}},
    typed:{label:'Typed prompt contract',state:{authorityModel:'hierarchical',systemSpecificity:'explicit',retrievedContentMode:'data-only',schemaMode:'strict',policyAmbiguity:'resolved'}},
  };
  const RETRIEVAL={
    cheap:{label:'Cheap vector search',state:{chunkSize:700,overlap:50,topK:3,retrieval:'vector',reranker:false,contextBudget:8000}},
    balanced:{label:'Balanced hybrid + rerank',state:{chunkSize:600,overlap:100,topK:5,retrieval:'hybrid',reranker:true,contextBudget:8000}},
    recall:{label:'Recall-heavy hybrid',state:{chunkSize:600,overlap:150,topK:9,retrieval:'hybrid',reranker:true,contextBudget:8000}},
  };
  const CONTEXT={
    lean:{label:'Lean context',state:{compressionRatio:72,summaryDepth:'shallow',retrievalBudget:1600,memoryBudget:600,protectCritical:false}},
    balanced:{label:'Balanced protected context',state:{compressionRatio:58,summaryDepth:'balanced',retrievalBudget:3000,memoryBudget:900,protectCritical:true}},
    rich:{label:'Rich context',state:{compressionRatio:38,summaryDepth:'deep',retrievalBudget:4200,memoryBudget:1800,protectCritical:true}},
  };
  const EXECUTION={
    fast:{label:'Fast bounded loop',state:{maxSteps:6,retryLimit:1,timeoutSec:4,validation:false,humanApproval:false,termination:'bounded'}},
    autonomous:{label:'Validated autonomous loop',state:{maxSteps:10,retryLimit:3,timeoutSec:8,validation:true,humanApproval:false,termination:'goal-aware'}},
    bounded:{label:'Bounded + approval',state:{maxSteps:8,retryLimit:2,timeoutSec:6,validation:true,humanApproval:true,termination:'goal-aware'}},
  };
  const GRAPH={
    simple:{label:'Simple single-loop graph',state:{topology:'single-agent',agentCount:1,parallelism:1,stateMode:'isolated',retryScope:'node',joinStrategy:'verified',humanGate:'none'}},
    bounded:{label:'Bounded branched graph',state:{topology:'branched',agentCount:3,parallelism:2,stateMode:'isolated',retryScope:'node',joinStrategy:'verified',humanGate:'before-refund'}},
    complex:{label:'Coordinator-heavy graph',state:{topology:'coordinator',agentCount:5,parallelism:4,stateMode:'shared',retryScope:'graph',joinStrategy:'first',humanGate:'none'}},
  };
  const EVALUATION={
    demo:{label:'Demo-biased evaluation',state:{datasetPreset:'demo-biased',passThreshold:80,safetyVeto:false,sampleSize:50,judgeMode:'rubric',costGate:false}},
    production:{label:'Production evaluation',state:{datasetPreset:'production-like',passThreshold:82,safetyVeto:true,sampleSize:200,judgeMode:'mixed',costGate:true}},
    safety:{label:'Safety-heavy evaluation',state:{datasetPreset:'safety-heavy',passThreshold:84,safetyVeto:true,sampleSize:500,judgeMode:'mixed',costGate:true}},
  };
  const REFERENCE={promptPolicy:'typed',retrievalPolicy:'balanced',contextPolicy:'balanced',executionPolicy:'bounded',graphPolicy:'bounded',evaluationPolicy:'production'};

  function derived(id,state){
    const scenario=AhaFrame.getLabScenario(id);
    if(!scenario||typeof scenario.derive!=='function')throw new Error(`Integrated Build requires scenario: ${id}`);
    return scenario.derive(state);
  }
  function choose(group,value,label){if(!group[value])throw new RangeError(`${label} must be one of: ${Object.keys(group).join(', ')}.`);}

  AhaFrame.registerLabScenario({
    id:'reliable-support-agent',version:'2.0.0',title:'Reliable Support Agent Build',
    initialState:{promptPolicy:'loose',retrievalPolicy:'balanced',contextPolicy:'balanced',executionPolicy:'autonomous',graphPolicy:'complex',evaluationPolicy:'demo'},
    reduce(state,action){
      const map={SET_PROMPT_POLICY:[PROMPT,'promptPolicy','Prompt policy'],SET_RETRIEVAL_POLICY:[RETRIEVAL,'retrievalPolicy','Retrieval policy'],SET_CONTEXT_POLICY:[CONTEXT,'contextPolicy','Context policy'],SET_EXECUTION_POLICY:[EXECUTION,'executionPolicy','Execution policy'],SET_GRAPH_POLICY:[GRAPH,'graphPolicy','Graph policy'],SET_EVALUATION_POLICY:[EVALUATION,'evaluationPolicy','Evaluation policy']};
      if(action.type==='APPLY_REFERENCE_ARCHITECTURE')return {...REFERENCE};
      const config=map[action.type];
      if(!config)throw new Error(`Unsupported reliable-support-agent action: ${action.type}`);
      const [group,key,label]=config; const value=action.payload?.value; choose(group,value,label); return {...state,[key]:value};
    },
    derive(state){
      const prompt=derived('instruction-conflict',PROMPT[state.promptPolicy].state);
      const rag=derived('rag-failure',RETRIEVAL[state.retrievalPolicy].state);
      const context=derived('context-compression',CONTEXT[state.contextPolicy].state);
      const agent=derived('agent-reliability',EXECUTION[state.executionPolicy].state);
      const graph=derived('agent-workflow-graph',GRAPH[state.graphPolicy].state);
      const evaluation=derived('evaluation-failure',EVALUATION[state.evaluationPolicy].state);

      const taskReadiness=clamp(prompt.instructionAdherence*0.15+rag.qualityScore*0.25+context.taskQuality*0.20+agent.successRate*100*0.25+graph.successRate*100*0.15,0,100);
      const reliability=clamp(prompt.promptQuality*0.10+rag.precision*100*0.15+context.criticalRetentionPercent*0.15+agent.reliabilityScore*0.35+graph.reliability*100*0.25,0,100);
      const safety=clamp(100-(prompt.policyViolationRisk*0.25+agent.unsafeActionRisk*100*0.40+graph.unsafeActionRisk*100*0.35),0,100);
      const latencyIndex=clamp(rag.latencyMs/10*0.20+context.latencyIndex*0.20+agent.latencySeconds*2.0*0.30+graph.latencySeconds*2.0*0.30,0,150);
      const costIndex=clamp(rag.costIndex*0.20+context.costIndex*0.20+agent.costIndex*0.30+graph.costIndex*0.30,0,150);
      const architectureScore=clamp(taskReadiness*0.35+reliability*0.35+safety*0.30,0,100);
      const evalPolicy=EVALUATION[state.evaluationPolicy].state;
      const productionCoverage=state.evaluationPolicy!=='demo';
      const blockers=[]; const warnings=[]; const blockerDetails=[]; const warningDetails=[];
      const block=(code,text,params={})=>{blockers.push(text);blockerDetails.push({code,params});};
      const warn=(code,text,params={})=>{warnings.push(text);warningDetails.push({code,params});};

      if(prompt.conflictCount>0)block('prompt-conflicts',`Prompt contract still has ${prompt.conflictCount} unresolved conflict(s).`,{count:prompt.conflictCount});
      if(context.overflowTokens>0)block('context-overflow',`Context exceeds the fixed working budget by ${context.overflowTokens.toLocaleString()} tokens.`,{tokens:context.overflowTokens});
      if(graph.failurePropagationRisk>0.25)block('graph-propagation',`Graph failure propagation is ${(graph.failurePropagationRisk*100).toFixed(0)}%, above the modeled architecture limit.`,{percent:Number((graph.failurePropagationRisk*100).toFixed(0))});
      if(agent.runawayRisk>0.15)block('loop-runaway',`Loop runaway risk is ${(agent.runawayRisk*100).toFixed(1)}%, above the modeled execution limit.`,{percent:Number((agent.runawayRisk*100).toFixed(1))});
      if(architectureScore<evalPolicy.passThreshold)block('architecture-threshold',`Architecture score ${architectureScore.toFixed(1)} is below the ${evalPolicy.passThreshold} release threshold.`,{score:Number(architectureScore.toFixed(1)),threshold:evalPolicy.passThreshold});
      if(evalPolicy.safetyVeto&&safety<95)block('safety-floor',`Safety readiness ${safety.toFixed(1)} is below the 95-point consequential-action floor.`,{score:Number(safety.toFixed(1)),floor:95});
      if(productionCoverage&&rag.recall*100<80)block('retrieval-recall-floor',`Retrieval recall ${(rag.recall*100).toFixed(1)}% is below the production evidence floor.`,{recall:Number((rag.recall*100).toFixed(1)),floor:80});
      if(productionCoverage&&context.criticalRetentionPercent<80)block('critical-retention-floor',`Critical context retention ${context.criticalRetentionPercent.toFixed(1)}% is below the production floor.`,{retention:Number(context.criticalRetentionPercent.toFixed(1)),floor:80});
      if(evalPolicy.costGate&&costIndex>75)block('cost-budget',`Cost index ${costIndex.toFixed(1)} exceeds the configured budget of 75.`,{cost:Number(costIndex.toFixed(1)),limit:75});

      if(!prompt.promptClosed)warn('prompt-open','Prompt authority is not fully closed; better runtime controls cannot repair an ambiguous instruction contract.');
      if(graph.coordinationOverhead>55)warn('graph-coordination',`Graph coordination overhead is ${graph.coordinationOverhead.toFixed(0)}; simplify unless the decomposition creates measured value.`,{value:Number(graph.coordinationOverhead.toFixed(0))});
      if(agent.humanReviewsPer100>35)warn('approval-load',`Approval improves control but creates about ${agent.humanReviewsPer100} reviews per 100 modeled runs.`,{reviews:agent.humanReviewsPer100});
      if(state.evaluationPolicy==='demo')warn('demo-evaluation','Demo evaluation underweights production-tail failures; a positive dashboard is weak release evidence.');
      if(context.savingsPercent<25)warn('weak-context-economics','Context quality is strong but context economics are weak.');

      const evidenceMargin=architectureScore-evalPolicy.passThreshold;
      let decision='SHIP';
      if(blockers.length)decision='BLOCK';
      else if(evidenceMargin<evaluation.confidenceWidth)decision='INCONCLUSIVE';
      let diagnosis='The architecture clears the modeled gate. Its remaining trade-offs are visible rather than hidden.';
      if(decision==='BLOCK')diagnosis=`Release blocked: ${blockers[0]}`;
      else if(decision==='INCONCLUSIVE')diagnosis='The architecture is plausible, but the modeled evidence margin is narrower than the evaluation evidence width.';
      const diagnosisCode=decision==='BLOCK'?'blocked':decision==='INCONCLUSIVE'?'inconclusive':'healthy';

      const labels={prompt:PROMPT[state.promptPolicy].label,retrieval:RETRIEVAL[state.retrievalPolicy].label,context:CONTEXT[state.contextPolicy].label,execution:EXECUTION[state.executionPolicy].label,graph:GRAPH[state.graphPolicy].label,evaluation:EVALUATION[state.evaluationPolicy].label};
      const tradeoffs=[
        `Prompt — ${labels.prompt}: ${prompt.promptQuality.toFixed(0)} quality / ${prompt.policyViolationRisk.toFixed(0)}% policy risk.`,
        `Context — ${labels.retrieval} + ${labels.context}: ${(rag.recall*100).toFixed(1)}% recall / ${context.criticalRetentionPercent.toFixed(1)}% critical retention.`,
        `Harness + Loop — ${labels.execution}: ${(agent.successRate*100).toFixed(1)}% success / ${(agent.runawayRisk*100).toFixed(1)}% runaway risk.`,
        `Graph — ${labels.graph}: ${(graph.failurePropagationRisk*100).toFixed(0)}% failure propagation / ${graph.coordinationOverhead.toFixed(0)} coordination.`,
        `Evaluation — ${labels.evaluation}: ${evaluation.confidenceWidth.toFixed(1)}-point evidence width / ${evalPolicy.safetyVeto?'safety veto':'no safety veto'}.`,
      ];
      return {labels,prompt,rag,context,agent,graph,evaluation,taskReadiness,reliability,safety,latencyIndex,costIndex,architectureScore,blockers,warnings,blockerDetails,warningDetails,tradeoffs,decision,diagnosis,diagnosisCode,metrics:{taskReadiness,reliability,safety,latencyIndex,costIndex,architectureScore,blockerCount:blockers.length,warningCount:warnings.length}};
    },
  });
})(typeof window!=='undefined'?window:globalThis);
