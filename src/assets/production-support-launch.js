(function(){
  'use strict';

  const root=document.querySelector('[data-production-support-launch]');
  if(!root)return;

  let copy={};
  try{copy=JSON.parse(root.dataset.missionCopy||'{}');}catch(_error){copy={};}
  const ui=copy.ui||{};
  const outcomes=copy.outcomes||{};
  const metricSpecs=new Map((copy.metrics||[]).map((item)=>[item.key,item]));
  const metricLabels=copy.metricLabels||{};
  const groups=copy.groups||{};
  const mission=window.AhaFrame.createMission('production-support-launch');

  const workspace=root.querySelector('[data-mission-workspace]');
  const start=root.querySelector('[data-mission-start]');
  const budget=root.querySelector('[data-mission-budget]');
  const evidenceView=root.querySelector('[data-mission-evidence-view]');
  const outcome=root.querySelector('[data-mission-outcome]');
  const attemptsView=root.querySelector('[data-mission-attempts]');
  const compareView=root.querySelector('[data-mission-compare]');
  const blockersView=root.querySelector('[data-mission-blockers]');
  const warningsView=root.querySelector('[data-mission-warnings]');
  const status=root.querySelector('[data-mission-status]');
  const decisionStatus=root.querySelector('[data-mission-decision-status]');
  const debrief=root.querySelector('[data-mission-debrief]');
  const rationale=root.querySelector('[data-mission-rationale]');
  const controls=[...root.querySelectorAll('[data-mission-control]')];
  const decisionButtons=[...root.querySelectorAll('[data-mission-decision]')];
  const numberLocale=document.documentElement.lang==='zh-CN'?'zh-CN':'en-US';
  let pendingDecision='';

  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const formatTemplate=(template,vars={})=>String(template||'').replace(/\{([a-zA-Z0-9_]+)\}/g,(_match,key)=>vars[key]??`{${key}}`);
  const signed=(value)=>{const n=Number(value)||0;return `${n>=0?'+':''}${n.toFixed(1)}`;};

  function labelForMetric(key){return metricLabels[key]||String(key).replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/^./,(c)=>c.toUpperCase());}
  function formatNumber(key,value){
    if(value===undefined||value===null)return '—';
    const n=Number(value);
    if(!Number.isFinite(n))return String(value);
    const spec=metricSpecs.get(key)||{};
    if(spec.format==='score')return n.toFixed(1);
    if(/Percent$/.test(key)||/(Risk|Adherence|Quality)$/.test(key))return `${n.toFixed(1)}%`;
    if(/Tokens$/.test(key)||key==='contextTokens'||key==='overflowTokens')return n.toLocaleString(numberLocale,{maximumFractionDigits:0});
    return n.toLocaleString(numberLocale,{maximumFractionDigits:1});
  }
  function list(node,items,empty){
    node.innerHTML=items.length?items.map((item)=>`<li>${esc(item)}</li>`).join(''):`<li>${esc(empty)}</li>`;
  }
  function localizedIssues(details,templates){
    return (details||[]).map((item)=>formatTemplate(templates?.[item.code]||item.code,item.params||{}));
  }
  function renderMetricsObject(value){
    if(!value||typeof value!=='object')return `<span>${esc(value)}</span>`;
    return `<div style="display:grid;gap:7px">${Object.entries(value).map(([key,item])=>`<div><strong>${esc(labelForMetric(key))}:</strong> ${esc(formatNumber(key,item))}</div>`).join('')}</div>`;
  }

  function syncControls(frame){
    controls.forEach((control)=>{
      const stateKey=control.dataset.stateKey;
      if(stateKey&&frame.state[stateKey]!==undefined)control.value=String(frame.state[stateKey]);
    });
  }
  function renderBudget(){
    const state=mission.getMissionState();
    budget.textContent=state.remainingBudget===null?'∞':String(state.remainingBudget);
  }
  function clearResult(){
    root.querySelectorAll('[data-mission-metric]').forEach((node)=>{node.textContent='—';});
    outcome.textContent='—';
    list(blockersView,[],ui.noBlockers||'No modeled release blockers.');
    list(warningsView,[],ui.noWarnings||'No additional modeled warnings.');
  }
  function renderAttempt(attempt){
    const derived=attempt.frame.derived;
    const metrics=derived.metrics||{};
    root.querySelectorAll('[data-mission-metric]').forEach((node)=>{
      node.textContent=formatNumber(node.dataset.missionMetric,metrics[node.dataset.missionMetric]);
    });
    outcome.textContent=outcomes[attempt.outcomeCode]||attempt.outcomeCode;
    list(blockersView,localizedIssues(derived.blockerDetails,copy.blockers),ui.noBlockers||'No modeled release blockers.');
    list(warningsView,localizedIssues(derived.warningDetails,copy.warnings),ui.noWarnings||'No additional modeled warnings.');

    const attempts=mission.listAttempts();
    attemptsView.innerHTML=attempts.map((item)=>{
      const m=item.frame.derived.metrics||{};
      return `<div class="takeaway"><strong>#${item.attemptNumber} · ${esc(outcomes[item.outcomeCode]||item.outcomeCode)}</strong><span>${esc(labelForMetric('architectureScore'))} ${esc(formatNumber('architectureScore',m.architectureScore))} · ${esc(labelForMetric('safety'))} ${esc(formatNumber('safety',m.safety))} · ${esc(labelForMetric('costIndex'))} ${esc(formatNumber('costIndex',m.costIndex))} · budget ${item.interventionBudgetSpent}/5</span></div>`;
    }).join('');
    if(attempts.length>=2){
      const diff=mission.compareAttempts(1,attempts[attempts.length-1].attemptNumber);
      const values=diff.lab.metrics||{};
      compareView.hidden=false;
      compareView.innerHTML=`<strong>${esc(ui.compared||'Inherited baseline → latest')}</strong><br>${esc(outcomes[diff.outcomes.before]||diff.outcomes.before)} → ${esc(outcomes[diff.outcomes.after]||diff.outcomes.after)}<br>${esc(labelForMetric('architectureScore'))} ${signed(Number(values.architectureScore?.after||0)-Number(values.architectureScore?.before||0))} · ${esc(labelForMetric('safety'))} ${signed(Number(values.safety?.after||0)-Number(values.safety?.before||0))}`;
    }else compareView.hidden=true;
  }
  function resetUi(){
    const snapshot=mission.getSnapshot();
    workspace.hidden=true;
    start.disabled=false;
    debrief.hidden=true;
    pendingDecision='';
    rationale.value='';
    decisionStatus.textContent='';
    status.textContent='';
    evidenceView.textContent=ui.waiting||'Inspect evidence before spending budget.';
    attemptsView.innerHTML=`<div class="takeaway"><span>${esc(ui.noAttempts||'No candidate replay yet.')}</span></div>`;
    compareView.hidden=true;
    decisionButtons.forEach((button)=>button.classList.remove('primary'));
    controls.forEach((control)=>{control.disabled=false;});
    root.querySelector('[data-mission-run]').disabled=false;
    root.querySelector('[data-mission-submit-decision]').disabled=false;
    root.querySelector('[data-mission-complete]').disabled=false;
    clearResult();renderBudget();syncControls(snapshot.frame);
  }

  start.addEventListener('click',()=>{
    mission.start();workspace.hidden=false;start.disabled=true;renderBudget();
    window.AhaFrame?.track?.('mission_started',{missionId:'production-support-launch'});
  });

  root.querySelectorAll('[data-mission-evidence]').forEach((button)=>button.addEventListener('click',()=>{
    try{
      const result=mission.inspectEvidence(button.dataset.missionEvidence);
      let html=renderMetricsObject(result.value);
      if(result.id==='release-blockers')html=renderMetricsObject(Object.fromEntries((result.value||[]).map((item)=>[formatTemplate((copy.blockers||{})[item.code]||item.code,item.params||{}),''])));
      if(result.id==='tradeoff-warnings')html=renderMetricsObject(Object.fromEntries((result.value||[]).map((item)=>[formatTemplate((copy.warnings||{})[item.code]||item.code,item.params||{}),''])));
      evidenceView.innerHTML=`<strong>${esc((copy.evidenceLabels||{})[result.id]||result.id)}</strong><div style="margin-top:10px">${html}</div>`;
    }catch(error){status.textContent=error.message||'Unable to inspect evidence.';}
  }));

  controls.forEach((control)=>control.addEventListener('change',()=>{
    const interventionId=control.dataset.missionControl;
    try{
      mission.intervene(interventionId,{value:control.value});
      status.textContent='';outcome.textContent=ui.waiting||'Replay the candidate.';renderBudget();
      window.AhaFrame?.track?.('reliable_support_agent_architecture_changed',{missionId:'production-support-launch',interventionId,value:control.value});
    }catch(error){
      status.textContent=error.message||'Unable to change architecture.';
      syncControls(mission.getLabFrame());
    }
  }));

  root.querySelector('[data-mission-run]').addEventListener('click',()=>{
    try{
      const result=mission.runSimulation();renderAttempt(result.attempt);status.textContent='';
      window.AhaFrame?.track?.('simulation_run',{missionId:'production-support-launch',attemptNumber:result.attempt.attemptNumber,outcomeCode:result.attempt.outcomeCode});
    }catch(error){status.textContent=error.message||'Unable to replay candidate.';}
  });

  decisionButtons.forEach((button)=>button.addEventListener('click',()=>{
    pendingDecision=button.dataset.missionDecision;
    decisionButtons.forEach((node)=>node.classList.toggle('primary',node===button));
    decisionStatus.textContent='';
  }));

  root.querySelector('[data-mission-submit-decision]').addEventListener('click',()=>{
    const text=String(rationale.value||'').trim();
    if(!pendingDecision){decisionStatus.textContent=ui.releaseHint||'Choose a release decision.';return;}
    if(text.length<10){decisionStatus.textContent=ui.rationaleRequired||'Write a short rationale first.';return;}
    try{
      if(mission.getMissionState().phase==='REVIEW')mission.readyToDecide();
      const decided=mission.submitReleaseDecision(pendingDecision);
      const bucket=text.length<80?'short':text.length<=200?'medium':'long';
      decisionStatus.textContent=`${pendingDecision} · ${outcomes[decided.mission.outcomeCode]||decided.mission.outcomeCode}`;
      debrief.hidden=false;
      controls.forEach((control)=>{control.disabled=true;});
      root.querySelector('[data-mission-run]').disabled=true;
      root.querySelector('[data-mission-submit-decision]').disabled=true;
      window.AhaFrame?.track?.('release_decision_submitted',{missionId:'production-support-launch',decision:pendingDecision,outcomeCode:decided.mission.outcomeCode,rationalePresent:true,rationaleLengthBucket:bucket});
    }catch(error){decisionStatus.textContent=error.message||ui.releaseHint||'Unable to submit decision.';}
  });

  root.querySelector('[data-mission-complete]').addEventListener('click',()=>{
    try{
      mission.complete();
      const state=mission.getMissionState();
      window.AhaFrame?.track?.('mission_completed',{missionId:'production-support-launch',decision:state.releaseDecision,outcomeCode:state.outcomeCode});
      root.querySelector('[data-mission-complete]').disabled=true;
    }catch(error){decisionStatus.textContent=error.message||'Unable to complete Final Boss.';}
  });

  root.querySelector('[data-mission-reset]').addEventListener('click',()=>{mission.reset();resetUi();});
  resetUi();
})();
