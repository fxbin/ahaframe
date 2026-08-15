(function(){
  const root=document.querySelector('[data-agent-reliability-lab]');
  if(!root)return;

  const copy=JSON.parse(root.dataset.agentReliabilityCopy||'{}');
  const lab=window.AhaFrame.createLab('agent-reliability');
  lab.checkpoint('baseline');

  const maxSteps=document.querySelector('#agent-max-steps');
  const retryLimit=document.querySelector('#agent-retry-limit');
  const timeout=document.querySelector('#agent-timeout');
  const termination=document.querySelector('#agent-termination');
  const validation=document.querySelector('[data-agent-validation]');
  const human=document.querySelector('[data-agent-human]');
  const balanced=document.querySelector('[data-agent-balanced]');
  const reset=document.querySelector('[data-agent-reset]');

  const outputs={
    maxSteps:document.querySelector('[data-agent-max-steps-value]'),
    retry:document.querySelector('[data-agent-retry-value]'),
    timeout:document.querySelector('[data-agent-timeout-value]'),
    success:document.querySelector('[data-agent-success]'),
    reliability:document.querySelector('[data-agent-reliability]'),
    runaway:document.querySelector('[data-agent-runaway]'),
    unsafe:document.querySelector('[data-agent-unsafe]'),
    latency:document.querySelector('[data-agent-latency]'),
    cost:document.querySelector('[data-agent-cost]'),
    reviews:document.querySelector('[data-agent-reviews]'),
    diagnosis:document.querySelector('[data-agent-diagnosis]'),
    compare:document.querySelector('[data-agent-compare]'),
  };

  const signed=(value,digits=0)=>{
    const n=Number(value)||0;
    return `${n>=0?'+':''}${n.toFixed(digits)}`;
  };

  function metricDelta(diff,key){
    const item=diff.metrics?.[key];
    return item?Number(item.after)-Number(item.before):0;
  }

  function render(frame){
    const {state,derived}=frame;
    const seconds=copy.seconds||'s';
    const compare=copy.compare||{};
    maxSteps.value=state.maxSteps;
    retryLimit.value=state.retryLimit;
    timeout.value=state.timeoutSec;
    termination.value=state.termination;

    outputs.maxSteps.textContent=String(state.maxSteps);
    outputs.retry.textContent=String(state.retryLimit);
    outputs.timeout.textContent=`${state.timeoutSec} ${seconds}`;

    validation.textContent=state.validation?(copy.validation?.on||'Result validation: ON'):(copy.validation?.off||'Result validation: OFF');
    validation.classList.toggle('primary',state.validation);
    human.textContent=state.humanApproval?(copy.human?.on||'Human approval: ON'):(copy.human?.off||'Human approval: OFF');
    human.classList.toggle('primary',state.humanApproval);

    outputs.success.textContent=`${(derived.successRate*100).toFixed(0)}%`;
    outputs.reliability.textContent=derived.reliabilityScore.toFixed(0);
    outputs.runaway.textContent=`${(derived.runawayRisk*100).toFixed(0)}%`;
    outputs.unsafe.textContent=`${(derived.unsafeActionRisk*100).toFixed(0)}%`;
    outputs.latency.textContent=`${derived.latencySeconds.toFixed(1)} ${seconds}`;
    outputs.cost.textContent=derived.costIndex.toFixed(1);
    outputs.reviews.textContent=String(derived.humanReviewsPer100);
    outputs.diagnosis.textContent=copy.diagnosis?.[derived.failureType]||derived.diagnosis;
    outputs.diagnosis.dataset.failureType=derived.failureType;

    const diff=lab.compare('baseline');
    outputs.compare.innerHTML=`<strong>${compare.title||'Vs. unreliable baseline'}</strong><span>${compare.reliability||'Reliability'} ${signed(metricDelta(diff,'reliabilityScore'))}</span><span>${compare.success||'Success'} ${signed(metricDelta(diff,'successPercent'))} ${compare.points||'pts'}</span><span>${compare.runaway||'Runaway'} ${signed(metricDelta(diff,'runawayPercent'))} ${compare.points||'pts'}</span><span>${compare.unsafe||'Unsafe actions'} ${signed(metricDelta(diff,'unsafeActionPercent'))} ${compare.points||'pts'}</span><span>${compare.latency||'Latency'} ${signed(metricDelta(diff,'latencySeconds'),1)} ${seconds}</span><span>${compare.cost||'Cost'} ${signed(metricDelta(diff,'costIndex'),1)}</span>`;
  }

  lab.subscribe(render);

  maxSteps.addEventListener('input',()=>{
    lab.dispatch('SET_MAX_STEPS',{value:Number(maxSteps.value)});
    window.AhaFrame?.track('agent_reliability_parameter_changed',{parameter:'max_steps',value:Number(maxSteps.value)});
  });
  retryLimit.addEventListener('input',()=>{
    lab.dispatch('SET_RETRY_LIMIT',{value:Number(retryLimit.value)});
    window.AhaFrame?.track('agent_reliability_parameter_changed',{parameter:'retry_limit',value:Number(retryLimit.value)});
  });
  timeout.addEventListener('input',()=>{
    lab.dispatch('SET_TIMEOUT',{value:Number(timeout.value)});
    window.AhaFrame?.track('agent_reliability_parameter_changed',{parameter:'timeout_seconds',value:Number(timeout.value)});
  });
  termination.addEventListener('change',()=>{
    lab.dispatch('SET_TERMINATION',{value:termination.value});
    window.AhaFrame?.track('agent_reliability_parameter_changed',{parameter:'termination',value:termination.value});
  });
  validation.addEventListener('click',()=>{
    const current=lab.getFrame().state.validation;
    lab.dispatch('SET_VALIDATION',{value:!current});
    window.AhaFrame?.track('agent_reliability_parameter_changed',{parameter:'validation',value:!current});
  });
  human.addEventListener('click',()=>{
    const current=lab.getFrame().state.humanApproval;
    lab.dispatch('SET_HUMAN_APPROVAL',{value:!current});
    window.AhaFrame?.track('agent_reliability_parameter_changed',{parameter:'human_approval',value:!current});
  });
  balanced.addEventListener('click',()=>{
    lab.dispatch('APPLY_RELIABILITY_PRESET');
    window.AhaFrame?.track('agent_reliability_preset_applied');
  });
  reset.addEventListener('click',()=>{
    lab.reset();
    window.AhaFrame?.track('agent_reliability_baseline_reset');
  });
})();
