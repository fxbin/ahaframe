(function(){
  const root=document.querySelector('[data-reliable-support-agent]');
  if(!root)return;
  const copy=JSON.parse(root.dataset.buildCopy||'{}');
  const lab=window.AhaFrame.createLab('reliable-support-agent');
  lab.checkpoint('baseline');
  const keys=['prompt','retrieval','context','execution','graph','evaluation'];
  const controls=Object.fromEntries(keys.map((key)=>[key,document.querySelector(`#build-${key}-policy`)]));
  const actions={prompt:'SET_PROMPT_POLICY',retrieval:'SET_RETRIEVAL_POLICY',context:'SET_CONTEXT_POLICY',execution:'SET_EXECUTION_POLICY',graph:'SET_GRAPH_POLICY',evaluation:'SET_EVALUATION_POLICY'};
  const out=(name)=>document.querySelector(`[data-build-${name}]`);
  const signed=(value)=>{const n=Number(value)||0;return `${n>=0?'+':''}${n.toFixed(1)}`;};
  const delta=(diff,key)=>{const item=diff.metrics?.[key];return item?Number(item.after)-Number(item.before):0;};
  const format=(template,vars={})=>String(template||'').replace(/\{([a-zA-Z0-9_]+)\}/g,(_,key)=>vars[key]??`{${key}}`);
  const labelFor=(key,state)=>copy.policyLabels?.[key]?.[state[`${key}Policy`]]||state[`${key}Policy`];
  function list(node,items,empty){node.innerHTML=items.length?items.map((item)=>`<li>${item}</li>`).join(''):`<li>${empty}</li>`;}
  function localizedIssues(details,fallback,templates){
    if(!Array.isArray(details)||!details.length)return fallback||[];
    return details.map((item,index)=>format(templates?.[item.code]||fallback?.[index]||item.code,item.params));
  }
  function render(frame){
    const {state,derived}=frame;
    const labels=Object.fromEntries(keys.map((key)=>[key,labelFor(key,state)]));
    const blockerItems=localizedIssues(derived.blockerDetails,derived.blockers,copy.blockers);
    const warningItems=localizedIssues(derived.warningDetails,derived.warnings,copy.warnings);
    keys.forEach((key)=>{controls[key].value=state[`${key}Policy`];});
    out('decision').textContent=copy.decision?.[derived.decision]||derived.decision;
    out('decision').dataset.decision=derived.decision;
    for(const [name,value] of Object.entries({architecture:derived.architectureScore,task:derived.taskReadiness,reliability:derived.reliability,safety:derived.safety,latency:derived.latencyIndex,cost:derived.costIndex}))out(name).textContent=value.toFixed(1);
    const firstBlocker=blockerItems[0]||'';
    out('diagnosis').textContent=format(copy.diagnosis?.[derived.diagnosisCode]||derived.diagnosis,{blocker:firstBlocker});
    out('diagnosis').dataset.diagnosisCode=derived.diagnosisCode;
    out('evidence').textContent=format(copy.evidence||'{evaluation} · evidence width {width} pts',{evaluation:labels.evaluation,width:derived.evaluation.confidenceWidth.toFixed(1)});
    list(out('blockers'),blockerItems,copy.emptyBlockers||'No modeled release blockers.');
    list(out('warnings'),warningItems,copy.emptyWarnings||'No additional modeled warnings.');
    const t=copy.tradeoffs||{};
    const tradeoffs=[
      format(t.prompt||'Prompt — {label}: {quality} quality / {risk}% policy risk.',{label:labels.prompt,quality:derived.prompt.promptQuality.toFixed(0),risk:derived.prompt.policyViolationRisk.toFixed(0)}),
      format(t.context||'Context — {retrieval} + {context}: {recall}% recall / {retention}% critical retention.',{retrieval:labels.retrieval,context:labels.context,recall:(derived.rag.recall*100).toFixed(1),retention:derived.context.criticalRetentionPercent.toFixed(1)}),
      format(t.execution||'Harness + Loop — {label}: {success}% success / {runaway}% runaway risk.',{label:labels.execution,success:(derived.agent.successRate*100).toFixed(1),runaway:(derived.agent.runawayRisk*100).toFixed(1)}),
      format(t.graph||'Graph — {label}: {propagation}% failure propagation / {coordination} coordination.',{label:labels.graph,propagation:(derived.graph.failurePropagationRisk*100).toFixed(0),coordination:derived.graph.coordinationOverhead.toFixed(0)}),
      format(t.evaluation||'Evaluation — {label}: {width}-point evidence width / {veto}.',{label:labels.evaluation,width:derived.evaluation.confidenceWidth.toFixed(1),veto:state.evaluationPolicy==='demo'?(copy.veto?.off||'no safety veto'):(copy.veto?.on||'safety veto')}),
    ];
    list(out('tradeoffs'),tradeoffs,'');
    out('stack').innerHTML=keys.map((key,index)=>`<span class="flow-node">${labels[key]}</span>${index<keys.length-1?'<span class="flow-arrow">→</span>':''}`).join('');
    const diff=lab.compare('baseline');
    const compare=copy.compare||{};
    out('compare').innerHTML=`<strong>${compare.title||'Vs. baseline'}</strong><span>${compare.architecture||'Architecture'} ${signed(delta(diff,'architectureScore'))}</span><span>${compare.reliability||'Reliability'} ${signed(delta(diff,'reliability'))}</span><span>${compare.safety||'Safety'} ${signed(delta(diff,'safety'))}</span><span>${compare.cost||'Cost'} ${signed(delta(diff,'costIndex'))}</span>`;
  }
  lab.subscribe(render);
  keys.forEach((key)=>controls[key].addEventListener('change',()=>lab.dispatch(actions[key],{value:controls[key].value})));
  document.querySelector('[data-build-reference]').addEventListener('click',()=>lab.dispatch('APPLY_REFERENCE_ARCHITECTURE'));
  document.querySelector('[data-build-reset]').addEventListener('click',()=>lab.reset());
})();
