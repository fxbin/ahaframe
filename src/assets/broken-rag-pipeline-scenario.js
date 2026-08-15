(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before Broken RAG Pipeline scenario.');

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const CONTEXT_BUDGET=6000;
  const DOCUMENTS=Object.freeze([
    {id:'refund-policy-v2',title:'Refund Policy v2',kind:'policy',ageDays:92,current:false,authority:0.72,vector:0.96,lexical:0.82,relevance:1.00,tokens:1120,answer:'30 days'},
    {id:'refund-policy-v3',title:'Refund Policy v3',kind:'policy',ageDays:2,current:true,authority:1.00,vector:0.84,lexical:0.95,relevance:1.00,tokens:1260,answer:'45 days'},
    {id:'refund-faq-legacy',title:'Refund FAQ — legacy',kind:'faq',ageDays:180,current:false,authority:0.45,vector:0.90,lexical:0.74,relevance:0.86,tokens:880,answer:'30 days'},
    {id:'refund-procedure',title:'Refund Operations Procedure',kind:'procedure',ageDays:20,current:true,authority:0.82,vector:0.78,lexical:0.88,relevance:0.82,tokens:1040,answer:null},
    {id:'shipping-policy',title:'Shipping Policy',kind:'policy',ageDays:4,current:true,authority:0.90,vector:0.72,lexical:0.91,relevance:0.22,tokens:980,answer:null},
    {id:'chargeback-guide',title:'Chargeback Guide',kind:'guide',ageDays:35,current:true,authority:0.76,vector:0.75,lexical:0.79,relevance:0.34,tokens:930,answer:null},
  ]);

  const COMPRESSION={
    none:{tokenFactor:1,retention:1,label:'none'},
    balanced:{tokenFactor:0.72,retention:0.96,label:'balanced'},
    aggressive:{tokenFactor:0.42,retention:0.72,label:'aggressive'},
  };

  function initialScore(doc,state){
    const retrieval=state.retrieval==='hybrid'?doc.vector*0.55+doc.lexical*0.45:doc.vector;
    const freshnessPenalty=state.freshness==='soft'?Math.min(0.14,doc.ageDays/180*0.14):0;
    const authorityBonus=state.authority==='source-priority'?doc.authority*0.12+(doc.current?0.08:0):0;
    return retrieval-freshnessPenalty+authorityBonus;
  }

  function buildRanking(state){
    let candidates=DOCUMENTS
      .filter((doc)=>!(state.freshness==='strict'&&!doc.current&&doc.ageDays>60))
      .map((doc)=>({...doc,initialScore:initialScore(doc,state)}))
      .sort((a,b)=>b.initialScore-a.initialScore);

    if(state.rerankDepth>0){
      const depth=Math.min(state.rerankDepth,candidates.length);
      const head=candidates.slice(0,depth).map((doc)=>({
        ...doc,
        rerankScore:doc.initialScore*0.55+doc.relevance*0.25+doc.authority*0.12+(doc.current?0.08:0),
      })).sort((a,b)=>b.rerankScore-a.rerankScore);
      candidates=[...head,...candidates.slice(depth)];
    }

    return candidates.map((doc,index)=>({...doc,rank:index+1,selected:index<state.topK}));
  }

  AhaFrame.registerLabScenario({
    id:'broken-rag-pipeline-scenario',
    version:'0.8.0',
    title:'The Broken RAG Pipeline',
    initialState:{
      retrieval:'vector',
      topK:5,
      rerankDepth:0,
      freshness:'off',
      authority:'score-only',
      compression:'none',
    },
    reduce(state,action){
      switch(action.type){
        case 'SET_RETRIEVAL': {
          const value=action.payload?.value;
          if(!['vector','hybrid'].includes(value))throw new RangeError('retrieval must be vector or hybrid');
          return {...state,retrieval:value};
        }
        case 'SET_TOP_K': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<2||value>8)throw new RangeError('topK must be an integer between 2 and 8');
          return {...state,topK:value};
        }
        case 'SET_RERANK_DEPTH': {
          const value=Number(action.payload?.value);
          if(![0,4,6].includes(value))throw new RangeError('rerankDepth must be 0, 4, or 6');
          return {...state,rerankDepth:value};
        }
        case 'SET_FRESHNESS': {
          const value=action.payload?.value;
          if(!['off','soft','strict'].includes(value))throw new RangeError('freshness must be off, soft, or strict');
          return {...state,freshness:value};
        }
        case 'SET_AUTHORITY': {
          const value=action.payload?.value;
          if(!['score-only','source-priority'].includes(value))throw new RangeError('authority must be score-only or source-priority');
          return {...state,authority:value};
        }
        case 'SET_COMPRESSION': {
          const value=action.payload?.value;
          if(!COMPRESSION[value])throw new RangeError('compression must be none, balanced, or aggressive');
          return {...state,compression:value};
        }
        default:
          throw new Error(`Unsupported broken-rag-pipeline action: ${action.type}`);
      }
    },
    derive(state){
      const ranking=buildRanking(state);
      const selected=ranking.filter((doc)=>doc.selected);
      const compression=COMPRESSION[state.compression];
      const contextTokens=Math.round(selected.reduce((sum,doc)=>sum+doc.tokens,0)*compression.tokenFactor);
      const contextOverflowTokens=Math.max(0,contextTokens-CONTEXT_BUDGET);
      const authoritative=selected.find((doc)=>doc.id==='refund-policy-v3')||null;
      const answerSource=selected.find((doc)=>doc.answer)||null;
      const answerCorrect=answerSource?.id==='refund-policy-v3';
      const staleSelected=selected.filter((doc)=>!doc.current&&doc.answer);

      let staleEvidenceRiskPercent=5;
      if(!answerCorrect)staleEvidenceRiskPercent=82;
      else if(staleSelected.length)staleEvidenceRiskPercent=10+staleSelected.length*5;
      if(state.freshness==='strict'&&answerCorrect)staleEvidenceRiskPercent=3;

      let groundingScore=(answerCorrect?94:50)*compression.retention;
      if(!authoritative)groundingScore-=18;
      if(contextOverflowTokens>0)groundingScore-=Math.min(24,contextOverflowTokens/CONTEXT_BUDGET*50);
      groundingScore=clamp(groundingScore,0,100);

      const latencyMs=Math.round(170+state.topK*28+(state.retrieval==='hybrid'?80:0)+state.rerankDepth*22+(state.freshness==='strict'?25:state.freshness==='soft'?12:0)+(state.authority==='source-priority'?30:0));
      const costIndex=Math.round((contextTokens/120+state.topK*2+(state.retrieval==='hybrid'?8:0)+state.rerankDepth*1.5+(state.authority==='source-priority'?3:0))*10)/10;
      const authoritativeCoveragePercent=authoritative?100:0;

      const retrievalTrace=ranking.map((doc)=>({
        id:doc.id,
        title:doc.title,
        rank:doc.rank,
        selected:doc.selected,
        current:doc.current,
        ageDays:doc.ageDays,
        authority:doc.authority,
        initialScore:Number(doc.initialScore.toFixed(3)),
        rerankScore:doc.rerankScore===undefined?null:Number(doc.rerankScore.toFixed(3)),
      }));

      const contextComposition=selected.map((doc)=>({
        id:doc.id,
        title:doc.title,
        current:doc.current,
        compressedTokens:Math.round(doc.tokens*compression.tokenFactor),
        answerBearing:Boolean(doc.answer),
      }));

      let diagnosisCode='HEALTHY';
      if(staleEvidenceRiskPercent>20)diagnosisCode='STALE_AUTHORITY';
      else if(contextOverflowTokens>0)diagnosisCode='CONTEXT_OVERFLOW';
      else if(groundingScore<85)diagnosisCode='GROUNDING_LOSS';
      else if(latencyMs>850)diagnosisCode='LATENCY_BUDGET';
      else if(costIndex>70)diagnosisCode='COST_BUDGET';

      return {
        evidence:{
          incident:{question:'Can I return a purchase after 40 days?',authoritativePolicy:'Refund Policy v3',authoritativeAnswer:'45 days'},
          retrievalTrace,
          documents:selected.map((doc)=>({id:doc.id,title:doc.title,current:doc.current,ageDays:doc.ageDays,authority:doc.authority,answer:doc.answer})),
          contextComposition,
          answer:{claim:answerSource?`${answerSource.answer}`:'No supported answer',sourceId:answerSource?.id||null,correct:answerCorrect,authoritativeAnswer:'45 days'},
        },
        authoritativeCoveragePercent,
        staleEvidenceRiskPercent,
        groundingScore,
        contextTokens,
        contextOverflowTokens,
        latencyMs,
        costIndex,
        diagnosisCode,
        metrics:{
          authoritativeCoveragePercent,
          staleEvidenceRiskPercent,
          groundingScore,
          contextTokens,
          contextOverflowTokens,
          latencyMs,
          costIndex,
        },
      };
    },
  });
})(typeof window!=='undefined'?window:globalThis);
