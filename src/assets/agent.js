(function(){
  const next=document.querySelector('[data-agent-next]');
  if(!next)return;
  const reset=document.querySelector('[data-agent-reset]');
  const errorButton=document.querySelector('[data-agent-error]');
  const mount=next.closest('[data-agent-copy]');
  let copy={};
  try{copy=JSON.parse(mount?.dataset.agentCopy||'{}');}catch(_error){copy={};}
  const nodes=[...document.querySelectorAll('[data-agent-node]')];
  const timeline=[...document.querySelectorAll('[data-time-step]')];
  const status=document.querySelector('[data-agent-status]');
  const result=document.querySelector('[data-agent-result]');
  const lab=window.AhaFrame.createLab('agent-loop');
  let recoveryTimer=null;

  function cancelRecovery(){
    if(recoveryTimer){
      clearTimeout(recoveryTimer);
      recoveryTimer=null;
    }
  }

  lab.subscribe(({state,derived})=>{
    nodes.forEach((node,i)=>{
      node.classList.toggle('done',i<state.step);
      node.classList.toggle('active',i===state.step);
    });
    timeline.forEach((item,i)=>{
      item.classList.toggle('done',i<state.step);
      item.classList.toggle('active',i===state.step);
    });
    const localizedStatus=state.failure?copy.errorStatus:copy.status?.[Math.min(state.step,(copy.status?.length||1)-1)];
    status.textContent=localizedStatus||derived.status;
    if(derived.metrics?.completed){
      result.textContent=copy.result||derived.result;
    }else{
      result.textContent=copy.waiting||derived.result;
    }
  });

  next.addEventListener('click',()=>{
    cancelRecovery();
    const frame=lab.dispatch('NEXT');
    window.AhaFrame?.track('lesson_step_completed',{lesson:'agent-loop',step:frame.state.step});
  });

  reset?.addEventListener('click',()=>{
    cancelRecovery();
    lab.reset();
  });

  errorButton?.addEventListener('click',()=>{
    cancelRecovery();
    lab.dispatch('INJECT_TOOL_ERROR');
    window.AhaFrame?.track('tool_error_simulated',{lesson:'agent-loop'});
    recoveryTimer=setTimeout(()=>{
      recoveryTimer=null;
      lab.dispatch('RECOVER_TOOL_ERROR');
    },1100);
  });
})();
