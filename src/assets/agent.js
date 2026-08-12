(function(){
  const next=document.querySelector('[data-agent-next]');
  if(!next)return;
  const reset=document.querySelector('[data-agent-reset]');
  const errorButton=document.querySelector('[data-agent-error]');
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
      node.classList.toggle('active',i===state.step&&!state.failure);
    });
    timeline.forEach((item,i)=>{
      item.classList.toggle('done',i<state.step);
      item.classList.toggle('active',i===state.step&&!state.failure);
    });
    status.textContent=derived.status;
    result.textContent=derived.result;
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
