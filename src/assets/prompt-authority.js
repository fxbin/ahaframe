(function(){
  const root=document.querySelector('[data-instruction-conflict-lab]');
  if(!root)return;
  const lab=window.AhaFrame.createLab('instruction-conflict');
  lab.checkpoint('broken-prompt');
  const ids=['authority','specificity','retrieval-mode','schema','ambiguity'];
  const controls=Object.fromEntries(ids.map((id)=>[id,document.querySelector(`#instruction-${id}`)]));
  const out=(name)=>document.querySelector(`[data-instruction-${name}]`);
  const signed=(value)=>{const n=Number(value)||0;return `${n>=0?'+':''}${n.toFixed(0)}`;};
  const delta=(diff,key)=>{const item=diff.metrics?.[key];return item?Number(item.after)-Number(item.before):0;};

  function render(frame){
    const {state,derived}=frame;
    controls.authority.value=state.authorityModel;
    controls.specificity.value=state.systemSpecificity;
    controls['retrieval-mode'].value=state.retrievedContentMode;
    controls.schema.value=state.schemaMode;
    controls.ambiguity.value=state.policyAmbiguity;
    out('adherence').textContent=`${derived.instructionAdherence}%`;
    out('ambiguity-risk').textContent=`${derived.ambiguityRisk}%`;
    out('policy-risk').textContent=`${derived.policyViolationRisk}%`;
    out('validity').textContent=`${derived.outputValidity}%`;
    out('prompt-quality').textContent=`${derived.promptQuality}%`;
    out('conflict-count').textContent=String(derived.conflictCount);
    out('harness-risk').textContent=`${derived.harnessRisk}%`;
    out('release-evidence').textContent=derived.releaseEvidence;
    out('diagnosis').textContent=derived.diagnosis;
    out('next-layer').textContent=derived.nextLayer;
    out('state-label').textContent=derived.stateLabel;
    out('source-stack').innerHTML=derived.sourceStack.map((source)=>`<div class="takeaway"><strong>${source.label}</strong><span>${source.authority}</span><small class="subtle">${source.text}</small></div>`).join('');
    const diff=lab.compare('broken-prompt');
    out('compare').innerHTML=`<strong>Vs. baseline</strong><span>Prompt quality ${signed(delta(diff,'promptQuality'))} pts</span><span>Adherence ${signed(delta(diff,'instructionAdherence'))} pts</span><span>Policy risk ${signed(delta(diff,'policyViolationRisk'))} pts</span><span>Conflicts ${signed(delta(diff,'conflictCount'))}</span>`;
  }
  lab.subscribe(render);

  const tracked=(node,eventName,action,parameter)=>node.addEventListener('change',()=>{
    lab.dispatch(action,{value:node.value});
    window.AhaFrame?.track(eventName,{parameter,value:node.value});
  });
  tracked(controls.authority,'instruction_conflict_parameter_changed','SET_AUTHORITY_MODEL','authority_model');
  tracked(controls.specificity,'instruction_conflict_parameter_changed','SET_SYSTEM_SPECIFICITY','system_specificity');
  tracked(controls['retrieval-mode'],'instruction_conflict_parameter_changed','SET_RETRIEVED_CONTENT_MODE','retrieved_content_mode');
  tracked(controls.schema,'instruction_conflict_parameter_changed','SET_SCHEMA_MODE','schema_mode');
  tracked(controls.ambiguity,'instruction_conflict_parameter_changed','SET_POLICY_AMBIGUITY','policy_ambiguity');
  document.querySelector('[data-instruction-preset]').addEventListener('click',()=>{lab.dispatch('APPLY_PROMPT_PRESET');window.AhaFrame?.track('instruction_conflict_prompt_preset_applied');});
  document.querySelector('[data-instruction-reset]').addEventListener('click',()=>{lab.reset();window.AhaFrame?.track('instruction_conflict_baseline_reset');});
})();
