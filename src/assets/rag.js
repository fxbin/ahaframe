(function(){
  const root=document.querySelector('[data-rag-lab]');
  if(!root)return;

  const lab=window.AhaFrame.createLab('rag-failure');
  lab.checkpoint('baseline');
  let copy={};
  try{copy=JSON.parse(root.dataset.ragCopy||'{}');}catch(_error){copy={};}
  const p=copy.presentation||{};
  const numberLocale=document.documentElement.lang==='zh-CN'?'zh-CN':'en-US';

  const chunk=document.querySelector('#rag-chunk-size');
  const overlap=document.querySelector('#rag-overlap');
  const topK=document.querySelector('#rag-top-k');
  const retrieval=document.querySelector('#rag-retrieval');
  const reranker=document.querySelector('[data-rag-reranker]');
  const balanced=document.querySelector('[data-rag-balanced]');
  const reset=document.querySelector('[data-rag-reset]');

  const outputs={
    chunk:document.querySelector('[data-rag-chunk-value]'),
    overlap:document.querySelector('[data-rag-overlap-value]'),
    topK:document.querySelector('[data-rag-top-k-value]'),
    recall:document.querySelector('[data-rag-recall]'),
    precision:document.querySelector('[data-rag-precision]'),
    context:document.querySelector('[data-rag-context]'),
    quality:document.querySelector('[data-rag-quality]'),
    latency:document.querySelector('[data-rag-latency]'),
    cost:document.querySelector('[data-rag-cost]'),
    failure:document.querySelector('[data-rag-failure]'),
    compare:document.querySelector('[data-rag-compare]'),
    usage:document.querySelector('[data-rag-context-bar]'),
  };

  const signed=(value,digits=0)=>{const n=Number(value)||0;return `${n>=0?'+':''}${n.toFixed(digits)}`;};
  const metricDelta=(diff,key)=>{const item=diff.metrics?.[key];return item?Number(item.after)-Number(item.before):0;};
  const formatFailure=(derived,state)=>{
    if(derived.failureType==='context-overflow'){
      return `${p.overflowPrefix||'Context overflow:'} ${derived.overflowTokens.toLocaleString(numberLocale)} ${p.overflowMiddle||'retrieved tokens exceed the'} ${state.contextBudget.toLocaleString(numberLocale)} ${p.overflowSuffix||'token budget.'}`;
    }
    return p.failure?.[derived.failureType]||derived.failure;
  };

  function render(frame){
    const {state,derived}=frame;
    chunk.value=state.chunkSize;
    overlap.max=Math.max(0,state.chunkSize-50);
    overlap.value=Math.min(state.overlap,Number(overlap.max));
    topK.value=state.topK;
    retrieval.value=state.retrieval;
    outputs.chunk.textContent=`${state.chunkSize.toLocaleString(numberLocale)} ${p.tokens||'tokens'}`;
    outputs.overlap.textContent=`${state.overlap.toLocaleString(numberLocale)} ${p.tokens||'tokens'}`;
    outputs.topK.textContent=String(state.topK);
    reranker.textContent=state.reranker?(copy.rerankerOn||'Reranker: ON'):(copy.rerankerOff||'Reranker: OFF');
    reranker.classList.toggle('primary',state.reranker);

    outputs.recall.textContent=`${(derived.recall*100).toFixed(0)}%`;
    outputs.precision.textContent=`${(derived.precision*100).toFixed(0)}%`;
    outputs.context.textContent=`${derived.contextTokens.toLocaleString(numberLocale)} / ${state.contextBudget.toLocaleString(numberLocale)}`;
    outputs.quality.textContent=derived.qualityScore.toFixed(0);
    outputs.latency.textContent=`${derived.latencyMs} ms`;
    outputs.cost.textContent=derived.costIndex.toFixed(1);
    outputs.failure.textContent=formatFailure(derived,state);
    outputs.failure.dataset.failureType=derived.failureType;
    outputs.usage.style.width=`${Math.min(100,derived.contextUsagePercent)}%`;
    outputs.usage.classList.toggle('overflow',derived.overflowTokens>0);

    const diff=lab.compare('baseline');
    const labels=p.compare||{};
    outputs.compare.innerHTML=`<strong>${labels.title||'Vs. broken baseline'}</strong><span>${labels.quality||'Quality'} ${signed(metricDelta(diff,'qualityScore'))}</span><span>${labels.recall||'Recall'} ${signed(metricDelta(diff,'recallPercent'))} pts</span><span>${labels.precision||'Precision'} ${signed(metricDelta(diff,'precisionPercent'))} pts</span><span>${labels.context||'Context'} ${signed(metricDelta(diff,'contextTokens'))} ${p.tokens||'tokens'}</span>`;
  }

  lab.subscribe(render);

  chunk.addEventListener('input',()=>{lab.dispatch('SET_CHUNK_SIZE',{value:Number(chunk.value)});window.AhaFrame?.track('rag_parameter_changed',{parameter:'chunk_size',value:Number(chunk.value)});});
  overlap.addEventListener('input',()=>{lab.dispatch('SET_OVERLAP',{value:Number(overlap.value)});window.AhaFrame?.track('rag_parameter_changed',{parameter:'overlap',value:Number(overlap.value)});});
  topK.addEventListener('input',()=>{lab.dispatch('SET_TOP_K',{value:Number(topK.value)});window.AhaFrame?.track('rag_parameter_changed',{parameter:'top_k',value:Number(topK.value)});});
  retrieval.addEventListener('change',()=>{lab.dispatch('SET_RETRIEVAL',{value:retrieval.value});window.AhaFrame?.track('rag_parameter_changed',{parameter:'retrieval',value:retrieval.value});});
  reranker.addEventListener('click',()=>{const current=lab.getFrame().state.reranker;lab.dispatch('SET_RERANKER',{value:!current});window.AhaFrame?.track('rag_parameter_changed',{parameter:'reranker',value:!current});});
  balanced.addEventListener('click',()=>{lab.dispatch('APPLY_BALANCED_PRESET');window.AhaFrame?.track('rag_balanced_preset_applied');});
  reset.addEventListener('click',()=>{lab.reset();window.AhaFrame?.track('rag_failure_baseline_reset');});
})();
