(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before Context Compression scenario.');

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const CONTEXT_BUDGET=16000;
  const BALANCED_PRESET={compressionRatio:58,summaryDepth:'balanced',retrievalBudget:3000,memoryBudget:900,protectCritical:true};

  const SEGMENTS=[
    {id:'system-policy',label:'System + safety policy',role:'Instructions',tokens:1400,importance:1.00,critical:true,kind:'normal',compressibility:0.15},
    {id:'customer-request',label:'Current customer request',role:'Task',tokens:900,importance:0.95,critical:true,kind:'normal',compressibility:0.15},
    {id:'account-state',label:'Account + eligibility state',role:'Evidence',tokens:1800,importance:0.85,critical:true,kind:'normal',compressibility:0.35},
    {id:'refund-policy',label:'Refund policy',role:'Evidence',tokens:2600,importance:1.00,critical:true,kind:'normal',compressibility:0.50},
    {id:'retrieved-order-evidence',label:'Retrieved order evidence',role:'Retrieval',tokens:4200,importance:0.90,critical:true,kind:'retrieval',compressibility:0.40},
    {id:'recent-conversation',label:'Recent conversation',role:'Conversation',tokens:4800,importance:0.65,critical:false,kind:'normal',compressibility:0.75},
    {id:'long-term-memory',label:'Long-term memory',role:'Memory',tokens:3000,importance:0.45,critical:false,kind:'memory',compressibility:0.80},
    {id:'tool-trace',label:'Prior tool trace',role:'Tool state',tokens:2600,importance:0.55,critical:false,kind:'normal',compressibility:0.80},
    {id:'product-background',label:'Product background',role:'Reference',tokens:4200,importance:0.20,critical:false,kind:'normal',compressibility:0.90},
  ];

  const SUMMARY_DEPTH={
    shallow:{label:'Shallow summary',bonus:-0.04,semanticEfficiency:1.00,costFactor:0.82},
    balanced:{label:'Balanced summary',bonus:0.06,semanticEfficiency:1.12,costFactor:1.00},
    deep:{label:'Deep summary',bonus:0.14,semanticEfficiency:1.25,costFactor:1.22},
  };

  const ORIGINAL_TOKENS=SEGMENTS.reduce((sum,segment)=>sum+segment.tokens,0);
  const weightedRetention=(rows,predicate)=>{
    const selected=rows.filter(predicate);
    const denominator=selected.reduce((sum,row)=>sum+row.tokens*row.importance,0);
    if(!denominator)return 0;
    return selected.reduce((sum,row)=>sum+row.tokens*row.importance*row.semanticRetention,0)/denominator;
  };

  AhaFrame.registerLabScenario({
    id:'context-compression',
    version:'1.0.0',
    title:'Context Compression Lab',
    initialState:{compressionRatio:72,summaryDepth:'shallow',retrievalBudget:1600,memoryBudget:600,protectCritical:false},
    reduce(state,action){
      switch(action.type){
        case 'SET_COMPRESSION_RATIO': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<20||value>85)throw new RangeError('Compression ratio must be between 20 and 85.');
          return {...state,compressionRatio:value};
        }
        case 'SET_SUMMARY_DEPTH': {
          const value=action.payload?.value;
          if(!SUMMARY_DEPTH[value])throw new RangeError('Summary depth must be shallow, balanced, or deep.');
          return {...state,summaryDepth:value};
        }
        case 'SET_RETRIEVAL_BUDGET': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<800||value>4200)throw new RangeError('Retrieval budget must be between 800 and 4200 tokens.');
          return {...state,retrievalBudget:value};
        }
        case 'SET_MEMORY_BUDGET': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<0||value>3000)throw new RangeError('Memory budget must be between 0 and 3000 tokens.');
          return {...state,memoryBudget:value};
        }
        case 'SET_PROTECT_CRITICAL':
          return {...state,protectCritical:Boolean(action.payload?.value)};
        case 'APPLY_BALANCED_PRESET':
          return {...BALANCED_PRESET};
        default:
          throw new Error(`Unsupported context-compression action: ${action.type}`);
      }
    },
    derive(state){
      const summary=SUMMARY_DEPTH[state.summaryDepth];
      const baseRetention=1-state.compressionRatio/100;
      const segments=SEGMENTS.map((segment)=>{
        let tokenRetention=baseRetention+summary.bonus+segment.importance*0.16-segment.compressibility*0.08;
        tokenRetention=clamp(tokenRetention,0.08,0.96);
        if(state.protectCritical&&segment.critical)tokenRetention=Math.max(tokenRetention,0.74);
        if(segment.kind==='retrieval')tokenRetention=Math.min(tokenRetention,state.retrievalBudget/segment.tokens);
        if(segment.kind==='memory')tokenRetention=Math.min(tokenRetention,state.memoryBudget/segment.tokens);
        tokenRetention=clamp(tokenRetention,0,1);

        const activeTokens=Math.round(segment.tokens*tokenRetention);
        const protectionBoost=state.protectCritical&&segment.critical?1.05:1;
        const semanticRetention=clamp(tokenRetention*summary.semanticEfficiency*protectionBoost,0,1);
        return {...segment,activeTokens,tokenRetention,semanticRetention,semanticRetentionPercent:semanticRetention*100};
      });

      const activeContextTokens=segments.reduce((sum,segment)=>sum+segment.activeTokens,0);
      const savingsPercent=(1-activeContextTokens/ORIGINAL_TOKENS)*100;
      const criticalRetention=weightedRetention(segments,(segment)=>segment.critical);
      const evidenceCoverage=weightedRetention(segments,(segment)=>['account-state','refund-policy','retrieved-order-evidence'].includes(segment.id));
      const instructionRetention=weightedRetention(segments,(segment)=>['system-policy','customer-request'].includes(segment.id));
      const overallRetention=weightedRetention(segments,()=>true);
      const criticalRetentionPercent=criticalRetention*100;
      const evidenceCoveragePercent=evidenceCoverage*100;
      const instructionRetentionPercent=instructionRetention*100;
      const overallRetentionPercent=overallRetention*100;

      const taskQuality=clamp(criticalRetention*50+evidenceCoverage*22+instructionRetention*14+overallRetention*10+4,0,100);
      const hallucinationRisk=clamp(100-(evidenceCoverage*55+criticalRetention*35+instructionRetention*10),0,100);
      const costIndex=(activeContextTokens/ORIGINAL_TOKENS)*100*summary.costFactor;
      const latencyIndex=25+(activeContextTokens/ORIGINAL_TOKENS*100)*0.62+Math.max(0,summary.costFactor-1)*8;
      const overflowTokens=Math.max(0,activeContextTokens-CONTEXT_BUDGET);
      const criticalLosses=segments.filter((segment)=>segment.critical&&segment.semanticRetention<0.65);

      let failureType='healthy';
      let diagnosis='Healthy compression policy: task-critical instructions and evidence survive while the working context stays inside the budget.';
      if(overflowTokens>0){
        failureType='context-budget-overflow';
        diagnosis='Context budget overflow: quality is high because too much material survived, but the working set no longer fits the 16k production budget.';
      }else if(state.protectCritical&&evidenceCoveragePercent<70){
        failureType='retrieval-budget-starvation';
        diagnosis='Retrieval budget starvation: critical-fact protection cannot preserve evidence that was never admitted into the working context.';
      }else if(criticalRetentionPercent<60){
        failureType='critical-information-loss';
        diagnosis='Critical information loss: token savings look excellent, but required policy, account, task, or evidence details were compressed below a defensible retention level.';
      }else if(evidenceCoveragePercent<70){
        failureType='evidence-starvation';
        diagnosis='Evidence starvation: the context is compact, but too little account, policy, and retrieved order evidence remains to support a reliable answer.';
      }else if(instructionRetentionPercent<80){
        failureType='instruction-loss';
        diagnosis='Instruction loss: the context still contains evidence, but task and safety instructions were compressed too aggressively.';
      }else if(taskQuality<75){
        failureType='quality-regression';
        diagnosis='Quality regression: the compressed context fits, but the remaining information is not sufficient for a dependable support decision.';
      }else if(savingsPercent<20){
        failureType='cost-heavy-context';
        diagnosis='Over-retained context: quality is strong, but the policy saves too few tokens to justify the extra latency and cost.';
      }

      return {
        originalTokens:ORIGINAL_TOKENS,
        contextBudget:CONTEXT_BUDGET,
        summaryLabel:summary.label,
        segments,
        activeContextTokens,
        savingsPercent,
        criticalRetentionPercent,
        evidenceCoveragePercent,
        instructionRetentionPercent,
        overallRetentionPercent,
        taskQuality,
        hallucinationRisk,
        costIndex,
        latencyIndex,
        overflowTokens,
        criticalLosses,
        failureType,
        diagnosis,
        metrics:{
          activeContextTokens,
          savingsPercent,
          criticalRetentionPercent,
          evidenceCoveragePercent,
          instructionRetentionPercent,
          taskQuality,
          hallucinationRisk,
          costIndex,
          latencyIndex,
          overflowTokens,
        },
      };
    },
  });
})(typeof window!=='undefined'?window:globalThis);
