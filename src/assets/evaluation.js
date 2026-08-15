(function(){
  const root=document.querySelector('[data-evaluation-lab]');
  if(!root)return;

  const copy=JSON.parse(root.dataset.evaluationCopy||'{}');
  const lab=window.AhaFrame.createLab('evaluation-failure');
  lab.checkpoint('naive-eval');

  const dataset=document.querySelector('#evaluation-dataset');
  const threshold=document.querySelector('#evaluation-threshold');
  const safety=document.querySelector('[data-evaluation-safety]');
  const sampleSize=document.querySelector('#evaluation-sample-size');
  const judgeMode=document.querySelector('#evaluation-judge-mode');
  const costGate=document.querySelector('[data-evaluation-cost-gate]');
  const production=document.querySelector('[data-evaluation-production-preset]');
  const reset=document.querySelector('[data-evaluation-reset]');

  const outputs={
    threshold:document.querySelector('[data-evaluation-threshold-value]'),
    aggregateV1:document.querySelector('[data-evaluation-v1]'),
    aggregateV2:document.querySelector('[data-evaluation-v2]'),
    delta:document.querySelector('[data-evaluation-delta]'),
    safetyScore:document.querySelector('[data-evaluation-safety-score]'),
    regressions:document.querySelector('[data-evaluation-regressions]'),
    confidence:document.querySelector('[data-evaluation-confidence]'),
    judgeNoise:document.querySelector('[data-evaluation-judge-noise]'),
    evalCost:document.querySelector('[data-evaluation-cost]'),
    costV1:document.querySelector('[data-evaluation-cost-v1]'),
    costV2:document.querySelector('[data-evaluation-cost-v2]'),
    decision:document.querySelector('[data-evaluation-decision]'),
    diagnosis:document.querySelector('[data-evaluation-diagnosis]'),
    slices:document.querySelector('[data-evaluation-slices]'),
    compare:document.querySelector('[data-evaluation-compare]'),
  };

  const signed=(value,digits=1)=>{
    const n=Number(value)||0;
    return `${n>=0?'+':''}${n.toFixed(digits)}`;
  };

  function metricDelta(diff,key){
    const item=diff.metrics?.[key];
    return item?Number(item.after)-Number(item.before):0;
  }

  function stateChanged(diff,key){
    const item=diff.state?.[key];
    if(!item)return copy.state?.unchanged||'unchanged';
    if(typeof item.after==='boolean')return item.after?(copy.state?.on||'ON'):(copy.state?.off||'OFF');
    return String(item.after);
  }

  function renderSlices(derived){
    outputs.slices.innerHTML=derived.sliceScores.map((slice)=>{
      const deltaStyle=slice.delta<0?'color:var(--danger);font-weight:800':'color:var(--success);font-weight:800';
      const critical=slice.critical?` <span class="badge" style="color:var(--danger);border-color:#efd0cc;background:#fffafa">${copy.critical||'Critical'}</span>`:'';
      const label=copy.sliceLabels?.[slice.id]||slice.label;
      return `<tr><td><strong>${label}</strong>${critical}</td><td>${(slice.weight*100).toFixed(0)}%</td><td>${slice.v1.toFixed(0)}</td><td>${slice.v2.toFixed(0)}</td><td style="${deltaStyle}">${signed(slice.delta,0)}</td></tr>`;
    }).join('');
  }

  function renderDecision(decision){
    const styles={
      SHIP:{color:'var(--success)',background:'#edf8f3',border:'#d9ece4'},
      BLOCK:{color:'var(--danger)',background:'#fff4f2',border:'#efd0cc'},
      INCONCLUSIVE:{color:'var(--warning)',background:'#fffaf0',border:'#ecd9af'},
    }[decision];
    outputs.decision.textContent=copy.decision?.[decision]||decision;
    outputs.decision.dataset.decision=decision;
    outputs.decision.style.color=styles.color;
    outputs.decision.style.background=styles.background;
    outputs.decision.style.borderColor=styles.border;
  }

  function render(frame){
    const {state,derived}=frame;
    const points=copy.points||'pts';
    const compare=copy.compare||{};
    dataset.value=state.datasetPreset;
    threshold.value=state.passThreshold;
    sampleSize.value=String(state.sampleSize);
    judgeMode.value=state.judgeMode;
    outputs.threshold.textContent=String(state.passThreshold);

    safety.textContent=state.safetyVeto?(copy.safety?.on||'Safety veto: ON'):(copy.safety?.off||'Safety veto: OFF');
    safety.classList.toggle('primary',state.safetyVeto);
    costGate.textContent=state.costGate?(copy.costGate?.on||'Cost gate: ON'):(copy.costGate?.off||'Cost gate: OFF');
    costGate.classList.toggle('primary',state.costGate);

    outputs.aggregateV1.textContent=derived.aggregateV1.toFixed(1);
    outputs.aggregateV2.textContent=derived.aggregateV2.toFixed(1);
    outputs.delta.textContent=`${signed(derived.aggregateDelta,1)} ${points}`;
    outputs.safetyScore.textContent=derived.metrics.criticalSafetyScore.toFixed(0);
    outputs.regressions.textContent=`${derived.regressions.length} ${copy.regressionTotal||'total'} · ${derived.criticalRegressions.length} ${copy.regressionCritical||'critical'}`;
    outputs.confidence.textContent=`±${derived.confidenceWidth.toFixed(1)} ${points}`;
    outputs.judgeNoise.textContent=`${(derived.judgeNoise*100).toFixed(0)}%`;
    outputs.evalCost.textContent=derived.estimatedEvalCost.toFixed(1);
    outputs.costV1.textContent=derived.costPerSuccessV1.toFixed(3);
    outputs.costV2.textContent=derived.costPerSuccessV2.toFixed(3);
    renderDecision(derived.decision);
    outputs.diagnosis.textContent=copy.diagnosis?.[derived.failureType]||derived.diagnosis;
    outputs.diagnosis.dataset.failureType=derived.failureType;
    renderSlices(derived);

    const diff=lab.compare('naive-eval');
    outputs.compare.innerHTML=`<strong>${compare.title||'Vs. naive evaluation'}</strong><span>${compare.candidate||'Candidate score'} ${signed(metricDelta(diff,'aggregateV2'),1)} ${points}</span><span>${compare.evidence||'Evidence width'} ${signed(metricDelta(diff,'confidenceWidth'),1)} ${points}</span><span>${compare.evalCost||'Eval cost'} ${signed(metricDelta(diff,'estimatedEvalCost'),1)}</span><span>${compare.safety||'Safety veto'} ${stateChanged(diff,'safetyVeto')}</span><span>${compare.costGate||'Cost gate'} ${stateChanged(diff,'costGate')}</span>`;
  }

  lab.subscribe(render);

  dataset.addEventListener('change',()=>{
    lab.dispatch('SET_DATASET_PRESET',{value:dataset.value});
    window.AhaFrame?.track('evaluation_dataset_preset_changed',{value:dataset.value});
  });
  threshold.addEventListener('input',()=>{
    lab.dispatch('SET_PASS_THRESHOLD',{value:Number(threshold.value)});
    window.AhaFrame?.track('evaluation_parameter_changed',{parameter:'pass_threshold',value:Number(threshold.value)});
  });
  safety.addEventListener('click',()=>{
    const current=lab.getFrame().state.safetyVeto;
    lab.dispatch('SET_SAFETY_VETO',{value:!current});
    window.AhaFrame?.track('evaluation_safety_veto_changed',{value:!current});
  });
  sampleSize.addEventListener('change',()=>{
    lab.dispatch('SET_SAMPLE_SIZE',{value:Number(sampleSize.value)});
    window.AhaFrame?.track('evaluation_sample_size_changed',{value:Number(sampleSize.value)});
  });
  judgeMode.addEventListener('change',()=>{
    lab.dispatch('SET_JUDGE_MODE',{value:judgeMode.value});
    window.AhaFrame?.track('evaluation_judge_mode_changed',{value:judgeMode.value});
  });
  costGate.addEventListener('click',()=>{
    const current=lab.getFrame().state.costGate;
    lab.dispatch('SET_COST_GATE',{value:!current});
    window.AhaFrame?.track('evaluation_cost_gate_changed',{value:!current});
  });
  production.addEventListener('click',()=>{
    lab.dispatch('APPLY_PRODUCTION_PRESET');
    window.AhaFrame?.track('evaluation_production_preset_applied');
  });
  reset.addEventListener('click',()=>{
    lab.reset();
    window.AhaFrame?.track('evaluation_naive_baseline_reset');
  });
})();
