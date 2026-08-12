(function(){
  const slider=document.querySelector('#temperature');
  if(!slider)return;
  const value=document.querySelector('#temperature-value');
  const selected=document.querySelector('[data-selected-token]');
  const prob=document.querySelector('[data-selected-prob]');
  const rows=[...document.querySelectorAll('[data-prob-row]')];
  const candidates=[['Paris',3.0],['Lyon',0.6114269475],['located',0.3276013718],['other',0.8128043982]];

  function distribution(temperature){
    if(temperature<=0.05)return [1,0,0];
    const scaled=candidates.map(([,logit])=>logit/temperature);
    const max=Math.max(...scaled);
    const exp=scaled.map(x=>Math.exp(x-max));
    const total=exp.reduce((a,b)=>a+b,0);
    return exp.map(x=>x/total);
  }

  function render(){
    const t=Number(slider.value);
    value.textContent=t.toFixed(2);
    const probs=distribution(t);
    candidates.slice(0,rows.length).forEach(([token],i)=>{
      const row=rows[i];
      const p=probs[i];
      row.querySelector('[data-label]').textContent=token;
      row.querySelector('[data-value]').textContent=p.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
      row.querySelector('.bar span').style.width=Math.max(2,p*100)+'%';
    });
    // Deterministic example for teaching: high temperature demonstrates that a lower-ranked token can be sampled.
    const pick=t>1.15?1:0;
    selected.textContent=candidates[pick][0];
    prob.textContent=probs[pick].toFixed(2);
  }

  slider.addEventListener('input',()=>{
    render();
    window.SeeAI?.track('interaction_slider_changed',{lesson:'token-playground',temperature:Number(slider.value)});
  });
  render();
})();
