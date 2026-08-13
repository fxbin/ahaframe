(function(){
  const root=document.querySelector('[data-context-compression-lab]');
  if(!root)return;

  const lab=window.AhaFrame.createLab('context-compression');
  lab.checkpoint('over-compressed-baseline');

  const compression=document.querySelector('#context-compression-ratio');
  const summaryDepth=document.querySelector('#context-summary-depth');
  const retrievalBudget=document.querySelector('#context-retrieval-budget');
  const memoryBudget=document.querySelector('#context-memory-budget');
  const protectCritical=document.querySelector('[data-context-protect-critical]');
  const balanced=document.querySelector('[data-context-balanced-preset]');
  const reset=document.querySelector('[data-context-compression-reset]');

  const outputs={
    compression:document.querySelector('[data-context-compression-ratio-value]'),
    retrieval:document.querySelector('[data-context-retrieval-budget-value]'),
    memory:document.querySelector('[data-context-memory-budget-value]'),
    active:document.querySelector('[data-context-active-tokens]'),
    savings:document.querySelector('[data-context-savings]'),
    critical:document.querySelector('[data-context-critical-retention]'),
    evidence:document.querySelector('[data-context-evidence-coverage]'),
    quality:document.querySelector('[data-context-task-quality]'),
    hallucination:document.querySelector('[data-context-hallucination-risk]'),
    latency:document.querySelector('[data-context-latency-index]'),
    cost:document.querySelector('[data-context-cost-index]'),
    budget:document.querySelector('[data-context-budget-status]'),
    diagnosis:document.querySelector('[data-context-compression-diagnosis]'),
    segments:document.querySelector('[data-context-segments]'),
    compare:document.querySelector('[data-context-compression-compare]'),
  };

  const formatTokens=(value)=>Number(value).toLocaleString('en-US');
  const signed=(value,digits=1)=>{
    const n=Number(value)||0;
    return `${n>=0?'+':''}${n.toFixed(digits)}`;
  };
  const metricDelta=(diff,key)=>{
    const item=diff.metrics?.[key];
    return item?Number(item.after)-Number(item.before):0;
  };

  function renderSegments(derived){
    outputs.segments.innerHTML=derived.segments.map((segment)=>{
      const retained=segment.semanticRetentionPercent;
      const retentionStyle=retained<60?'color:var(--danger);font-weight:800':retained>=80?'color:var(--success);font-weight:800':'color:var(--warning);font-weight:800';
      const critical=segment.critical?' <span class="badge" style="color:var(--danger);border-color:#efd0cc;background:#fffafa">Critical</span>':'';
      return `<tr><td><strong>${segment.label}</strong>${critical}<br><span class="subtle">${segment.role}</span></td><td>${formatTokens(segment.tokens)}</td><td>${formatTokens(segment.activeTokens)}</td><td style="${retentionStyle}">${retained.toFixed(0)}%</td></tr>`;
    }).join('');
  }

  function renderBudget(derived){
    if(derived.overflowTokens>0){
      outputs.budget.textContent=`OVER by ${formatTokens(derived.overflowTokens)}`;
      outputs.budget.style.color='var(--danger)';
      return;
    }
    outputs.budget.textContent=`${formatTokens(derived.contextBudget-derived.activeContextTokens)} headroom`;
    outputs.budget.style.color='var(--success)';
  }

  function render(frame){
    const {state,derived}=frame;
    compression.value=String(state.compressionRatio);
    summaryDepth.value=state.summaryDepth;
    retrievalBudget.value=String(state.retrievalBudget);
    memoryBudget.value=String(state.memoryBudget);

    outputs.compression.textContent=`${state.compressionRatio}%`;
    outputs.retrieval.textContent=`${formatTokens(state.retrievalBudget)} tokens`;
    outputs.memory.textContent=`${formatTokens(state.memoryBudget)} tokens`;
    protectCritical.textContent=state.protectCritical?'Critical facts: PROTECTED':'Critical facts: UNPROTECTED';
    protectCritical.classList.toggle('primary',state.protectCritical);

    outputs.active.textContent=`${formatTokens(derived.activeContextTokens)} / ${formatTokens(derived.contextBudget)}`;
    outputs.savings.textContent=`${derived.savingsPercent.toFixed(1)}%`;
    outputs.critical.textContent=`${derived.criticalRetentionPercent.toFixed(1)}%`;
    outputs.evidence.textContent=`${derived.evidenceCoveragePercent.toFixed(1)}%`;
    outputs.quality.textContent=derived.taskQuality.toFixed(1);
    outputs.hallucination.textContent=`${derived.hallucinationRisk.toFixed(1)}%`;
    outputs.latency.textContent=derived.latencyIndex.toFixed(1);
    outputs.cost.textContent=derived.costIndex.toFixed(1);
    outputs.diagnosis.textContent=derived.diagnosis;
    outputs.diagnosis.dataset.failureType=derived.failureType;
    renderBudget(derived);
    renderSegments(derived);

    const diff=lab.compare('over-compressed-baseline');
    outputs.compare.innerHTML=`<strong>Vs. over-compressed baseline</strong><span>Active context ${signed(metricDelta(diff,'activeContextTokens'),0)} tokens</span><span>Critical retention ${signed(metricDelta(diff,'criticalRetentionPercent'),1)} pts</span><span>Task quality ${signed(metricDelta(diff,'taskQuality'),1)} pts</span><span>Hallucination risk ${signed(metricDelta(diff,'hallucinationRisk'),1)} pts</span><span>Cost index ${signed(metricDelta(diff,'costIndex'),1)}</span>`;
  }

  lab.subscribe(render);

  compression.addEventListener('input',()=>{
    const value=Number(compression.value);
    lab.dispatch('SET_COMPRESSION_RATIO',{value});
    window.AhaFrame?.track('context_compression_parameter_changed',{parameter:'compression_ratio',value});
  });
  summaryDepth.addEventListener('change',()=>{
    lab.dispatch('SET_SUMMARY_DEPTH',{value:summaryDepth.value});
    window.AhaFrame?.track('context_compression_summary_depth_changed',{value:summaryDepth.value});
  });
  retrievalBudget.addEventListener('input',()=>{
    const value=Number(retrievalBudget.value);
    lab.dispatch('SET_RETRIEVAL_BUDGET',{value});
    window.AhaFrame?.track('context_compression_parameter_changed',{parameter:'retrieval_budget',value});
  });
  memoryBudget.addEventListener('input',()=>{
    const value=Number(memoryBudget.value);
    lab.dispatch('SET_MEMORY_BUDGET',{value});
    window.AhaFrame?.track('context_compression_parameter_changed',{parameter:'memory_budget',value});
  });
  protectCritical.addEventListener('click',()=>{
    const current=lab.getFrame().state.protectCritical;
    lab.dispatch('SET_PROTECT_CRITICAL',{value:!current});
    window.AhaFrame?.track('context_compression_protection_changed',{value:!current});
  });
  balanced.addEventListener('click',()=>{
    lab.dispatch('APPLY_BALANCED_PRESET');
    window.AhaFrame?.track('context_compression_balanced_preset_applied');
  });
  reset.addEventListener('click',()=>{
    lab.reset();
    window.AhaFrame?.track('context_compression_baseline_reset');
  });
})();
