(function(){
  const root=document.querySelector('[data-agent-workflow-graph-lab]');
  if(!root)return;

  const lab=window.AhaFrame.createLab('agent-workflow-graph');
  lab.checkpoint('over-engineered-baseline');

  const controls={
    topology:document.querySelector('#graph-topology'),
    agents:document.querySelector('#graph-agent-count'),
    parallelism:document.querySelector('#graph-parallelism'),
    state:document.querySelector('#graph-state-mode'),
    retry:document.querySelector('#graph-retry-scope'),
    join:document.querySelector('#graph-join-strategy'),
    gate:document.querySelector('#graph-human-gate'),
  };
  const out=(name)=>document.querySelector(`[data-graph-${name}]`);
  const signed=(value,digits=0)=>{const n=Number(value)||0;return `${n>=0?'+':''}${n.toFixed(digits)}`;};
  const delta=(diff,key)=>{const item=diff.metrics?.[key];return item?Number(item.after)-Number(item.before):0;};

  function render(frame){
    const {state,derived}=frame;
    controls.topology.value=state.topology;
    controls.agents.value=String(state.agentCount);
    controls.parallelism.max=String(Math.min(4,state.agentCount));
    controls.parallelism.value=String(state.parallelism);
    controls.state.value=state.stateMode;
    controls.retry.value=state.retryScope;
    controls.join.value=state.joinStrategy;
    controls.gate.value=state.humanGate;
    out('agent-count-value').textContent=String(state.agentCount);
    out('parallelism-value').textContent=String(state.parallelism);
    out('architecture-score').textContent=String(derived.architectureScore);
    out('reliability').textContent=`${(derived.reliability*100).toFixed(1)}%`;
    out('success').textContent=`${(derived.successRate*100).toFixed(1)}%`;
    out('latency').textContent=`${derived.latencySeconds.toFixed(1)}s`;
    out('cost').textContent=derived.costIndex.toFixed(1);
    out('coordination').textContent=derived.coordinationOverhead.toFixed(0);
    out('state-complexity').textContent=derived.stateComplexity.toFixed(0);
    out('propagation').textContent=`${(derived.failurePropagationRisk*100).toFixed(0)}%`;
    out('duplicate-work').textContent=`${(derived.duplicateWorkRisk*100).toFixed(0)}%`;
    out('unsafe-action').textContent=`${(derived.unsafeActionRisk*100).toFixed(0)}%`;
    out('human-reviews').textContent=`${derived.humanReviewsPer100}/100`;
    out('diagnosis').textContent=derived.diagnosis;
    out('loop-vs-graph').textContent=derived.loopVsGraph;
    out('topology-stages').innerHTML=derived.topologyStages.map((stage,index)=>`<span class="flow-node">${stage}</span>${index<derived.topologyStages.length-1?'<span class="flow-arrow">→</span>':''}`).join('');
    const diff=lab.compare('over-engineered-baseline');
    out('compare').innerHTML=`<strong>Vs. over-engineered baseline</strong><span>Architecture score ${signed(delta(diff,'architectureScore'))}</span><span>Reliability ${signed(delta(diff,'reliabilityPercent'),1)} pts</span><span>Failure propagation ${signed(delta(diff,'failurePropagationPercent'),1)} pts</span><span>Cost ${signed(delta(diff,'costIndex'),1)}</span><span>Latency ${signed(delta(diff,'latencySeconds'),1)}s</span>`;
  }
  lab.subscribe(render);

  controls.topology.addEventListener('change',()=>lab.dispatch('SET_TOPOLOGY',{value:controls.topology.value}));
  controls.agents.addEventListener('input',()=>lab.dispatch('SET_AGENT_COUNT',{value:Number(controls.agents.value)}));
  controls.parallelism.addEventListener('input',()=>lab.dispatch('SET_PARALLELISM',{value:Number(controls.parallelism.value)}));
  controls.state.addEventListener('change',()=>lab.dispatch('SET_STATE_MODE',{value:controls.state.value}));
  controls.retry.addEventListener('change',()=>lab.dispatch('SET_RETRY_SCOPE',{value:controls.retry.value}));
  controls.join.addEventListener('change',()=>lab.dispatch('SET_JOIN_STRATEGY',{value:controls.join.value}));
  controls.gate.addEventListener('change',()=>lab.dispatch('SET_HUMAN_GATE',{value:controls.gate.value}));
  document.querySelector('[data-graph-balanced-preset]').addEventListener('click',()=>lab.dispatch('APPLY_BALANCED_GRAPH'));
  document.querySelector('[data-graph-reset]').addEventListener('click',()=>lab.reset());
})();
