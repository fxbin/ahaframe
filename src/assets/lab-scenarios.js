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
