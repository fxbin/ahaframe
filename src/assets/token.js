(function(){
  const slider=document.querySelector('#temperature');
  if(!slider)return;
  const value=document.querySelector('#temperature-value');
  const selected=document.querySelector('[data-selected-token]');
  const prob=document.querySelector('[data-selected-prob]');
  const rows=[...document.querySelectorAll('[data-prob-row]')];
  const lab=window.AhaFrame.createLab('token-playground');

  lab.subscribe(({state,derived})=>{
    value.textContent=state.temperature.toFixed(2);
    derived.candidates.slice(0,rows.length).forEach(({token,probability},i)=>{
      const row=rows[i];
      row.querySelector('[data-label]').textContent=token;
      row.querySelector('[data-value]').textContent=probability.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
      row.querySelector('.bar span').style.width=Math.max(2,probability*100)+'%';
    });
    selected.textContent=derived.selected.token;
    prob.textContent=derived.selected.probability.toFixed(2);
  });

  slider.addEventListener('input',()=>{
    const temperature=Number(slider.value);
    lab.dispatch('SET_TEMPERATURE',{value:temperature});
    window.AhaFrame?.track('interaction_slider_changed',{lesson:'token-playground',temperature});
  });
})();
