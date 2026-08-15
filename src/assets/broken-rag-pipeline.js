(function(){
  'use strict';

  const root=document.querySelector('[data-broken-rag-mission]');
  if(!root)return;

  let copy={};
  try{copy=JSON.parse(root.dataset.missionCopy||'{}');}catch(_error){copy={};}
  const ui=copy.ui||{};
  const outcomes=copy.outcomes||{};
  const metricSpecs=new Map((copy.metrics||[]).map((item)=>[item.key,item]));
  const mission=window.AhaFrame.createMission('broken-rag-pipeline');
  const workspace=root.querySelector('[data-mission-workspace]');
  const start=root.querySelector('[data-mission-start]');
  const budget=root.querySelector('[data-mission-budget]');
  const evidenceView=root.querySelector('[data-mission-evidence-view]');
  const outcome=root.querySelector('[data-mission-outcome]');
  const attemptsView=root.querySelector('[data-mission-attempts]');
  const compareView=root.querySelector('[data-mission-compare]');
  const status=root.querySelector('[data-mission-status]');
  const decisionStatus=root.querySelector('[data-mission-decision-status]');
  const debrief=root.querySelector('[data-mission-debrief]');
  const controls=[...root.querySelectorAll('[data-mission-control]')];
  const numberLocale=document.documentElement.lang==='zh-CN'?'zh-CN':'en-US';

  const stateKeys={
    'retrieval-strategy':'retrieval',
    'top-k':'topK',
    'rerank-depth':'rerankDepth',
    'freshness-policy':'freshness',
    'authority-policy':'authority',
    'compression-policy':'compression',
  };

  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const labelize=(key)=>String(key).replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').replace(/^./,(c)=>c.toUpperCase());

  function renderData(value){
    if(Array.isArray(value)){
      if(!value.length)return '<span class="subtle">—</span>';
      return `<div class="takeaways">${value.map((item)=>`<div class="takeaway">${renderData(item)}</div>`).join('')}</div>`;
    }
    if(value&&typeof value==='object'){
      return `<div style="display:grid;gap:6px">${Object.entries(value).map(([key,item])=>`<div><strong>${esc(labelize(key))}:</strong> ${renderData(item)}</div>`).join('')}</div>`;
    }
    if(typeof value==='boolean')return `<span>${value?'✓':'—'}</span>`;
    if(typeof value==='number')return `<span>${value.toLocaleString(numberLocale,{maximumFractionDigits:3})}</span>`;
    return `<span>${esc(value)}</span>`;
  }

  function formatMetric(key,value){
    const spec=metricSpecs.get(key)||{};
    if(value===undefined||value===null)return '—';
    if(spec.format==='percent')return `${Number(value).toFixed(0)}%`;
    if(spec.format==='score')return Number(value).toFixed(0);
    if(spec.format==='ms')return `${Number(value).toLocaleString(numberLocale)} ms`;
    if(spec.format==='integer')return Number(value).toLocaleString(numberLocale);
    if(spec.format==='decimal')return Number(value).toFixed(1);
    return String(value);
  }

  function syncControls(frame){
    controls.forEach((control)=>{
      const key=stateKeys[control.dataset.missionControl];
      if(key&&frame.state[key]!==undefined)control.value=String(frame.state[key]);
    });
  }

  function renderBudget(){
    const state=mission.getMissionState();
    budget.textContent=state.remainingBudget===null?'∞':String(state.remainingBudget);
  }

  function clearMetrics(){
    root.querySelectorAll('[data-mission-metric]').forEach((node)=>{node.textContent='—';});
    outcome.textContent='—';
  }

  function renderAttempt(attempt){
    const metrics=attempt.frame.derived.metrics||{};
    root.querySelectorAll('[data-mission-metric]').forEach((node)=>{
      node.textContent=formatMetric(node.dataset.missionMetric,metrics[node.dataset.missionMetric]);
    });
    outcome.textContent=outcomes[attempt.outcomeCode]||attempt.outcomeCode;
    const attempts=mission.listAttempts();
    attemptsView.innerHTML=attempts.map((item)=>{
      const m=item.frame.derived.metrics||{};
      return `<div class="takeaway"><strong>#${item.attemptNumber} · ${esc(outcomes[item.outcomeCode]||item.outcomeCode)}</strong><span>stale ${formatMetric('staleEvidenceRiskPercent',m.staleEvidenceRiskPercent)} · grounding ${formatMetric('groundingScore',m.groundingScore)} · context ${formatMetric('contextTokens',m.contextTokens)} · ${formatMetric('latencyMs',m.latencyMs)}</span></div>`;
    }).join('');
    if(attempts.length>=2){
      const diff=mission.compareAttempts(1,attempts[attempts.length-1].attemptNumber);
      compareView.hidden=false;
      compareView.innerHTML=`<strong>${esc(ui.compared||'Baseline → latest')}</strong><br>${esc(outcomes[diff.outcomes.before]||diff.outcomes.before)} → ${esc(outcomes[diff.outcomes.after]||diff.outcomes.after)}`;
    }else{
      compareView.hidden=true;
    }
  }

  function resetUi(){
    const snapshot=mission.getSnapshot();
    workspace.hidden=true;
    start.disabled=false;
    debrief.hidden=true;
    decisionStatus.textContent='';
    status.textContent='';
    evidenceView.textContent=ui.waiting||'Inspect evidence.';
    attemptsView.innerHTML=`<div class="takeaway"><span>${esc(ui.noAttempts||'No simulation run yet.')}</span></div>`;
    compareView.hidden=true;
    clearMetrics();
    renderBudget();
    syncControls(snapshot.frame);
  }

  start.addEventListener('click',()=>{
    mission.start();
    workspace.hidden=false;
    start.disabled=true;
    renderBudget();
    window.AhaFrame?.track?.('mission_started',{missionId:'broken-rag-pipeline'});
  });

  root.querySelectorAll('[data-mission-evidence]').forEach((button)=>button.addEventListener('click',()=>{
    try{
      const result=mission.inspectEvidence(button.dataset.missionEvidence);
      evidenceView.innerHTML=`<strong>${esc((copy.evidenceLabels||{})[result.id]||result.id)}</strong><div style="margin-top:10px">${renderData(result.value)}</div>`;
    }catch(error){status.textContent=error.message||ui.error||'Unable to inspect evidence.';}
  }));

  controls.forEach((control)=>control.addEventListener('change',()=>{
    const id=control.dataset.missionControl;
    const value=control.dataset.valueType==='number'?Number(control.value):control.value;
    try{
      mission.intervene(id,{value});
      status.textContent='';
      outcome.textContent=ui.waiting||'Run the pipeline.';
      renderBudget();
      window.AhaFrame?.track?.('rag_parameter_changed',{missionId:'broken-rag-pipeline',interventionId:id});
    }catch(error){
      status.textContent=error.message||ui.error||'Unable to change policy.';
      syncControls(mission.getLabFrame());
    }
  }));

  root.querySelector('[data-mission-run]').addEventListener('click',()=>{
    try{
      const result=mission.runSimulation();
      renderAttempt(result.attempt);
      status.textContent='';
      window.AhaFrame?.track?.('simulation_run',{missionId:'broken-rag-pipeline',attemptNumber:result.attempt.attemptNumber,outcomeCode:result.attempt.outcomeCode});
    }catch(error){status.textContent=error.message||ui.error||'Unable to run simulation.';}
  });

  root.querySelectorAll('[data-mission-decision]').forEach((button)=>button.addEventListener('click',()=>{
    try{
      const current=mission.getMissionState();
      if(current.phase==='REVIEW')mission.readyToDecide();
      const decided=mission.submitReleaseDecision(button.dataset.missionDecision);
      decisionStatus.textContent=`${button.dataset.missionDecision} · ${outcomes[decided.mission.outcomeCode]||decided.mission.outcomeCode}`;
      debrief.hidden=false;
      window.AhaFrame?.track?.('release_decision_submitted',{missionId:'broken-rag-pipeline',decision:button.dataset.missionDecision,outcomeCode:decided.mission.outcomeCode});
    }catch(error){decisionStatus.textContent=ui.releaseHint||error.message;}
  }));

  root.querySelector('[data-mission-complete]').addEventListener('click',()=>{
    try{
      mission.complete();
      window.AhaFrame?.track?.('mission_completed',{missionId:'broken-rag-pipeline',outcomeCode:mission.getMissionState().outcomeCode});
      root.querySelector('[data-mission-complete]').disabled=true;
    }catch(error){decisionStatus.textContent=error.message||ui.error||'Unable to complete Mission.';}
  });

  root.querySelector('[data-mission-reset]').addEventListener('click',()=>{
    mission.reset();
    resetUi();
  });

  resetUi();
})();
