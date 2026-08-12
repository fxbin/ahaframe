(function(){
  const buttons=[...document.querySelectorAll('[data-strategy]')];
  if(!buttons.length)return;
  const count=document.querySelector('[data-after-count]');
  const bar=document.querySelector('[data-after-bar]');
  const note=document.querySelector('[data-after-note]');
  const lab=window.AhaFrame.createLab('context-window');

  lab.subscribe(({state,derived})=>{
    buttons.forEach((button)=>button.classList.toggle('active',button.dataset.strategy===state.strategy));
    count.textContent=derived.activeTokens.toLocaleString('en-US');
    bar.style.width=Math.round(derived.utilizationPercent)+'%';
    note.textContent=derived.note;
  });

  buttons.forEach((button)=>button.addEventListener('click',()=>{
    const strategy=button.dataset.strategy;
    lab.dispatch('SELECT_STRATEGY',{strategy});
    window.AhaFrame?.track('interaction_strategy_selected',{lesson:'context-window',strategy});
  }));
})();
