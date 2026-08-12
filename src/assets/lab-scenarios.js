(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before lab scenarios.');

  const TOKEN_CANDIDATES=[
    {token:'Paris',logit:3.0},
    {token:'Lyon',logit:0.6114269475},
    {token:'located',logit:0.3276013718},
    {token:'other',logit:0.8128043982},
  ];

  function tokenDistribution(temperature){
    if(temperature<=0.05)return [1,0,0,0];
    const scaled=TOKEN_CANDIDATES.map(({logit})=>logit/temperature);
    const max=Math.max(...scaled);
    const weights=scaled.map((value)=>Math.exp(value-max));
    const total=weights.reduce((sum,value)=>sum+value,0);
    return weights.map((value)=>value/total);
  }

  AhaFrame.registerLabScenario({
    id:'token-playground',
    version:'1.0.0',
    title:'Token Playground',
    initialState:{temperature:0.7,sampling:'sample'},
    reduce(state,action){
      switch(action.type){
        case 'SET_TEMPERATURE': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<0||value>2)throw new RangeError('Temperature must be between 0 and 2.');
          return {...state,temperature:value};
        }
        case 'SET_SAMPLING': {
          const value=action.payload?.value;
          if(!['sample','greedy'].includes(value))throw new RangeError('Sampling must be sample or greedy.');
          return {...state,sampling:value};
        }
        default:
          throw new Error(`Unsupported token-playground action: ${action.type}`);
      }
    },
    derive(state){
      const probabilities=tokenDistribution(state.temperature);
      const selectedIndex=state.sampling==='greedy'?0:(state.temperature>1.15?1:0);
      const entropy=-probabilities.reduce((sum,p)=>p>0?sum+p*Math.log2(p):sum,0);
      return {
        candidates:TOKEN_CANDIDATES.map(({token},index)=>({token,probability:probabilities[index]})),
        selected:{token:TOKEN_CANDIDATES[selectedIndex].token,probability:probabilities[selectedIndex]},
        metrics:{temperature:state.temperature,entropyBits:entropy},
      };
    },
  });

  const CONTEXT_LIMIT=200000;
  const CONTEXT_BEFORE=191250;
  const CONTEXT_STRATEGIES={
    drop:{activeTokens:143900,note:'47,350 tokens removed; 56,100 tokens of headroom remain. Fast, but older turns are lost.'},
    summarize:{activeTokens:112430,note:'78,820 tokens condensed or removed; 87,570 tokens of headroom remain.'},
    rag:{activeTokens:96800,note:'94,450 tokens removed from active context; 103,200 tokens of headroom remain as documents move to on-demand retrieval.'},
    memory:{activeTokens:128300,note:'62,950 tokens removed from active context; 71,700 tokens of headroom remain as stable facts move to persistent memory.'},
  };

  AhaFrame.registerLabScenario({
    id:'context-window',
    version:'1.0.0',
    title:'Context Window Lab',
    initialState:{strategy:'summarize'},
    reduce(state,action){
      if(action.type!=='SELECT_STRATEGY')throw new Error(`Unsupported context-window action: ${action.type}`);
      const strategy=action.payload?.strategy;
      if(!CONTEXT_STRATEGIES[strategy])throw new RangeError(`Unknown context strategy: ${strategy}`);
      return {...state,strategy};
    },
    derive(state){
      const config=CONTEXT_STRATEGIES[state.strategy];
      const headroom=CONTEXT_LIMIT-config.activeTokens;
      const released=CONTEXT_BEFORE-config.activeTokens;
      return {
        strategy:state.strategy,
        activeTokens:config.activeTokens,
        headroom,
        releasedTokens:released,
        utilizationPercent:config.activeTokens/CONTEXT_LIMIT*100,
        note:config.note,
        metrics:{activeTokens:config.activeTokens,headroom,releasedTokens:released,utilizationPercent:config.activeTokens/CONTEXT_LIMIT*100},
      };
    },
  });

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const RAG_BALANCED={chunkSize:600,overlap:100,topK:5,retrieval:'hybrid',reranker:true,contextBudget:8000};

  AhaFrame.registerLabScenario({
    id:'rag-failure',
    version:'1.0.0',
    title:'RAG Failure Lab',
    initialState:{chunkSize:1200,overlap:100,topK:12,retrieval:'vector',reranker:false,contextBudget:8000},
    reduce(state,action){
      switch(action.type){
        case 'SET_CHUNK_SIZE': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<200||value>1400)throw new RangeError('Chunk size must be between 200 and 1400 tokens.');
          return {...state,chunkSize:value,overlap:Math.min(state.overlap,Math.max(0,value-50))};
        }
        case 'SET_OVERLAP': {
          const value=Number(action.payload?.value);
          if(!Number.isFinite(value)||value<0||value>=state.chunkSize)throw new RangeError('Overlap must be non-negative and smaller than chunk size.');
          return {...state,overlap:value};
        }
        case 'SET_TOP_K': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<2||value>15)throw new RangeError('Top-K must be an integer between 2 and 15.');
          return {...state,topK:value};
        }
        case 'SET_RETRIEVAL': {
          const value=action.payload?.value;
          if(!['vector','hybrid'].includes(value))throw new RangeError('Retrieval must be vector or hybrid.');
          return {...state,retrieval:value};
        }
        case 'SET_RERANKER':
          return {...state,reranker:Boolean(action.payload?.value)};
        case 'APPLY_BALANCED_PRESET':
          return {...RAG_BALANCED};
        default:
          throw new Error(`Unsupported rag-failure action: ${action.type}`);
      }
    },
    derive(state){
      const overlapRatio=state.overlap/state.chunkSize;
      const chunkFit=Math.exp(-Math.abs(state.chunkSize-600)/700);
      const topKRecallGain=1-Math.exp(-state.topK/4);
      const retrievalRecallBonus=state.retrieval==='hybrid'?0.08:0;
      const overlapRecallBonus=Math.min(overlapRatio,0.25)*0.35;
      const recall=clamp(0.34+0.36*topKRecallGain+0.16*chunkFit+retrievalRecallBonus+overlapRecallBonus,0.2,0.98);

      const topKPrecisionPenalty=Math.max(0,state.topK-3)*0.028;
      const chunkPrecisionPenalty=Math.abs(state.chunkSize-550)/1800;
      const smallChunkPenalty=Math.max(0,350-state.chunkSize)/1000;
      const retrievalPrecisionBonus=state.retrieval==='hybrid'?0.05:0;
      const rerankerBonus=state.reranker?0.15:0;
      const precision=clamp(0.88-topKPrecisionPenalty-chunkPrecisionPenalty-smallChunkPenalty+retrievalPrecisionBonus+rerankerBonus,0.2,0.98);

      const effectiveChunk=Math.max(100,state.chunkSize-state.overlap*0.25);
      const contextTokens=Math.round(state.topK*effectiveChunk);
      const overflowTokens=Math.max(0,contextTokens-state.contextBudget);
      const overflowRatio=overflowTokens/state.contextBudget;
      const qualityScore=clamp((0.55*recall+0.45*precision)*100-overflowRatio*35,0,100);
      const latencyMs=Math.round(150+state.topK*24+state.chunkSize*0.07+(state.retrieval==='hybrid'?80:0)+(state.reranker?150:0));
      const costIndex=Math.round((contextTokens/state.contextBudget*60+state.topK*2+(state.retrieval==='hybrid'?8:0)+(state.reranker?12:0))*10)/10;

      let failureType='healthy';
      let failure='Healthy configuration: evidence coverage and context precision are balanced.';
      if(overflowTokens>0){
        failureType='context-overflow';
        failure=`Context overflow: ${overflowTokens.toLocaleString()} retrieved tokens exceed the ${state.contextBudget.toLocaleString()} token budget.`;
      }else if(recall<0.72){
        failureType='missed-evidence';
        failure='Missed evidence: retrieval recall is too low, so relevant facts are likely absent from context.';
      }else if(precision<0.62){
        failureType='retrieval-noise';
        failure='Retrieval noise: too much irrelevant context competes with useful evidence.';
      }else if(qualityScore<78){
        failureType='weak-tradeoff';
        failure='Weak trade-off: the pipeline works, but retrieval quality is not yet production-ready.';
      }

      return {
        recall,
        precision,
        noise:1-precision,
        contextTokens,
        overflowTokens,
        contextUsagePercent:contextTokens/state.contextBudget*100,
        qualityScore,
        latencyMs,
        costIndex,
        failureType,
        failure,
        metrics:{
          recallPercent:recall*100,
          precisionPercent:precision*100,
          contextTokens,
          overflowTokens,
          qualityScore,
          latencyMs,
          costIndex,
        },
      };
    },
  });

  const AGENT_RELIABILITY_PRESET={maxSteps:8,retryLimit:2,timeoutSec:6,validation:true,humanApproval:true,termination:'goal-aware'};

  AhaFrame.registerLabScenario({
    id:'agent-reliability',
    version:'1.0.0',
    title:'Agent Reliability Lab',
    initialState:{maxSteps:14,retryLimit:4,timeoutSec:12,validation:false,humanApproval:false,termination:'weak'},
    reduce(state,action){
      switch(action.type){
        case 'SET_MAX_STEPS': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<4||value>20)throw new RangeError('Max steps must be an integer between 4 and 20.');
          return {...state,maxSteps:value};
        }
        case 'SET_RETRY_LIMIT': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<0||value>5)throw new RangeError('Retry limit must be an integer between 0 and 5.');
          return {...state,retryLimit:value};
        }
        case 'SET_TIMEOUT': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<2||value>20)throw new RangeError('Timeout must be an integer between 2 and 20 seconds.');
          return {...state,timeoutSec:value};
        }
        case 'SET_VALIDATION':
          return {...state,validation:Boolean(action.payload?.value)};
        case 'SET_HUMAN_APPROVAL':
          return {...state,humanApproval:Boolean(action.payload?.value)};
        case 'SET_TERMINATION': {
          const value=action.payload?.value;
          if(!['weak','bounded','goal-aware'].includes(value))throw new RangeError('Termination must be weak, bounded, or goal-aware.');
          return {...state,termination:value};
        }
        case 'APPLY_RELIABILITY_PRESET':
          return {...AGENT_RELIABILITY_PRESET};
        default:
          throw new Error(`Unsupported agent-reliability action: ${action.type}`);
      }
    },
    derive(state){
      const stepCoverage=Math.min(state.maxSteps,8)*0.0225;
      const retryGain=Math.min(state.retryLimit,2)*0.05+Math.max(0,state.retryLimit-2)*0.015;
      const timeoutGain=clamp((state.timeoutSec-2)/10,0,1)*0.07;
      const terminationSuccess={weak:0,bounded:0.03,'goal-aware':0.07}[state.termination];
      const successRate=clamp(0.40+stepCoverage+retryGain+timeoutGain+terminationSuccess+(state.validation?0.10:0)+(state.humanApproval?0.03:0),0.35,0.98);

      const terminationRisk={weak:0.14,bounded:-0.10,'goal-aware':-0.18}[state.termination];
      const runawayRisk=clamp(0.08+Math.max(0,state.maxSteps-6)*0.025+state.retryLimit*0.025+Math.max(0,state.timeoutSec-6)*0.004+terminationRisk-(state.validation?0.05:0)-(state.humanApproval?0.02:0),0.01,0.75);

      const terminationSafety={weak:0.03,bounded:0,'goal-aware':-0.02}[state.termination];
      const unsafeActionRisk=clamp(0.22+state.retryLimit*0.015+Math.max(0,state.maxSteps-10)*0.01+terminationSafety-(state.validation?0.10:0)-(state.humanApproval?0.14:0),0.01,0.60);

      const terminationSteps={weak:1.6,bounded:0.5,'goal-aware':0}[state.termination];
      const expectedSteps=clamp(3.6+state.retryLimit*0.75+Math.max(0,state.maxSteps-8)*0.18+terminationSteps+(state.validation?0.4:0)+(state.humanApproval?0.3:0),3.5,state.maxSteps);
      const latencySeconds=expectedSteps*(0.75+state.timeoutSec*0.14)+(state.validation?1.5:0)+(state.humanApproval?6:0);
      const costIndex=expectedSteps*7+state.retryLimit*3+(state.validation?10:0)+(state.humanApproval?6:0)+Math.max(0,state.maxSteps-12)*1.5;
      const humanReviewsPer100=state.humanApproval?Math.round(28+successRate*12+state.retryLimit*2):0;
      const reliabilityScore=clamp((successRate*0.55+(1-runawayRisk)*0.25+(1-unsafeActionRisk)*0.20)*100,0,100);

      let failureType='healthy';
      let diagnosis='Healthy control policy: task completion, execution bounds, and safety checks are balanced.';
      if(runawayRisk>0.25){
        failureType='runaway-loop';
        diagnosis='Runaway risk is too high: retries and step budget give a confused agent too much room to repeat work.';
      }else if(unsafeActionRisk>0.15){
        failureType='unsafe-action';
        diagnosis='Unsafe-action risk is too high: irreversible tool calls need stronger validation or an approval boundary.';
      }else if(successRate<0.82){
        failureType='task-failure';
        diagnosis='Task success is too low: the policy is stopping or timing out before enough valid recovery can happen.';
      }else if(latencySeconds>28){
        failureType='slow-policy';
        diagnosis='The policy is reliable but slow: timeout and review overhead are dominating the execution path.';
      }else if(costIndex>80){
        failureType='expensive-policy';
        diagnosis='The policy works, but too many steps or retries make the expected run unnecessarily expensive.';
      }

      return {
        successRate,
        runawayRisk,
        unsafeActionRisk,
        expectedSteps,
        latencySeconds,
        costIndex,
        humanReviewsPer100,
        reliabilityScore,
        failureType,
        diagnosis,
        metrics:{
          successPercent:successRate*100,
          runawayPercent:runawayRisk*100,
          unsafeActionPercent:unsafeActionRisk*100,
          expectedSteps,
          latencySeconds,
          costIndex,
          humanReviewsPer100,
          reliabilityScore,
        },
      };
    },
  });

  const AGENT_LABELS=[
    'The agent reads the user task and identifies missing information.',
    'The agent selects the weather tool.',
    'The weather tool is called with city = Tokyo.',
    'Observation received: light rain, 18°C, humidity 92%.',
    'The agent checks whether the observation is sufficient.',
    'Final answer ready: bring an umbrella.',
  ];

  AhaFrame.registerLabScenario({
    id:'agent-loop',
    version:'1.0.0',
    title:'Agent Loop Simulator',
    initialState:{step:0,failure:null},
    reduce(state,action){
      switch(action.type){
        case 'NEXT':
          return {...state,step:Math.min(state.step+1,5),failure:null};
        case 'INJECT_TOOL_ERROR':
          return {...state,failure:'weather-timeout'};
        case 'RECOVER_TOOL_ERROR':
          return {...state,step:2,failure:null};
        default:
          throw new Error(`Unsupported agent-loop action: ${action.type}`);
      }
    },
    derive(state){
      const failed=state.failure==='weather-timeout';
      return {
        status:failed?'Tool error: Weather API timeout → observe failure → retry.':AGENT_LABELS[Math.min(state.step,AGENT_LABELS.length-1)],
        result:!failed&&state.step>=5?'Bring an umbrella — light rain is expected in Tokyo.':'Waiting for final answer…',
        metrics:{step:state.step,progressPercent:state.step/5*100,completed:!failed&&state.step>=5,failed},
      };
    },
  });
})(typeof window!=='undefined'?window:globalThis);
