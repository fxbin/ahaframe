(function(root){
  'use strict';

  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  if(typeof AhaFrame.registerLabScenario!=='function')throw new Error('AhaFrame Lab Engine must load before Agent Workflow Graph scenario.');

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const BALANCED_PRESET={topology:'branched',agentCount:3,parallelism:2,stateMode:'isolated',retryScope:'node',joinStrategy:'verified',humanGate:'before-refund'};

  const TOPOLOGIES={
    'single-agent':{label:'Single Agent',baseReliability:0.79,baseLatency:18,baseCost:40,coordination:6,complexity:18,recommendedAgents:1,supportsParallel:false},
    sequential:{label:'Sequential Pipeline',baseReliability:0.87,baseLatency:25,baseCost:48,coordination:10,complexity:27,recommendedAgents:2,supportsParallel:false},
    branched:{label:'Branched Workflow',baseReliability:0.89,baseLatency:20,baseCost:55,coordination:15,complexity:36,recommendedAgents:3,supportsParallel:true},
    parallel:{label:'Parallel Specialists',baseReliability:0.84,baseLatency:17,baseCost:62,coordination:22,complexity:45,recommendedAgents:3,supportsParallel:true},
    coordinator:{label:'Coordinator + Workers',baseReliability:0.81,baseLatency:20,baseCost:72,coordination:31,complexity:58,recommendedAgents:4,supportsParallel:true},
  };

  AhaFrame.registerLabScenario({
    id:'agent-workflow-graph',
    version:'1.0.0',
    title:'Agent Workflow Graph Lab',
    initialState:{topology:'coordinator',agentCount:5,parallelism:4,stateMode:'shared',retryScope:'graph',joinStrategy:'first',humanGate:'none'},
    reduce(state,action){
      switch(action.type){
        case 'SET_TOPOLOGY': {
          const value=action.payload?.value;
          if(!TOPOLOGIES[value])throw new RangeError('Topology must be single-agent, sequential, branched, parallel, or coordinator.');
          return {...state,topology:value};
        }
        case 'SET_AGENT_COUNT': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<1||value>6)throw new RangeError('Agent count must be an integer between 1 and 6.');
          return {...state,agentCount:value,parallelism:Math.min(state.parallelism,value)};
        }
        case 'SET_PARALLELISM': {
          const value=Number(action.payload?.value);
          if(!Number.isInteger(value)||value<1||value>4)throw new RangeError('Parallelism must be an integer between 1 and 4.');
          if(value>state.agentCount)throw new RangeError('Parallelism cannot exceed agent count.');
          return {...state,parallelism:value};
        }
        case 'SET_STATE_MODE': {
          const value=action.payload?.value;
          if(!['shared','isolated'].includes(value))throw new RangeError('State mode must be shared or isolated.');
          return {...state,stateMode:value};
        }
        case 'SET_RETRY_SCOPE': {
          const value=action.payload?.value;
          if(!['graph','node'].includes(value))throw new RangeError('Retry scope must be graph or node.');
          return {...state,retryScope:value};
        }
        case 'SET_JOIN_STRATEGY': {
          const value=action.payload?.value;
          if(!['first','all','verified'].includes(value))throw new RangeError('Join strategy must be first, all, or verified.');
          return {...state,joinStrategy:value};
        }
        case 'SET_HUMAN_GATE': {
          const value=action.payload?.value;
          if(!['none','before-refund'].includes(value))throw new RangeError('Human gate must be none or before-refund.');
          return {...state,humanGate:value};
        }
        case 'APPLY_BALANCED_GRAPH':
          return {...BALANCED_PRESET};
        default:
          throw new Error(`Unsupported agent-workflow-graph action: ${action.type}`);
      }
    },
    derive(state){
      const topology=TOPOLOGIES[state.topology];
      const effectiveParallelism=topology.supportsParallel?Math.min(state.parallelism,state.agentCount):1;
      const excessAgents=Math.max(0,state.agentCount-topology.recommendedAgents);
      const shared=state.stateMode==='shared';
      const graphRetry=state.retryScope==='graph';
      const firstJoin=state.joinStrategy==='first';
      const verifiedJoin=state.joinStrategy==='verified';
      const humanGate=state.humanGate==='before-refund';

      const coordinationOverhead=clamp(
        topology.coordination+state.agentCount*3+excessAgents*8+(effectiveParallelism-1)*6+(shared?10:3)+(verifiedJoin?6:0),
        5,100,
      );
      const stateComplexity=clamp(
        topology.complexity+state.agentCount*4+(shared?17:8)+(effectiveParallelism-1)*5+(state.topology==='coordinator'?8:0),
        10,100,
      );
      const failurePropagationRisk=clamp(
        0.09+(shared?0.23:-0.03)+(graphRetry?0.20:-0.04)+(firstJoin&&effectiveParallelism>1?0.15:0)+(state.topology==='coordinator'?0.08:0)+excessAgents*0.05-(verifiedJoin?0.12:0),
        0.01,0.92,
      );
      const duplicateWorkRisk=clamp(
        0.06+excessAgents*0.11+(effectiveParallelism-1)*0.06+(graphRetry?0.16:-0.03)+(state.topology==='coordinator'?0.07:0)-(verifiedJoin?0.04:0),
        0.01,0.90,
      );
      const unsafeActionRisk=clamp(
        0.22+(firstJoin?0.08:0)+(shared?0.04:0)-(verifiedJoin?0.05:0)-(humanGate?0.20:0),
        0.01,0.70,
      );

      const reliability=clamp(
        topology.baseReliability-failurePropagationRisk*0.20-duplicateWorkRisk*0.10+(state.stateMode==='isolated'?0.05:0)+(state.retryScope==='node'?0.05:0)+(verifiedJoin?0.07:0)+(humanGate?0.03:0)-excessAgents*0.015,
        0.35,0.99,
      );
      const parallelSpeedup=1+0.18*(effectiveParallelism-1);
      const latencySeconds=clamp(
        topology.baseLatency/parallelSpeedup+coordinationOverhead*0.08+(state.joinStrategy==='all'?3:0)+(verifiedJoin?4:0)+(humanGate?6:0)+(graphRetry?4:0),
        8,60,
      );
      const costIndex=clamp(
        topology.baseCost+state.agentCount*5+effectiveParallelism*3+(graphRetry?18:4)+(verifiedJoin?7:0)+(humanGate?6:0)+excessAgents*5,
        20,140,
      );
      const humanReviewsPer100=humanGate?38:0;
      const successRate=clamp(reliability*(1-unsafeActionRisk*0.18),0,0.99);
      const architectureScore=Math.round(clamp(
        reliability*100-failurePropagationRisk*18-duplicateWorkRisk*10-unsafeActionRisk*12-Math.max(0,costIndex-75)*0.18-Math.max(0,latencySeconds-28)*0.35,
        0,100,
      ));

      let failureType='healthy';
      let diagnosis='Healthy graph policy: responsibilities are explicit, state is bounded, retries stay local, joins verify competing branches, and consequential action has a deliberate gate.';
      if(shared&&state.agentCount>=3){
        failureType='shared-state-contamination';
        diagnosis='Shared-state contamination: several workers can mutate or overwrite the same working state, so one bad observation propagates across otherwise independent branches.';
      }else if(graphRetry&&state.topology!=='single-agent'){
        failureType='retry-blast-radius';
        diagnosis='Retry blast radius: a local failure restarts too much of the workflow, duplicating successful work and increasing the chance of repeated side effects.';
      }else if(firstJoin&&effectiveParallelism>1){
        failureType='premature-join';
        diagnosis='Premature join: the graph accepts the first branch to finish instead of reconciling evidence, so latency improves by trading away reliability.';
      }else if(excessAgents>=2){
        failureType='unnecessary-multi-agent';
        diagnosis='Unnecessary multi-agent complexity: extra workers increase coordination and state cost without adding enough independent capability to justify them.';
      }else if(coordinationOverhead>=70){
        failureType='coordination-overhead';
        diagnosis='Coordination overhead dominates: the topology spends too much effort routing, merging, and synchronizing compared with the underlying task.';
      }else if(humanGate&&humanReviewsPer100>0&&latencySeconds>35){
        failureType='human-bottleneck';
        diagnosis='Human gate is correctly protecting the irreversible action, but the current topology makes that review path a latency bottleneck.';
      }

      const topologyStages={
        'single-agent':['Agent loop','Refund tool'],
        sequential:['Classify','Retrieve','Decide','Refund','Verify'],
        branched:['Classify','Policy branch + Account branch','Verified join','Refund gate','Verify'],
        parallel:['Parallel specialists','Join','Refund','Verify'],
        coordinator:['Coordinator','Workers × '+state.agentCount,'Join','Refund','Verifier'],
      }[state.topology];

      return {
        topologyLabel:topology.label,
        topologyStages,
        effectiveParallelism,
        coordinationOverhead,
        stateComplexity,
        failurePropagationRisk,
        duplicateWorkRisk,
        unsafeActionRisk,
        reliability,
        successRate,
        latencySeconds,
        costIndex,
        humanReviewsPer100,
        architectureScore,
        failureType,
        diagnosis,
        loopVsGraph:'Loop controls iteration inside a node or agent. Graph controls how nodes, loops, tools, branches, joins, and gates are connected.',
        metrics:{coordinationOverhead,stateComplexity,failurePropagationPercent:failurePropagationRisk*100,duplicateWorkPercent:duplicateWorkRisk*100,unsafeActionPercent:unsafeActionRisk*100,reliabilityPercent:reliability*100,successPercent:successRate*100,latencySeconds,costIndex,humanReviewsPer100,architectureScore},
      };
    },
  });
})(typeof window!=='undefined'?window:globalThis);
