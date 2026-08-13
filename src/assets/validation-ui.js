(function(root){
  'use strict';
  if(!root.document)return;
  const AhaFrame=root.AhaFrame=root.AhaFrame||{};
  const STATE_KEY='ahaframe_validation_state_v1';
  const VISITED_KEY='ahaframe_validation_labs_v1';
  const FEEDBACK_KEY='ahaframe_aha_feedback_v1';
  const read=(store,key,fallback)=>{try{return JSON.parse(store.getItem(key)||'')||fallback}catch(_){return fallback}};
  const write=(store,key,value)=>{try{store.setItem(key,JSON.stringify(value))}catch(_){}};
  const interactionPattern=/(parameter_changed|strategy_selected|sampling_changed|temperature_changed|preset_applied|protection_changed|veto_changed|cost_gate_changed|judge_mode_changed|sample_size_changed|tool_error_simulated|architecture_changed|prompt_preset_applied|balanced_preset_applied|policy_changed)/;
  const derivedEvents=new Set(['lab_started','meaningful_interaction','failure_tradeoff_observed','second_lab_started','paid_intent_clicked','return_visit','aha_feedback_submitted','capstone_started','capstone_completed']);
  const state=()=>read(root.sessionStorage,STATE_KEY,{labs:{},canonical:{}});
  const saveState=(value)=>write(root.sessionStorage,STATE_KEY,value);
  const visited=()=>read(root.localStorage,VISITED_KEY,[]);
  const feedbackItems=()=>read(root.localStorage,FEEDBACK_KEY,[]);
  const context=()=>AhaFrame.getValidationContext?.()||{};

  function emitOnce(name,props={}){
    const current=state(); const meta=context(); const key=`${name}:${meta.labId||root.location.pathname}`;
    if(current.canonical[key])return;
    current.canonical[key]=true; saveState(current); AhaFrame.track?.(name,props);
  }
  function revealFeedback(){
    const meta=context(); if(!meta.labId||feedbackItems().some((item)=>item.labId===meta.labId))return;
    const section=createFeedback(); if(section)section.hidden=false;
  }
  function recordInteraction(sourceEvent){
    const meta=context(); if(!meta.labId)return;
    const current=state(); const lab=current.labs[meta.labId]||{count:0,started:false,meaningful:false};
    lab.count+=1;
    if(!lab.started){
      lab.started=true;
      AhaFrame.track?.(meta.pageType==='capstone'?'capstone_started':'lab_started',{sourceEvent,interactionCount:lab.count});
      const prior=visited(); const other=prior.filter((item)=>item.labId!==meta.labId);
      if(other.length){const previous=other[other.length-1];AhaFrame.track?.('second_lab_started',{previousLabId:previous.labId,crossLayer:previous.layer!==meta.layer});}
      if(!prior.some((item)=>item.labId===meta.labId)){prior.push({labId:meta.labId,layer:meta.layer,firstStartedAt:new Date().toISOString()});write(root.localStorage,VISITED_KEY,prior);}
    }
    if(!lab.meaningful&&(lab.count>=2||/(preset_applied|tool_error_simulated)/.test(sourceEvent))){
      lab.meaningful=true;
      AhaFrame.track?.('meaningful_interaction',{sourceEvent,interactionCount:lab.count});
      AhaFrame.track?.('failure_tradeoff_observed',{sourceEvent,interactionCount:lab.count});
      revealFeedback();
    }
    current.labs[meta.labId]=lab; saveState(current);
  }
  function createFeedback(){
    const meta=context(); if(!meta.labId||meta.pageType==='lesson')return null;
    const existing=root.document.querySelector('[data-aha-feedback]'); if(existing)return existing;
    const section=root.document.createElement('section'); section.className='card aha-feedback'; section.dataset.ahaFeedback=''; section.hidden=true;
    section.innerHTML='<span class="eyebrow">Aha check</span><h3>Did this change how you think about this system?</h3><p class="subtle">This measures a mental-model shift, not whether you liked the UI.</p><div class="aha-options"><button type="button" data-aha-rating="no">No</button><button type="button" data-aha-rating="little">A little</button><button type="button" data-aha-rating="yes">Yes</button><button type="button" data-aha-rating="aha">Oh, I finally get it.</button></div><label class="label" for="aha-note">What do you understand differently now? <span class="subtle">Optional</span></label><textarea id="aha-note" class="input aha-note" rows="3" maxlength="1200" placeholder="A sentence is enough."></textarea><div class="actions"><button type="button" class="btn primary" data-aha-submit disabled>Send feedback</button></div><div class="status" data-aha-status></div>';
    const anchor=root.document.querySelector('.next-band')||root.document.querySelector('.build-card');
    if(anchor?.parentNode)anchor.parentNode.insertBefore(section,anchor); else root.document.querySelector('main')?.appendChild(section);
    let selected='';
    section.querySelectorAll('[data-aha-rating]').forEach((button)=>button.addEventListener('click',()=>{selected=button.dataset.ahaRating;section.querySelectorAll('[data-aha-rating]').forEach((node)=>node.classList.toggle('selected',node===button));section.querySelector('[data-aha-submit]').disabled=false;}));
    section.querySelector('[data-aha-submit]').addEventListener('click',async()=>{
      if(!selected)return; const submit=section.querySelector('[data-aha-submit]'); const status=section.querySelector('[data-aha-status]'); submit.disabled=true;
      try{
        const result=await AhaFrame.submitFeedback(selected,section.querySelector('#aha-note').value);
        AhaFrame.track?.('aha_feedback_submitted',{rating:selected,strongAha:AhaFrame.isStrongAha(selected),qualitativePresent:Boolean(result.payload.note),remote:result.remote});
        status.textContent=result.remote?'Thanks — your feedback was recorded.':'Demo mode: feedback was saved only in this browser because no feedback backend is configured.'; status.className=result.remote?'status ok':'status';
        section.querySelectorAll('button,textarea').forEach((node)=>node.disabled=true);
      }catch(_){submit.disabled=false;status.textContent='Could not send feedback right now. Please try again.';status.className='status';}
    });
    return section;
  }
  function boot(){
    const meta=context(); createFeedback();
    if(meta.pageType==='landing')AhaFrame.track?.('landing_viewed');
    if(meta.pageType==='lab'||meta.pageType==='lesson')AhaFrame.track?.('lab_viewed');
    if(meta.pageType==='capstone')AhaFrame.track?.('capstone_viewed');
    if(meta.pageType==='pricing')AhaFrame.track?.('pricing_viewed');
    const current=state(); if(meta.returnVisit&&!current.canonical.returnVisit){current.canonical.returnVisit=true;saveState(current);AhaFrame.track?.('return_visit',{visitCount:meta.visitCount});}
  }
  root.addEventListener('ahaframe:event',(event)=>{
    const name=event.detail?.name||'';
    if(derivedEvents.has(name)||name.endsWith('_viewed')||name==='waitlist_submitted')return;
    if(interactionPattern.test(name))recordInteraction(name);
    if(name==='pricing_foundations_click'||name==='pricing_pro_click')emitOnce('paid_intent_clicked',{sourceEvent:name});
  });
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})(typeof window!=='undefined'?window:globalThis);
