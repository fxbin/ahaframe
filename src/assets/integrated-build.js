(function(){
  const root=document.querySelector('[data-reliable-support-agent]');
  if(!root)return;
  const lab=window.AhaFrame.createLab('reliable-support-agent');
  lab.checkpoint('baseline');
  const keys=['prompt','retrieval','context','execution','graph','evaluation'];
  const controls=Object.fromEntries(keys.map((key)=>[key,document.querySelector(`#build-${key}-policy`)]));
  const actions={prompt:'SET_PROMPT_POLICY',retrieval:'SET_RETRIEVAL_POLICY',context:'SET_CONTEXT_POLICY',execution:'SET_EXECUTION_POLICY',graph:'SET_GRAPH_POLICY',evaluation:'SET_EVALUATION_POLICY'};
  const out=(name)=>document.querySelector(`[data-build-${name}]`);
  const signed=(value)=>{const n=Number(value)||0;return `${n>=0?'+':''}${n.toFixed(1)}`;};
  const delta=(diff,key)=>{const item=diff.metrics?.[key];return item?Number(item.after)-Number(item.before):0;};
  function list(node,items,empty){node.innerHTML=items.length?items.map((item)=>`<li>${item}</li>`).join(''):`<li>${empty}</li>`;}
  function render(frame){
    const {state,derived}=frame;
    keys.forEach((key)=>{controls[key].value=state[`${key}Policy`];});
    out('decision').textContent=derived.decision;
    for(const [name,value] of Object.entries({architecture:derived.architectureScore,task:derived.taskReadiness,reliability:derived.reliability,safety:derived.safety,latency:derived.latencyIndex,cost:derived.costIndex}))out(name).textContent=value.toFixed(1);
    out('diagnosis').textContent=derived.diagnosis;
    out('evidence').textContent=`${derived.labels.evaluation} · evidence width ${derived.evaluation.confidenceWidth.toFixed(1)} pts`;
    list(out('blockers'),derived.blockers,'No modeled release blockers.');
    list(out('warnings'),derived.warnings,'No additional modeled warnings.');
    out('tradeoffs').innerHTML=derived.tradeoffs.map((item)=>`<li>${item}</li>`).join('');
    out('stack').innerHTML=keys.map((key,index)=>`<span class="flow-node">${derived.labels[key]}</span>${index<keys.length-1?'<span class="flow-arrow">→</span>':''}`).join('');
    const diff=lab.compare('baseline');
    out('compare').innerHTML=`<strong>Vs. baseline</strong><span>Architecture ${signed(delta(diff,'architectureScore'))}</span><span>Reliability ${signed(delta(diff,'reliability'))}</span><span>Safety ${signed(delta(diff,'safety'))}</span><span>Cost ${signed(delta(diff,'costIndex'))}</span>`;
  }
  lab.subscribe(render);
  keys.forEach((key)=>controls[key].addEventListener('change',()=>lab.dispatch(actions[key],{value:controls[key].value})));
  document.querySelector('[data-build-reference]').addEventListener('click',()=>lab.dispatch('APPLY_REFERENCE_ARCHITECTURE'));
  document.querySelector('[data-build-reset]').addEventListener('click',()=>lab.reset());
})();
