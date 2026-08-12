(function(){
  const slider=document.querySelector('#hero-temperature');
  if(!slider)return;
  const out=document.querySelector('#hero-temperature-value');
  const selected=document.querySelector('[data-hero-selected]');
  const sampling=document.querySelector('#hero-sampling');
  const rows=[...document.querySelectorAll('[data-hero-prob]')];
  const lab=window.AhaFrame.createLab('token-playground');

  lab.subscribe(({state,derived})=>{
    out.textContent=state.temperature.toFixed(1);
    derived.candidates.slice(0,rows.length).forEach(({token,probability},i)=>{
      const row=rows[i];
      row.querySelector('[data-label]').textContent=token;
      row.querySelector('[data-value]').textContent=Math.round(probability*100)+'%';
      row.querySelector('.bar span').style.width=Math.max(2,probability*100)+'%';
    });
    selected.textContent=derived.selected.token;
  });

  slider.addEventListener('input',()=>{
    const temperature=Number(slider.value);
    lab.dispatch('SET_TEMPERATURE',{value:temperature});
    window.AhaFrame?.track('hero_temperature_changed',{temperature});
  });
  sampling?.addEventListener('change',()=>{
    lab.dispatch('SET_SAMPLING',{value:sampling.value});
    window.AhaFrame?.track('hero_sampling_changed',{strategy:sampling.value});
  });
})();
